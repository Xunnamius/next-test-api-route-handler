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
    let editPkg: ReturnType<typeof jsonEditor> | null = null;
    let error = false;

    try {
        isCli && console.log(`[ connecting to GitHub ]`);

        if(!process.env.GITHUB_PAT)
            isCli && console.warn(`warning: not using a personal access token!`);

        const { repos } = new Octokit({
            auth: process.env.GITHUB_PAT,
            userAgent: 'Xunnamius/next-test-api-route-handler/external-scripts/is-next-compat'
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

        const cd = sjx.cd(dirname(path));

        if(cd.code != 0)
            throw new Error(`cd failed: ${cd.stderr} ${cd.stdout}`);

        const prev: string = pkg.config?.nextTestApiRouteHandler?.lastTestedVersion ?? '';
        const dist: string = pkg.peerDependencies?.next ?? '';

        if(!dist)
            throw new Error('could not find Next.js peer dependency in package.json');

        editPkg = jsonEditor(path);

        isCli && console.log('[ last tested version was ' + (prev ? `"${prev}"` : '(not tested)') + ' ]');

        if(latest != prev) {
            if(dist != latest) {
                isCli && console.log(`[ installing next@${latest} ]`);

                const npmi = sjx.exec(`npm install --no-save next@${latest}`);

                if(npmi.code != 0)
                    throw new Error(`initial npm install failed: ${npmi.stderr} ${npmi.stdout}`);
            }

            else if(isCli)
                console.log(`[ no additional installation necessary ]`);

            isCli && console.log(`[ running compatibility test ]`);

            const test = sjx.exec('npm test');

            if(test.code != 0) {
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

                throw new Error(`npm test failed: ${test.stderr} ${test.stdout}`);
            }

            isCli && console.log(`[ test succeeded ]`);

            await setCompatFlagTo(latest, isCli);
            editPkg.set('config.nextTestApiRouteHandler.lastTestedVersion', latest);
            editPkg.save();
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
        isCli && process.exit(Number(error));
    }
}

!module.parent && main(true);
