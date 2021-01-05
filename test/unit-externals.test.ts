/* eslint-disable no-var */
import { basename } from 'path';
import { name as pkgName } from '../package.json';
import { main as isNextCompat } from '../external-scripts/is-next-compat';
import { config as populateEnv } from 'dotenv';
import sjx from 'shelljs';
import jsonEditor from 'edit-json-file';
import Debug from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';

const debug = Debug(`${pkgName}:${basename(__filename).split('.').find(Boolean)}`);

import _ from '@octokit/rest';
import __ from 'mongodb';

import type { JsonEditor } from 'edit-json-file';

sjx.config.silent = true;

declare global {
  var mockTag: string;
  var mockUpdateOneFn: ReturnType<typeof jest.fn>;
  var mockCloseFn: ReturnType<typeof jest.fn>;
}

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

  return {
    MongoClient: {
      connect: async () => ({
        db: () => ({
          collection: () => ({
            updateOne: global.mockUpdateOneFn
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

beforeEach(async () => {
  const root = uniqueFilename(sjx.tempdir(), 'unit-externals');
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

afterEach(() => deleteRoot());

describe('next-test-api-route-handler [UNIT-EXTERNALS]', () => {
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

      // ? Does not update package.json
      expect(getState().pkg.read()).toStrictEqual(originalPkg);
    });

    it('takes expected actions on success', async () => {
      expect.hasAssertions();

      const latest = current;

      setMockLatest(latest);
      expect(await isNextCompat()).toBe(true);

      // ? Updates the database
      expect(global.mockUpdateOneFn).toHaveBeenCalledWith(
        { compat: { $exists: true } },
        { $set: { compat: global.mockTag } },
        { upsert: true }
      );

      // ? Closes the database
      expect(global.mockCloseFn).toHaveBeenCalled();

      // ? Updates package.json appropriately
      expect(getState().pkg.read()).toStrictEqual({
        ...originalPkg,
        config: { nextTestApiRouteHandler: { lastTestedVersion: latest } }
      });

      // ? Exits early when latest version == last tested version
      expect(await isNextCompat()).toBe(true);

      expect(global.mockUpdateOneFn).toHaveBeenCalledTimes(1);
      expect(global.mockCloseFn).toHaveBeenCalledTimes(1);
    });
  });
});
