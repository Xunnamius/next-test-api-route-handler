// TODO:
// @ts-expect-error: remove this comment once we switch to the unified config
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
const mockedMongoConnectDbCollectionFindOne = asMockedFunction<Collection['findOne']>();
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

  mockedExeca.mockImplementation(() => Promise.resolve({}) as ExecaChildProcess<Buffer>);

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

  mockedMongoConnectDbCollection.mockImplementation(
    () =>
      ({
        findOne: mockedMongoConnectDbCollectionFindOne,
        updateOne: mockedMongoConnectDbCollectionUpdateOne
      }) as unknown as Collection
  );
});

it('calls invoker when imported', async () => {
  expect.hasAssertions();

  mockLatestRelease = '100.99.0';
  await protectedImport({ expectedExitCode: 0 });

  expect(mockedDebug).toHaveBeenNthCalledWith(3, 'connecting to GitHub');
});

it('handles thrown error objects', async () => {
  expect.hasAssertions();

  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => {
    throw new Error('problems!');
  });

  await protectedImport({ expectedExitCode: 2 });

  expect(mockedDebug).toHaveBeenNthCalledWith(4, 'problems!');
});

it('handles thrown string errors', async () => {
  expect.hasAssertions();

  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => undefined);
  mockedDebug.mockImplementationOnce(() => {
    throw 'problems!';
  });

  await protectedImport({ expectedExitCode: 2 });

  expect(mockedDebug).toHaveBeenNthCalledWith(4, 'problems!');
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

it('handles getLastTestedVersion rejection', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() => {
        throw new Error('problems!');
      });

      await protectedImport({ expectedExitCode: 2 });

      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalledWith({
        name: 'ntarh-next'
      });
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
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

      mockedExeca.mockImplementationOnce(
        () => Promise.resolve({}) as ExecaChildProcess<Buffer>
      );
      mockedExeca.mockImplementationOnce(
        () => Promise.resolve({}) as ExecaChildProcess<Buffer>
      );
      mockedExeca.mockImplementationOnce(
        () => Promise.resolve({}) as ExecaChildProcess<Buffer>
      );
      mockedExeca.mockImplementationOnce(
        () => Promise.reject({ stderr: 'bad!' }) as ExecaChildProcess<Buffer>
      );

      await protectedImport({ expectedExitCode: 2 });

      expect(mockedExeca).toHaveBeenCalledTimes(4);
      expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('failed!'));
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs tests regardless of latest version #1', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ name: 'ntarh-next', value: mockLatestRelease })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedExeca).toHaveBeenCalledTimes(4);
      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalledWith({
        name: 'ntarh-next'
      });
      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
        { name: 'ntarh-next' },
        { $set: { value: mockLatestRelease } },
        { upsert: true }
      );
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs tests regardless of latest version #2', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ name: 'ntarh-next', value: '99.100.0' })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedExeca).toHaveBeenCalledTimes(4);
      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalledWith({
        name: 'ntarh-next'
      });
      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
        { name: 'ntarh-next' },
        { $set: { value: mockLatestRelease } },
        { upsert: true }
      );
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs tests regardless of latest version #3', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.100.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ name: 'ntarh-next', value: '0.0.0' })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalledWith({
        name: 'ntarh-next'
      });
      expect(mockedExeca).toHaveBeenCalledTimes(4);
      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
        { name: 'ntarh-next' },
        { $set: { value: mockLatestRelease } },
        { upsert: true }
      );
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs without any environment variables', async () => {
  expect.hasAssertions();

  await withMockedEnv(async () => {
    mockLatestRelease = '100.100.0';
    mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
      Promise.resolve({ name: 'ntarh-next', value: '0.0.0' })
    );

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedExeca).toHaveBeenCalledTimes(4);
    expect(mockedMongoConnectDbCollectionFindOne).not.toHaveBeenCalled();
    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
  }, {});
});

it('runs with version string prepended with "v"', async () => {
  expect.hasAssertions();

  await withMockedEnv(async () => {
    mockLatestRelease = 'v100.100.0';
    mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
      Promise.resolve({ name: 'ntarh-next', value: '0.0.0' })
    );

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedExeca).toHaveBeenCalledTimes(4);
    expect(mockedMongoConnectDbCollectionFindOne).not.toHaveBeenCalled();
    expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();
  }, {});
});

it('respects NODE_TARGET_VERSION env variable', async () => {
  expect.hasAssertions();

  mockLatestRelease = '199.198.197';
  mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
    Promise.resolve({ name: 'ntarh-next', value: '0.0.0' })
  );

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

  mockedExeca.mockImplementationOnce(
    () => Promise.resolve({ exitCode: 0 }) as unknown as ExecaChildProcess<Buffer>
  );

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri' }
  );

  expect(mockedMongoConnectDbCollectionFindOne).not.toHaveBeenCalled();
  expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

  mockedExeca.mockImplementationOnce(
    () => Promise.resolve({ exitCode: 1 }) as unknown as ExecaChildProcess<Buffer>
  );

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri' }
  );

  expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalled();
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
