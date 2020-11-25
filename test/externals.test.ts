/* eslint-disable no-var */
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

declare global {
    var mockTag: string;
    var mockUpdateOneFn: ReturnType<typeof jest.fn>;
    var mockFetchFn: ReturnType<typeof jest.fn>;
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
        }
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

jest.mock('isomorphic-json-fetch', () => {
    global.mockFetchFn = jest.fn();
    return { fetch: global.mockFetchFn };
});

populateEnv();

const { value: realPkg } = findPackageJson(__dirname).next();

if(typeof realPkg?.peerDependencies?.next != 'string')
    throw new Error('could not find Next.js peer dependency in package.json');

const originalPkg = {
    name: 'fake',
    version: '1.0.0',
    peerDependencies: { next: realPkg.peerDependencies.next }
};

let getState = (): {
    root: string,
    pkg: JsonEditor
} => ({ root: null as unknown as string, pkg: null as unknown as JsonEditor });

const setMockLatest = (tag: string) => global.mockTag = tag;

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
        expect(global.mockUpdateOneFn).not.toHaveBeenCalled()

        // ? Send email
        expect(global.mockFetchFn).toHaveBeenCalled();

        // ? Does not update package.json
        expect(getState().pkg.read()).toStrictEqual(originalPkg);
    });

    it('takes expected actions on success', async () => {
        expect.hasAssertions();

        const latest = realPkg.peerDependencies.next;

        // ? Satisfy TypeScript with a type guard
        if(!((o: string | undefined): o is string => typeof o == 'string')(latest)) {
            expect.fail('jest expects a "next" dependency in package.json');
            return;
        }

        setMockLatest(latest);
        expect(await main()).toBe(true);

        // ? Update database
        expect(global.mockUpdateOneFn).toHaveBeenCalledWith(
            { compat: { $exists: true }},
            { $set: { compat: global.mockTag }},
            { upsert: true }
        );

        // ? Close the database
        expect(global.mockCloseFn).toHaveBeenCalled();

        // ? Updates package.json appropriately
        expect(getState().pkg.read()).toStrictEqual({
            ...originalPkg,
            config: { nextTestApiRouteHandler: { lastTestedVersion: realPkg.peerDependencies.next }}
        });

        // ? Exits early when latest version == last tested version
        expect(await main()).toBe(true);

        expect(global.mockUpdateOneFn).toHaveBeenCalledTimes(1);
        expect(global.mockCloseFn).toHaveBeenCalledTimes(1);
    });
});
