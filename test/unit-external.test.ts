import { name as pkgName, version as pkgVersion } from 'package';
import { MongoClient } from 'mongodb';
import { Octokit } from '@octokit/rest';
import findPackageJson from 'find-package-json';
import execa from 'execa';
import debugFactory from 'debug';

import { asMockedFunction, protectedImportFactory, withMockedEnv } from './setup';

import type { ExecaChildProcess } from 'execa';
import type { Collection, Db } from 'mongodb';
import type { Debugger } from 'debug';

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
const mockedOctokit = Octokit as unknown as jest.Mock<Octokit>;
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
      } as unknown as ReturnType<typeof findPackageJson>)
  );

  mockedExeca.mockImplementation(() => Promise.resolve({}) as ExecaChildProcess<Buffer>);

  mockedOctokit.mockImplementation(
    () =>
      ({
        repos: {
          getLatestRelease: mockedOctokitGetLatestRelease
        }
      } as unknown as Octokit)
  );

  mockedOctokitGetLatestRelease.mockImplementation(() =>
    Promise.resolve({
      data: {
        tag_name: mockLatestRelease
      }
    } as unknown as ReturnType<typeof mockedOctokitGetLatestRelease>)
  );

  mockedMongoConnect.mockImplementation(() =>
    Promise.resolve({
      db: mockedMongoConnectDb,
      close: mockedMongoConnectClose
    })
  );

  mockedMongoConnectDb.mockImplementation(
    () => ({ collection: mockedMongoConnectDbCollection } as unknown as Db)
  );

  mockedMongoConnectDbCollection.mockImplementation(
    () =>
      ({
        findOne: mockedMongoConnectDbCollectionFindOne,
        updateOne: mockedMongoConnectDbCollectionUpdateOne
      } as unknown as Collection)
  );
});

it('calls invoker when imported', async () => {
  expect.hasAssertions();
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

      expect(mockedMongoConnectDbCollectionUpdateOne).toBeCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: mockLatestRelease } },
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

      expect(mockedMongoConnectDbCollectionFindOne).toBeCalledWith({
        compat: { $exists: true }
      });
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
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
          } as unknown as ReturnType<typeof findPackageJson>)
      );

      await protectedImport({ expectedExitCode: 2 });
      expect(mockedFindPackageJson).toBeCalled();
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
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

      expect(mockedExeca).toBeCalledTimes(4);
      expect(mockedDebug).toBeCalledWith(expect.stringContaining('failed!'));
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('skips running tests if latest version matches last tested version', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ compat: mockLatestRelease })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedExeca).toBeCalledTimes(1);
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
      expect(mockedMongoConnectDbCollectionFindOne).toBeCalledWith({
        compat: { $exists: true }
      });
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs tests if latest version does not match last tested version', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.99.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ compat: '99.100.0' })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedMongoConnectDbCollectionFindOne).toBeCalledWith({
        compat: { $exists: true }
      });
      expect(mockedExeca).toBeCalledTimes(4);
      expect(mockedMongoConnectDbCollectionUpdateOne).toBeCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: mockLatestRelease } },
        { upsert: true }
      );
    },
    { MONGODB_URI: 'fake-uri' }
  );
});

it('runs tests if last tested version is empty', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      mockLatestRelease = '100.100.0';
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
        Promise.resolve({ compat: '' })
      );

      await protectedImport({ expectedExitCode: 0 });

      expect(mockedMongoConnectDbCollectionFindOne).toBeCalledWith({
        compat: { $exists: true }
      });
      expect(mockedExeca).toBeCalledTimes(4);
      expect(mockedMongoConnectDbCollectionUpdateOne).toBeCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: mockLatestRelease } },
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
      Promise.resolve({ compat: '' })
    );

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedExeca).toBeCalledTimes(4);
    expect(mockedMongoConnectDbCollectionFindOne).not.toBeCalled();
    expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
  }, {});
});

it('runs with version string prepended with "v"', async () => {
  expect.hasAssertions();

  await withMockedEnv(async () => {
    mockLatestRelease = 'v100.100.0';
    mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
      Promise.resolve({ compat: '' })
    );

    await protectedImport({ expectedExitCode: 0 });

    expect(mockedExeca).toBeCalledTimes(4);
    expect(mockedMongoConnectDbCollectionFindOne).not.toBeCalled();
    expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
  }, {});
});

it('respects NODE_TARGET_VERSION env variable', async () => {
  expect.hasAssertions();

  mockLatestRelease = '199.198.197';
  mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() =>
    Promise.resolve({ compat: '' })
  );

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri', NODE_TARGET_VERSION: '1.x' }
  );

  expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    {
      MONGODB_URI: 'fake-uri',
      NODE_TARGET_VERSION: `${process.versions.node.split('.')[0]}.x`
    }
  );

  expect(mockedMongoConnectDbCollectionUpdateOne).toBeCalledWith(
    { compat: { $exists: true } },
    { $set: { compat: mockLatestRelease } },
    { upsert: true }
  );
});

it('respects IGNORE_LAST_TESTED_VERSION env variable', async () => {
  expect.hasAssertions();

  mockLatestRelease = '111.112.113';

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri', IGNORE_LAST_TESTED_VERSION: 'true' }
  );

  expect(mockedMongoConnectDbCollectionFindOne).not.toBeCalled();
  expect(mockedMongoConnectDbCollectionUpdateOne).toBeCalledWith(
    { compat: { $exists: true } },
    { $set: { compat: mockLatestRelease } },
    { upsert: true }
  );
});

it('respects npm_package_config_externals_test_mode=true', async () => {
  expect.hasAssertions();

  mockLatestRelease = '111.112.113';

  mockedExeca.mockImplementationOnce(
    () =>
      Promise.resolve({
        stdout: 'npm_package_config_externals_test_mode=true'
      }) as unknown as ExecaChildProcess<Buffer>
  );

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
    },
    { MONGODB_URI: 'fake-uri' }
  );

  expect(mockedMongoConnectDbCollectionFindOne).not.toBeCalled();
  expect(mockedMongoConnectDbCollectionUpdateOne).not.toBeCalled();
});

it('uses GH_TOKEN environment variable if available', async () => {
  expect.hasAssertions();

  await withMockedEnv(
    async () => {
      await protectedImport({ expectedExitCode: 0 });
      expect(mockedOctokit).toBeCalledWith({
        auth: 'fake-token',
        userAgent: `${pkgName}@${pkgVersion}`
      });
    },
    { GH_TOKEN: 'fake-token' }
  );
});
