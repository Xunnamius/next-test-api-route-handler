import { config as populateEnv } from 'dotenv'
import sjx from 'shelljs'
import findPackageJson from 'find-package-json'
import jsonEditor from 'edit-json-file'
import { main } from '../external-scripts/is-next-compat'

import _ from '@octokit/rest'
import __ from 'mongodb'
import ___ from 'isomorphic-json-fetch'

import type { JsonEditor } from 'edit-json-file'

sjx.config.silent = true;

global['mock_tag'] = global['mock_tag'] || '';
global['mock_updateOneFn'] = global['mock_updateOneFn'] || jest.fn();
global['mock_closeFn'] = global['mock_closeFn'] || jest.fn();
global['mock_fetchFn'] = global['mock_fetchFn'] || jest.fn();

jest.mock('@octokit/rest', () => ({
    Octokit: class {
        repos = {
            getLatestRelease: async () => ({
                data: {
                    tag_name: global['mock_tag']
                }
            })
        }
    }
}));

jest.mock('mongodb', () => ({
    MongoClient: {
        connect: async () => ({
            db: () => ({
                collection: () => ({
                    updateOne: global['mock_updateOneFn']
                })
            }),
            close: global['mock_closeFn']
        })
    }
}));

jest.mock('isomorphic-json-fetch', () => ({
    fetch: global['mock_fetchFn'] = global['mock_fetchFn'] || jest.fn()
}));

populateEnv();

const { value: realPkg } = findPackageJson(__dirname).next();

const originalPkg = {
    name: 'fake',
    version: '1.0.0',
    dependencies: { next: realPkg.dependencies.next }
};

let getState = (): { root: string, pkg: JsonEditor } => ({ root: null, pkg: null });
const setMockLatest = (tag: string) => global['mock_tag'] = tag;

beforeEach(async () => {
    const root = `${sjx.tempdir()}/next-test-api-route-handler-${Date.now()}`;
    const pkgJson = `${root}/package.json`;

    sjx.mkdir('-p', root);

    if(sjx.cd(root).code !== 0) {
        sjx.rm('-rf', root);
        throw new Error(`failed to mkdir/cd into ${root}`);
    }

    (new sjx.ShellString(JSON.stringify(originalPkg))).to(pkgJson);
    getState = () => ({ root, pkg: jsonEditor(pkgJson) });
});

afterEach(async () => {
    sjx.rm('-rf', getState().root);
});

describe('external-scripts/is-next-compat', () => {
    it('takes expected actions on failure', async () => {
        expect.hasAssertions();

        setMockLatest('8.1.0');
        getState().pkg.set('scripts.test', 'false').save();
        await expect(main()).rejects.toBeInstanceOf(Error);
        getState().pkg.unset('scripts').save();

        // ? No database updates
        expect(global['mock_updateOneFn']).not.toHaveBeenCalled()

        // ? Send email
        expect(global['mock_fetchFn']).toHaveBeenCalled();

        // ? Does not update package.json
        expect(getState().pkg.read()).toStrictEqual(originalPkg);
    });

    it('takes expected actions on success', async () => {
        expect.hasAssertions();

        setMockLatest(realPkg.dependencies.next);
        expect(await main()).toBe(true);

        // ? Update database
        expect(global['mock_updateOneFn']).toHaveBeenCalledWith(
            { compat: { $exists: true }},
            { $set: { compat: global['mock_tag'] }},
            { upsert: true }
        );

        // ? Close the database
        expect(global['mock_closeFn']).toHaveBeenCalled();

        // ? Updates package.json appropriately
        expect(getState().pkg.read()).toStrictEqual({
            ...originalPkg,
            config: { nextTestApiRouteHandler: { lastTestedVersion: realPkg.dependencies.next }}
        });

        // ? Exits early when latest version == last tested version
        expect(await main()).toBe(true);

        expect(global['mock_updateOneFn']).toHaveBeenCalledTimes(1);
        expect(global['mock_closeFn']).toHaveBeenCalledTimes(1);
    });
});
