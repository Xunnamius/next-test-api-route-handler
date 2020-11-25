/* eslint-disable no-console */
import { Octokit } from '@octokit/rest'
import sjx from 'shelljs'
import findPackageJson from 'find-package-json'
import jsonEditor from 'edit-json-file'
import { dirname } from 'path'
import { fetch } from 'isomorphic-json-fetch'
import { MongoClient } from 'mongodb'

sjx.config.silent = true;

/**
 * Update the cluster with the new information so that the badge stays current
 */
const setCompatFlagTo = async (version: string, isCLI: boolean) => {
    try {
        // ? Update database
        if(process.env.MONGODB_URI) {
            const client = await (MongoClient.connect(process.env.MONGODB_URI, {
                useUnifiedTopology: true
            }));

            await client.db().collection('flags').updateOne(
                { compat: { $exists: true }},
                { $set: { compat: version }},
                { upsert: true }
            );

            await client.close();

            isCLI && console.log(`[ updated database ]`);
        }

        else if(isCLI)
            console.log(`[ skipped updating database ]`);
    }

    catch(e: unknown) {
        if(isCLI) {
            console.warn('[ additionally, an attempt to update the database failed ]');
            console.warn(e);
        }
    }
};

export async function main(isCli = false) {
    let editPkg: ReturnType<typeof jsonEditor> & { revert?: (updateLastTestedVersion?: boolean) => void } | null = null;
    let error = false;

    try {
        isCli && console.log(`[ connecting to GitHub ]`);

        if(!process.env.GITHUB_PAT)
            isCli && console.warn(`warning: not using a personal access token!`);

        const { repos } = new Octokit({
            auth: process.env.GITHUB_PAT,
            userAgent: 'github.com/Xunnamius/next-test-api-route-handler is-next-compat'
        });

        const { data: { tag_name: vlatest }} = await repos.getLatestRelease({
            owner: 'vercel',
            repo: 'next.js'
        });

        const latest = vlatest.replace(/^v/, '');

        isCli && console.log(`[ saw latest release version "${latest}" ]`);

        const { value: pkg, filename: path } = findPackageJson(process.cwd()).next();

        if(!path || !pkg)
            throw new Error('could not find package.json');

        isCli && console.log(`[ using package.json @ "${path}" ]`);

        if(sjx.cd(dirname(path)).code !== 0)
            throw new Error('cd failed');

        const prev: string = pkg.config?.nextTestApiRouteHandler?.lastTestedVersion ?? '';
        const dist: string = pkg.peerDependencies?.next ?? '';

        if(!dist)
            throw new Error('could not find Next.js peer dependency in package.json')

        let called = false;
        editPkg = jsonEditor(path);

        isCli && console.log('[ last tested version was ' + (prev ? `"${prev}"` : '(not tested)') + ' ]');

        if(latest != prev) {
            editPkg.revert = (updateLastTestedVersion = false) => {
                if(called || !editPkg) return;

                called = true;

                try {
                    isCli && console.log(`[ restoring package.json ]`);

                    editPkg.set('peerDependencies.next', dist);
                    updateLastTestedVersion && editPkg.set('config.nextTestApiRouteHandler.lastTestedVersion', latest);
                    editPkg.save();

                    if(sjx.exec('npm install').code !== 0)
                        throw new Error('restorative npm install failed');

                    if(sjx.exec('npx Xunnamius/sort-package-json').code !== 0)
                        throw new Error('package.json sort failed');

                    isCli && console.log(`[ package.json restored ]`);
                }

                catch { throw new Error(`CRITICAL: attempt to restore package.json failed`) }
            };

            if(dist != latest) {
                isCli && console.log(`[ updating package.json ]`);

                editPkg.set('peerDependencies.next', latest);
                editPkg.save();

                if(sjx.exec('npm install').code !== 0)
                    throw new Error('initial npm install failed');
            }

            else if(isCli)
                console.log(`[ no changes to package.json are necessary ]`);

            isCli && console.log(`[ running compatibility test ]`);

            if(sjx.exec('npm test').code !== 0) {
                isCli && console.warn(`[ npm test failed! The latest Next.js is incompatible with this package ]`);

                try {
                    // ? Tell someone right away!
                    if(process.env.EMAILJS_USERID) {
                        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            body: {
                                service_id: 'dnr_xunn_io',
                                template_id: 'is_node_compat_failure',
                                user_id: String(process.env.EMAILJS_USERID) || '',
                                template_params: { timestring: (new Date()).toString() }
                            }
                        });

                        isCli && console.log(`[ sent alert email ]`);
                    }

                    else if(isCli)
                        console.log(`[ skipped sending alert email ]`);
                }

                catch(e: unknown) {
                    // ? The EmailJS api response ain't so pretty
                    if(isCli && !((e as Error)?.message?.startsWith('invalid json'))) {
                        console.warn('[ additionally, an attempt to send an email alert failed ]');
                        console.warn(e);
                    }
                }

                throw new Error('npm test failed');
            }

            isCli && console.log(`[ test succeeded ]`);
            await setCompatFlagTo(latest, isCli);
            editPkg.revert(true);
        }

        else isCli && console.log(`[ no new release detected ]`);

        isCli && console.log('[ execution complete ]');

        return true;
    }

    catch(e) {
        if(isCli) {
            console.error('FATAL', e);
            error = true;
        }

        // ? We either resolve to `true` or reject with e
        else throw new Error(e);
    }

    finally {
        editPkg?.revert?.();
        isCli && process.exit(Number(error));
    }
}

!module.parent && main(true);
