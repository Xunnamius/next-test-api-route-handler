/* eslint-disable no-var */
process.env.MONGODB_URI = 'fake://fake/fake';

import { name as pkgName } from '../package.json';
import { main as isNextCompat } from '../external-scripts/is-next-compat';
import { config as populateEnv } from 'dotenv';
import type { JsonEditor } from 'edit-json-file';
import sjx from 'shelljs';
import jsonEditor from 'edit-json-file';
import debugFactory from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';
import _ from '@octokit/rest';
import __ from 'mongodb';

declare global {
  var mockTag: string;
  var mockPrevious: string;
  var mockUpdateOneFn: ReturnType<typeof jest.fn>;
  var mockFindOneFn: ReturnType<typeof jest.fn>;
  var mockCloseFn: ReturnType<typeof jest.fn>;
}

const TEST_IDENTIFIER = 'unit-externals';
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
sjx.config.silent = !process.env.DEBUG;

jest.mock('@octokit/rest', () => ({
  Octokit: class {
    repos = {
      getLatestRelease: async () => ({
        data: {
          tag_name: global.mockTag
        }
      })
    };
  }
}));

jest.mock('mongodb', () => {
  global.mockCloseFn = jest.fn();
  global.mockUpdateOneFn = jest.fn();
  global.mockFindOneFn = jest.fn(() => ({ compat: global.mockPrevious || '' }));

  return {
    MongoClient: {
      connect: async () => ({
        db: () => ({
          collection: () => ({
            updateOne: global.mockUpdateOneFn,
            findOne: global.mockFindOneFn
          })
        }),
        close: global.mockCloseFn
      })
    }
  };
});

populateEnv();

const current = sjx.exec("npm list --depth=0 | grep -oP '(?<= next@).*$'").stdout;

if (!/\d+\.\d+\.[0-9a-z\-.]+/.test(current))
  throw new Error(`could not resolve current Next.js version (saw "${current}")`);

const originalPkg = {
  name: 'fake',
  version: '1.0.0',
  peerDependencies: { next: current },
  scripts: { 'test-unit': 'true', 'test-integration': 'true' }
};

let getState = (): {
  root: string;
  pkg: JsonEditor;
} => ({ root: (null as unknown) as string, pkg: (null as unknown) as JsonEditor });

let deleteRoot: () => Promise<void>;
const setMockLatest = (tag: string) => (global.mockTag = tag);
const setMockPrevious = (prev: string) => (global.mockPrevious = prev);

beforeEach(async () => {
  const root = uniqueFilename(sjx.tempdir(), TEST_IDENTIFIER);
  const pkgJson = `${root}/package.json`;

  deleteRoot = async () => {
    sjx.cd('..');
    debug(`forcibly removing dir ${root}`);
    await del(root);
  };

  sjx.mkdir('-p', root);
  const cd = sjx.cd(root);

  if (cd.code != 0) {
    await deleteRoot();
    throw new Error(`failed to mkdir/cd into ${root}: ${cd.stderr} ${cd.stdout}`);
  } else debug(`created temp root dir: ${root}`);

  new sjx.ShellString(JSON.stringify(originalPkg)).to(pkgJson);
  getState = () => ({ root, pkg: jsonEditor(pkgJson) });
});

afterEach(async () => {
  jest.clearAllMocks();
  await deleteRoot();
});

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  describe('/is-next-compat', () => {
    it('takes expected actions on failure', async () => {
      expect.hasAssertions();

      setMockLatest('8.1.0');
      getState().pkg.set('scripts.test-unit', 'false').save();
      await expect(isNextCompat()).rejects.toBeInstanceOf(Error);
      getState().pkg.set('scripts.test-integration', 'false').save();
      await expect(isNextCompat()).rejects.toBeInstanceOf(Error);
      getState().pkg.set('scripts.test-unit', 'true').save();
      await expect(isNextCompat()).rejects.toBeInstanceOf(Error);
      getState().pkg.set('scripts.test-unit', originalPkg.scripts['test-unit']).save();
      getState()
        .pkg.set('scripts.test-integration', originalPkg.scripts['test-integration'])
        .save();

      // ? No database updates
      expect(global.mockUpdateOneFn).not.toHaveBeenCalled();
    });

    it('takes expected actions on success', async () => {
      expect.hasAssertions();

      const latest = current;

      setMockLatest(latest);
      expect(await isNextCompat()).toBe(true);

      expect(global.mockFindOneFn).toHaveBeenCalled();

      // ? Updates the database
      expect(global.mockUpdateOneFn).toHaveBeenCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: global.mockTag } },
        { upsert: true }
      );

      // ? Closes the database
      expect(global.mockCloseFn).toHaveBeenCalledTimes(2);

      // ? Exits early when latest version == last tested version
      setMockPrevious(latest);
      expect(await isNextCompat()).toBe(true);

      expect(global.mockFindOneFn).toHaveBeenCalledTimes(2);
      expect(global.mockUpdateOneFn).toHaveBeenCalledTimes(1);
      expect(global.mockCloseFn).toHaveBeenCalledTimes(3);
    });
  });
});
