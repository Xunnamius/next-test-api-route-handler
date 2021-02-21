import { name as pkgName } from '../package.json';
import { main as isNextCompat } from '../external-scripts/is-next-compat';
import { asMockedFunction } from './setup';
import { MongoClient } from 'mongodb';
import { Octokit } from '@octokit/rest';
import findPackageJson from 'find-package-json';
import sjx from 'shelljs';

import type { ShellString } from 'shelljs';
import type { FoundPackage } from 'find-package-json';
import type { Collection, Db } from 'mongodb';

const TEST_IDENTIFIER = 'unit-externals';

jest.mock('@octokit/rest');
jest.mock('mongodb');
jest.mock('find-package-json');
jest.mock('shelljs');

const mockedSjx = (sjx as unknown) as jest.Mocked<typeof sjx>;
const mockedFindPackageJson = asMockedFunction(findPackageJson);
const mockedOctokit = (Octokit as unknown) as jest.Mock<Octokit>;
const mockedOctokitGetLatestRelease = asMockedFunction<
  Octokit['repos']['getLatestRelease']
>();
const mockedMongoConnect = asMockedFunction(MongoClient.connect);
const mockedMongoConnectClose = asMockedFunction<MongoClient['close']>();
const mockedMongoConnectDb = asMockedFunction<MongoClient['db']>();
const mockedMongoConnectDbCollection = asMockedFunction<Db['collection']>();
const mockedMongoConnectDbCollectionFindOne = asMockedFunction<Collection['findOne']>();
const mockedMongoConnectDbCollectionUpdateOne = asMockedFunction<
  Collection['updateOne']
>();

let mockLatestRelease: string;
let mockExecReturnCode: number;
let mockCdReturnCode: number;

mockedSjx.cd = jest.fn(() => ({ code: mockCdReturnCode } as ShellString));
// @ts-expect-error force assignment
mockedSjx.exec = jest.fn(() => ({ code: mockExecReturnCode } as ShellString));

mockedFindPackageJson.mockImplementation(() => ({
  next: () => (({ value: {}, filename: 'fake/package.json' } as unknown) as FoundPackage)
}));

mockedOctokit.mockImplementation(
  () =>
    (({
      repos: {
        getLatestRelease: mockedOctokitGetLatestRelease
      }
    } as unknown) as Octokit)
);

mockedOctokitGetLatestRelease.mockImplementation(() =>
  Promise.resolve(({
    data: {
      tag_name: mockLatestRelease
    }
  } as unknown) as ReturnType<typeof mockedOctokitGetLatestRelease>)
);

mockedMongoConnect.mockImplementation(() =>
  Promise.resolve({
    db: mockedMongoConnectDb,
    close: mockedMongoConnectClose
  })
);

mockedMongoConnectDb.mockImplementation(
  () => (({ collection: mockedMongoConnectDbCollection } as unknown) as Db)
);

mockedMongoConnectDbCollection.mockImplementation(
  () =>
    (({
      findOne: mockedMongoConnectDbCollectionFindOne,
      updateOne: mockedMongoConnectDbCollectionUpdateOne
    } as unknown) as Collection)
);

beforeEach(() => {
  mockCdReturnCode = 0;
  mockExecReturnCode = 0;
  mockLatestRelease = '';
  process.env.MONGODB_URI = 'fake://fake/fake';
  process.env.GH_TOKEN = 'fake-token';
});

afterEach(() => {
  jest.clearAllMocks();
});

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  describe('/is-next-compat', () => {
    it('takes expected actions on failure', async () => {
      expect.hasAssertions();

      mockLatestRelease = '100.99.0';
      mockExecReturnCode = 1;

      await expect(isNextCompat()).rejects.toBeInstanceOf(Error);

      expect(mockedSjx.cd).toBeCalledTimes(1);
      expect(mockedSjx.exec).toBeCalledTimes(1);
      expect(mockedMongoConnectDbCollectionUpdateOne).not.toHaveBeenCalled();

      mockExecReturnCode = 0;
      await expect(isNextCompat()).not.toReject();
    });

    it('takes expected actions on success', async () => {
      expect.hasAssertions();

      mockLatestRelease = '100.99.0';
      // ? Latest tested version is blank
      expect(await isNextCompat()).toBe(true);

      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalled();

      // ? Updates the database
      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: mockLatestRelease } },
        { upsert: true }
      );

      // ? Closes the database
      expect(mockedMongoConnectClose).toHaveBeenCalledTimes(2);

      // ? Latest tested version is `mockLatestRelease`
      mockedMongoConnectDbCollectionFindOne.mockImplementationOnce(() => ({
        compat: mockLatestRelease
      }));
      expect(await isNextCompat()).toBe(true);

      expect(mockedMongoConnectDbCollectionFindOne).toHaveBeenCalledTimes(2);
      expect(mockedMongoConnectDbCollectionUpdateOne).toHaveBeenCalledTimes(1);
      expect(mockedMongoConnectClose).toHaveBeenCalledTimes(3);
    });
  });
});
