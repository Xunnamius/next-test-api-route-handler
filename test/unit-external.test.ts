import { toAbsolutePath } from '@-xun/fs';
import * as xrun from '@-xun/run';
import { Octokit } from '@octokit/rest';
import findPackageJson from 'find-package-json';
import { MongoClient } from 'mongodb';

import { name as packageName, version as packageVersion } from 'rootverse:package.json';

import {
  asMocked,
  protectedImportFactory,
  withMockedEnv,
  withMockedOutput
} from 'testverse:util.ts';

import type { RunReturnType } from '@-xun/run';
import type { Collection, Db } from 'mongodb';

const EXTERNAL_PATH = toAbsolutePath(
  __dirname,
  '..',
  'external-scripts',
  // ? We don't add the extension on purpose :)
  'is-next-compat'
);

jest.mock('@octokit/rest');
jest.mock('mongodb');
jest.mock('find-package-json');
jest.mock('@-xun/run');

const protectedImport = protectedImportFactory(EXTERNAL_PATH);
const mockedRun = asMocked(xrun.run);
const mockedRunNoRejectOnBadExit = asMocked(xrun.runNoRejectOnBadExit);

const mockedFindPackageJson = asMocked(findPackageJson);
const mockedOctokit = jest.mocked(Octokit);
const mockedOctokitGetLatestRelease = asMocked<Octokit['repos']['getLatestRelease']>();

// eslint-disable-next-line jest/unbound-method
const mockedMongoConnect = asMocked(MongoClient.connect);
const mockedMongoConnectClose = asMocked<MongoClient['close']>();
const mockedMongoConnectDb = asMocked<MongoClient['db']>();
const mockedMongoConnectDbCollection = asMocked<Db['collection']>();
const mockedMongoConnectDbCollectionUpdateOne = asMocked<Collection['updateOne']>();

let mockLatestRelease: string;

beforeEach(() => {
  mockLatestRelease = '';

  mockedFindPackageJson.mockImplementation(
    () =>
      ({
        next: () => ({ value: {}, filename: 'fake/package.json' })
      }) as unknown as ReturnType<typeof findPackageJson>
  );

  mockedRun.mockImplementation(baseMockRunImplementation);
  mockedRunNoRejectOnBadExit.mockImplementation(baseMockRunImplementation);

  mockedOctokit.mockImplementation(
    () =>
      ({
        repos: { getLatestRelease: mockedOctokitGetLatestRelease }
      }) as unknown as Octokit
  );

  mockedOctokitGetLatestRelease.mockImplementation(() =>
    Promise.resolve({ data: { tag_name: mockLatestRelease } } as unknown as ReturnType<
      typeof mockedOctokitGetLatestRelease
    >)
  );

  mockedMongoConnect.mockImplementation(() => {
    return Promise.resolve({
      db: mockedMongoConnectDb,
      close: mockedMongoConnectClose
    }) as unknown as Promise<MongoClient>;
  });

  mockedMongoConnectDb.mockImplementation(
    () => ({ collection: mockedMongoConnectDbCollection }) as unknown as Db
  );

  mockedMongoConnectDbCollection.mockImplementation(() => {
    return {
      updateOne: mockedMongoConnectDbCollectionUpdateOne
    } as unknown as Collection;
  });
});

it('calls invoker and installs next.js peer dependencies explicitly when imported', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    mockLatestRelease = '100.99.0';

    await protectedImport({ expectedExitCode: 0 });

    expect(nodeLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('connecting to GitHub')
    );

    expect(mockedRun).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining([
        'install',
        `next@${mockLatestRelease}`,
        'react@4.5.6',
        'react-dom@4.5.6'
      ])
    );
  });
});

it('handles thrown error objects', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    mockedOctokitGetLatestRelease.mockImplementationOnce(() => {
      throw new Error('problems!');
    });

    await protectedImport({ expectedExitCode: 2 });

    expect(nodeErrorSpy).toHaveBeenCalledWith(expect.stringContaining('problems!'));
    expect(nodeLogSpy).toHaveBeenCalled();
  });
});

it('handles thrown string errors', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    mockedOctokitGetLatestRelease.mockImplementationOnce(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'problems!';
    });

    await protectedImport({ expectedExitCode: 2 });

    expect(nodeErrorSpy).toHaveBeenCalledWith(expect.stringContaining('problems!'));
    expect(nodeLogSpy).toHaveBeenCalled();
  });
});

it('handles setCompatFlagTo rejection', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    await withMockedEnv(
      async () => {
        mockLatestRelease = '100.99.0';

        mockedMongoConnectDbCollectionUpdateOne.mockImplementationOnce(() => {
          throw new Error('problems!');
        });

        pretendWereNotRunningInTestMode();

        await protectedImport({ expectedExitCode: 2 });

        expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
          { name: 'ntarh-next' },
          { $set: { value: mockLatestRelease } },
          { upsert: true }
        );

        expect(nodeLogSpy).toHaveBeenCalled();
        expect(nodeErrorSpy).toHaveBeenCalledWith(expect.stringContaining('problems!'));
      },
      { MONGODB_URI: 'fake-uri' }
    );
  });
});

it('handles missing package.json', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    await withMockedEnv(
      async () => {
        mockLatestRelease = '100.99.0';
        mockedFindPackageJson.mockImplementationOnce(
          () =>
            ({ next: () => ({ value: {}, filename: null }) }) as unknown as ReturnType<
              typeof findPackageJson
            >
        );

        await protectedImport({ expectedExitCode: 2 });

        expect(mockedFindPackageJson).toHaveBeenCalled();
        expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

        expect(nodeLogSpy).toHaveBeenCalled();
        expect(nodeErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('could not find package.json')
        );
      },
      { MONGODB_URI: 'fake-uri' }
    );
  });
});

it('handles missing latestRelease', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    await withMockedEnv(
      async () => {
        mockLatestRelease = '';

        await protectedImport({ expectedExitCode: 2 });

        expect(mockedFindPackageJson).not.toHaveBeenCalled();
        expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

        expect(nodeLogSpy).toHaveBeenCalled();
        expect(nodeErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('could not find latest Next.js version')
        );
      },
      { MONGODB_URI: 'fake-uri' }
    );
  });
});

it('handles compatibility test failure', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy, nodeErrorSpy }) => {
    await withMockedEnv(
      async () => {
        mockLatestRelease = '100.99.0';

        mockedRun.mockImplementation(async (file: string, args?: string[]) => {
          if (file === 'npm' && args?.[0] === 'run' && args[1]?.endsWith('all')) {
            return Promise.reject({ stderr: 'bad!' }) as unknown as RunReturnType;
          }

          return baseMockRunImplementation(file, args);
        });

        await protectedImport({ expectedExitCode: 2 });

        expect(nodeLogSpy).not.toHaveBeenCalledWith('test succeeded');
        expect(nodeErrorSpy).toHaveBeenCalledWith(expect.stringContaining('bad!'));
        expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
      },
      { MONGODB_URI: 'fake-uri' }
    );
  });
});

it('runs without any environment variables', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    await withMockedEnv(async () => {
      mockLatestRelease = '100.100.0';

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
      expect(nodeLogSpy).toHaveBeenLastCalledWith(
        expect.stringContaining('execution complete')
      );
    }, {});
  });
});

it('runs with version string prepended with "v"', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    await withMockedEnv(async () => {
      mockLatestRelease = 'v100.100.0';

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
      expect(nodeLogSpy).toHaveBeenLastCalledWith(
        expect.stringContaining('execution complete')
      );
    }, {});
  });
});

it('respects NODE_TARGET_VERSION env variable', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    mockLatestRelease = '199.198.197';

    pretendWereNotRunningInTestMode();

    await withMockedEnv(
      async () => {
        await protectedImport({ expectedExitCode: 0 });
      },
      { MONGODB_URI: 'fake-uri', NODE_TARGET_VERSION: '1.x' }
    );

    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

    await withMockedEnv(
      async () => {
        await protectedImport({ expectedExitCode: 0 });
      },
      {
        MONGODB_URI: 'fake-uri',
        NODE_TARGET_VERSION: `${process.versions.node.split('.')[0]!}.x`
      }
    );

    expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
      { name: 'ntarh-next' },
      { $set: { value: mockLatestRelease } },
      { upsert: true }
    );

    expect(nodeLogSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('execution complete')
    );
  });
});

it('respects _is_next_compat_test_mode npm script', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    mockLatestRelease = '111.112.113';

    await withMockedEnv(
      async () => {
        await protectedImport({ expectedExitCode: 0 });
      },
      { MONGODB_URI: 'fake-uri' }
    );

    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

    pretendWereNotRunningInTestMode();

    await withMockedEnv(
      async () => {
        await protectedImport({ expectedExitCode: 0 });
      },
      { MONGODB_URI: 'fake-uri' }
    );

    expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalled();
    expect(nodeLogSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('execution complete')
    );
  });
});

it('uses GH_TOKEN environment variable if available', async () => {
  expect.hasAssertions();

  await withMockedOutput(async ({ nodeLogSpy }) => {
    await withMockedEnv(
      async () => {
        mockLatestRelease = '100.99.0';

        await protectedImport({ expectedExitCode: 0 });

        expect(mockedOctokit).toHaveBeenCalledWith({
          auth: 'fake-token',
          userAgent: `${packageName}@${packageVersion}`
        });

        expect(nodeLogSpy).toHaveBeenLastCalledWith(
          expect.stringContaining('execution complete')
        );
      },
      { GH_TOKEN: 'fake-token' }
    );
  });
});

function baseMockRunImplementation(
  ...[file, args]: Parameters<typeof xrun.run>
): ReturnType<typeof xrun.run>;
function baseMockRunImplementation(
  ...[file, args]: Parameters<typeof xrun.runNoRejectOnBadExit>
): ReturnType<typeof xrun.runNoRejectOnBadExit>;
function baseMockRunImplementation(...[file, args]: Parameters<typeof xrun.run>) {
  let dummyStdout: Record<string, string> | string[] | false = false;

  if (file === 'npm' && args?.[0] === 'show') {
    if (args[1] === 'react' || args[1] === 'react-dom') {
      dummyStdout = ['1.2.3', '2.3.4', '3.4.5', '4.5.6', '5.6.7'];
    } else if (args[1]?.startsWith('next@')) {
      dummyStdout = { react: '4.5.6', 'react-dom': '4.5.6' };
    } else {
      throw new Error('unable to generate dummy data result in test');
    }
  }

  return Promise.resolve(
    Object.assign(
      { exitCode: 0 },
      dummyStdout === false ? {} : { stdout: JSON.stringify(dummyStdout) }
    )
  ) as unknown as Promise<RunReturnType>;
}

function pretendWereNotRunningInTestMode() {
  mockedRunNoRejectOnBadExit.mockImplementation(
    async (
      file: string,
      args?: string[]
    ): ReturnType<typeof xrun.runNoRejectOnBadExit> => {
      if (file === 'npm' && args?.[0] === 'run' && args[1]?.endsWith('_mode')) {
        return Promise.resolve({ exitCode: 1 }) as ReturnType<
          typeof xrun.runNoRejectOnBadExit
        >;
      }

      return baseMockRunImplementation(file, args) as ReturnType<
        typeof xrun.runNoRejectOnBadExit
      >;
    }
  );
}
