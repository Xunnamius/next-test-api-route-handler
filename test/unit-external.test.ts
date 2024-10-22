import { Octokit } from '@octokit/rest';
import debugFactory from 'debug';
import execa from 'execa';
import findPackageJson from 'find-package-json';
import { MongoClient } from 'mongodb';
import { name as pkgName, version as pkgVersion } from 'package';

import { protectedImportFactory, withMockedEnv } from 'testverse/setup';

// TODO: fix this import
// @ts-expect-error: broken import from node10; needs fixing
import { asMockedFunction } from '@xunnamius/jest-types';

import type { Debugger } from 'debug';
import type { ExecaChildProcess } from 'execa';
import type { Collection, Db } from 'mongodb';

const EXTERNAL_PATH = '../external-scripts/is-next-compat';

jest.mock('debug');
jest.mock('@octokit/rest');
jest.mock('mongodb');
jest.mock('find-package-json');
jest.mock('execa');

const protectedImport = protectedImportFactory(EXTERNAL_PATH);
const mockedExeca = asMockedFunction(execa);
const mockedDebug = asMockedFunction<Debugger>();

const mockedFindPackageJson = asMockedFunction(findPackageJson);
const mockedOctokit = jest.mocked(Octokit);
const mockedOctokitGetLatestRelease =
  asMockedFunction<Octokit['repos']['getLatestRelease']>();

// eslint-disable-next-line jest/unbound-method
const mockedMongoConnect = asMockedFunction(MongoClient.connect);
const mockedMongoConnectClose = asMockedFunction<MongoClient['close']>();
const mockedMongoConnectDb = asMockedFunction<MongoClient['db']>();
const mockedMongoConnectDbCollection = asMockedFunction<Db['collection']>();
const mockedMongoConnectDbCollectionUpdateOne =
  asMockedFunction<Collection['updateOne']>();

let mockLatestRelease: string;

beforeEach(() => {
  mockLatestRelease = '';

  mockedDebug.extend =
    asMockedFunction<Debugger['extend']>().mockReturnValue(mockedDebug);
  asMockedFunction(debugFactory).mockReturnValue(mockedDebug);

  mockedFindPackageJson.mockImplementation(
    () =>
      ({
        next: () => ({ value: {}, filename: 'fake/package.json' })
      }) as unknown as ReturnType<typeof findPackageJson>
  );

  mockedExeca.mockImplementation(mockExecaImplementation);

  mockedOctokit.mockImplementation(
    () =>
      ({
        repos: {
          getLatestRelease: mockedOctokitGetLatestRelease
        }
      }) as unknown as Octokit
  );

  mockedOctokitGetLatestRelease.mockImplementation(() =>
    Promise.resolve({
      data: {
        tag_name: mockLatestRelease
      }
    } as unknown as ReturnType<typeof mockedOctokitGetLatestRelease>)
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

  mockLatestRelease = '100.99.0';
  await protectedImport({ expectedExitCode: 0 });

  expect(mockedDebug).toHaveBeenCalledWith('connecting to GitHub');
  expect(mockedExeca).toHaveBeenCalledWith(
    'npm',
    expect.arrayContaining([
      'install',
      `next@${mockLatestRelease}`,
      'react@4.5.6',
      'react-dom@4.5.6'
    ])
  );
});

it('handles thrown error objects', async () => {
  expect.hasAssertions();

  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => {
    throw new Error('problems!');
  });

  await protectedImport({ expectedExitCode: 2 });

  expect(mockedDebug).toHaveBeenCalledWith('problems!');
});

it('handles thrown string errors', async () => {
  expect.hasAssertions();

  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => {
    throw 'problems!';
  });

  await protectedImport({ expectedExitCode: 2 });

  expect(mockedDebug).toHaveBeenCalledWith('problems!');
});

it('handles setCompatFlagTo rejection', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionUpdateOne.mockImplementationOnce(() => {
        throw new Error('problems!');
      });

      await protectedImport({ expectedExitCode: 2 });

      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
        { name: 'ntarh-next' },
        { $set: { value: mockLatestRelease } },
        { upsert: true }
      );
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('handles missing package.json', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedFindPackageJson.mockImplementationOnce(
        () =>
          ({
            next: () => ({ value: {}, filename: null })
          }) as unknown as ReturnType<typeof findPackageJson>
      );

      await protectedImport({ expectedExitCode: 2 });
      expect(mockedFindPackageJson).toHaveBeenCalled();
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('handles missing latestRelease', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '';

      await protectedImport({ expectedExitCode: 2 });
      expect(mockedFindPackageJson).not.toHaveBeenCalled();
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('handles compatibility test failure', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';

      mockedExeca.mockImplementation((file: string, options: string[]) => {
        if (
          file === 'npm' &&
          options &&
          options[0] === 'run' &&
          options[1]?.endsWith('unit')
        ) {
          return Promise.reject({ stderr: 'bad!' }) as ExecaChildProcess<Buffer>;
        }

        return mockExecaImplementation(file, options);
      });

      await protectedImport({ expectedExitCode: 2 });

      expect(mockedExeca).not.toHaveBeenCalledWith('npm', [
        'run',
        'test:integration:client'
      ]);

      expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('failed!'));
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

      mockedExeca.mockImplementation((file: string, options: string[]) => {
        if (
          file === 'npm' &&
          options &&
          options[0] === 'run' &&
          options[1]?.endsWith('client')
        ) {
          return Promise.reject({ stderr: 'bad!' }) as ExecaChildProcess<Buffer>;
        }

        return mockExecaImplementation(file, options);
      });

      await protectedImport({ expectedExitCode: 2 });

      expect(mockedExeca).toHaveBeenCalledWith('npm', ['run', 'test:unit']);
      expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('failed!'));
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs without any environment variables', async () => {
  expect.hasAssertions();

  await withMockedEnv(async () => {
    mockLatestRelease = '100.100.0';

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
  }, {});
});

it('runs with version string prepended with "v"', async () => {
  expect.hasAssertions();

  await withMockedEnv(async () => {
    mockLatestRelease = 'v100.100.0';

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
  }, {});
});

it('respects NODE_TARGET_VERSION env variable', async () => {
  expect.hasAssertions();

  mockLatestRelease = '199.198.197';

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
      NODE_TARGET_VERSION: `${process.versions.node.split('.')[0]}.x`
    }
  );

  expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
    { name: 'ntarh-next' },
    { $set: { value: mockLatestRelease } },
    { upsert: true }
  );
});

it('respects _is_next_compat_test_mode npm script', async () => {
  expect.hasAssertions();

  mockLatestRelease = '111.112.113';

  mockedExeca.mockImplementation((file: string, options: string[]) => {
    if (
      file === 'npm' &&
      options &&
      options[0] === 'run' &&
      options[1] === '_is_next_compat_test_mode'
    ) {
      return Promise.resolve({ exitCode: 0 }) as ExecaChildProcess<Buffer>;
    }

    return mockExecaImplementation(file, options);
  });

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri' }
  );

  expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

  mockedExeca.mockImplementation((file: string, options: string[]) => {
    if (
      file === 'npm' &&
      options &&
      options[0] === 'run' &&
      options[1] === '_is_next_compat_test_mode'
    ) {
      return Promise.resolve({ exitCode: 1 }) as ExecaChildProcess<Buffer>;
    }

    return mockExecaImplementation(file, options);
  });

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri' }
  );

  expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalled();
});

it('uses GH_TOKEN environment variable if available', async () => {
  expect.hasAssertions();

  mockLatestRelease = '100.99.0';

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
      expect(mockedOctokit).toHaveBeenCalledWith({
        auth: 'fake-token',
        userAgent: `${pkgName}@${pkgVersion}`
      });
    },
    { GH_TOKEN: 'fake-token' }
  );
});

function mockExecaImplementation(file: string, options: string[]) {
  let dummyStdout: Record<string, string> | string[] | false = false;

  if (file === 'npm' && options && options[0] === 'show') {
    if (options[1] === 'react' || options[1] === 'react-dom') {
      dummyStdout = ['1.2.3', '2.3.4', '3.4.5', '4.5.6', '5.6.7'];
    } else if (options[1].startsWith('next@')) {
      dummyStdout = { react: '4.5.6', 'react-dom': '4.5.6' };
    } else {
      throw new Error('unable to generate dummy data result in test');
    }
  }

  return Promise.resolve(
    dummyStdout === false ? {} : { stdout: JSON.stringify(dummyStdout) }
  ) as unknown as ExecaChildProcess<Buffer>;
}
