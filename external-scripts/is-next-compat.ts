// ! WARNING: don't run this in the real repo dir, but in a duplicate temp dir !
import { name as pkgName, version as pkgVersion } from 'package';
import { Octokit } from '@octokit/rest';
import { dirname } from 'path';
import { MongoClient } from 'mongodb';
import { satisfies as satisfiesRange, validRange } from 'semver';
import findPackageJson from 'find-package-json';
import debugFactory from 'debug';
import execa from 'execa';

import type { ExecaError } from 'execa';

// * By default, external scripts should be silent. Use the DEBUG environment
// * variable to see relevant output

const debug = debugFactory(`${pkgName}:is-next-compat`);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

/**
 * Update remote DB with the new information so that the badge stays current
 */
const setCompatFlagTo = async (version: string) => {
  try {
    const semverRange = process.env.NODE_TARGET_VERSION as string;
    debug(`saw potential semver range: ${semverRange}`);

    if (validRange(semverRange) && !satisfiesRange(process.versions.node, semverRange)) {
      debug(`skipped updating database (node version does not satisfy semver range)`);
    } else {
      if (process.env.MONGODB_URI) {
        const client = await MongoClient.connect(process.env.MONGODB_URI);

        // ? Update database
        await client
          .db()
          .collection('flags')
          .updateOne(
            { compat: { $exists: true } },
            { $set: { compat: version } },
            { upsert: true }
          );

        await client.close();

        debug(`updated database compat: "${version}"`);
      } else debug('skipped updating database (no MONGODB_URI)');
    }
  } catch (e: unknown) {
    debug('additionally, an attempt to update the database failed');
    throw e;
  }
};

const getLastTestedVersion = async () => {
  let version = '';

  try {
    if (process.env.MONGODB_URI) {
      const client = await MongoClient.connect(process.env.MONGODB_URI);

      // ? Access database
      version =
        (
          await client
            .db()
            .collection<{ compat: string }>('flags')
            .findOne({ compat: { $exists: true } })
        )?.compat || '';

      await client.close();
    } else debug('skipped database last tested version check (no MONGODB_URI)');
  } catch (e) {
    debug('database access failed');
    throw e;
  }

  debug('last tested version was ' + (version ? `"${version}"` : '(not tested)'));
  return version;
};

const invoked = async () => {
  debug('connecting to GitHub');

  if (!process.env.GH_TOKEN) debug('warning: not using a personal access token!');

  const { repos } = new Octokit({
    auth: process.env.GH_TOKEN,
    userAgent: `${pkgName}@${pkgVersion}`
  });

  const {
    data: { tag_name: vlatest }
  } = await repos.getLatestRelease({
    owner: 'vercel',
    repo: 'next.js'
  });

  const latestReleaseVersion = vlatest.replace(/^v/, '');
  debug(`saw latest release version "${latestReleaseVersion}"`);
  if (!latestReleaseVersion) throw new Error('could not find latest Next.js version');

  const { filename: path } = findPackageJson(process.cwd()).next();
  if (!path) throw new Error('could not find package.json');

  const dir = dirname(path);
  debug(`using path: ${dir}`);

  const ignoreVersionCheck = process.env.IGNORE_LAST_TESTED_VERSION === 'true';
  const lastTestedVersion = ignoreVersionCheck ? null : await getLastTestedVersion();

  if (latestReleaseVersion !== lastTestedVersion) {
    debug(`version check: ${ignoreVersionCheck ? 'ignored' : 'release detected'}`);
    debug(`installing next@${latestReleaseVersion}`);
    await execa('npm', ['install', '--no-save', `next@${latestReleaseVersion}`]);

    try {
      debug('running compatibility tests');
      await execa('npm', ['run', 'test-unit']);
      await execa('npm', ['run', 'test-integration']);
    } catch (e) {
      const err =
        'npm test failed! The latest Next.js is incompatible with this package!';

      debug(err);

      debug('node stdout: ', (e as ExecaError).stdout);
      debug('node stderr: ', (e as ExecaError).stderr);

      throw new Error(err);
    }

    debug('test succeeded');

    await setCompatFlagTo(latestReleaseVersion);
  } else debug('no new release detected');

  debug('execution complete');
};

export default invoked().catch((e: Error | string) => {
  debug.extend('error')(typeof e == 'string' ? e : e.message);
  process.exit(2);
});
