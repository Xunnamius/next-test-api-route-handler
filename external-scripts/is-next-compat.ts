// ! WARNING: don't run this in the real repo dir, but in a duplicate temp dir !

import debugFactory from 'debug';
import execa from 'execa';
import findPackageJson from 'find-package-json';
import { MongoClient } from 'mongodb';
import { satisfies as satisfiesRange, validRange } from 'semver';

import { name as pkgName, version as pkgVersion } from 'package.json';

import type { ExecaError } from 'execa';

// * By default, external scripts should be silent. Use the DEBUG environment
// * variable to see relevant output

const debug = debugFactory(`${pkgName}:is-next-compat`);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

/**
 * Detect if this tool was invoked in the context of an integration test
 */
const isRunningInTestMode = (async () => {
  if (isRunningInTestMode.memoized === undefined) {
    try {
      isRunningInTestMode.memoized =
        isRunningInTestMode.memoized ??
        (await execa('npm', ['run', '_is_next_compat_test_mode'])).exitCode === 0;
    } catch {}
  }

  debug(`test override mode: ${isRunningInTestMode.memoized ? 'ACTIVE' : 'inactive'}`);
  return (isRunningInTestMode.memoized = !!isRunningInTestMode.memoized);
}) as (() => Promise<boolean>) & { memoized?: boolean };

/**
 * Update remote DB with the new information so that the badge stays current.
 */
const setCompatFlagTo = async (version: string) => {
  try {
    if (await isRunningInTestMode()) {
      debug('skipped updating database (test override mode)');
    } else {
      const semverRange = process.env.NODE_TARGET_VERSION as string;
      debug(`saw potential semver range: ${semverRange}`);

      if (
        validRange(semverRange) &&
        !satisfiesRange(process.versions.node, semverRange)
      ) {
        debug(
          `skipped updating database (node version ${process.versions.node} not in range)`
        );
      } else {
        if (process.env.MONGODB_URI) {
          const client = await MongoClient.connect(process.env.MONGODB_URI);

          // ? Update database
          await client
            .db('pkg-compat')
            .collection('flags')
            .updateOne(
              { name: 'ntarh-next' },
              { $set: { value: version } },
              { upsert: true }
            );

          await client.close();

          debug(`updated database compat: "${version}"`);
        } else debug('skipped updating database (no MONGODB_URI)');
      }
    }
  } catch (error) {
    debug('additionally, an attempt to update the database failed');
    throw error;
  }
};

/**
 * Get the last version of Next.js that passed the most recent successful run of
 * is-next-compat.
 */
const getLastTestedVersion = async () => {
  let version = '';

  try {
    if (await isRunningInTestMode()) {
      debug('skipped database last tested version access (test override mode)');
    } else if (process.env.MONGODB_URI) {
      const client = await MongoClient.connect(process.env.MONGODB_URI);

      // ? Access database
      version =
        (
          await client
            .db()
            .collection<{ name: string; value: string }>('flags')
            .findOne({ name: 'ntarh-next' })
        )?.value || '';

      await client.close();
    } else debug('skipped database last tested version access (no MONGODB_URI)');
  } catch (error) {
    debug('database access failed');
    throw error;
  }

  debug('last tested version was ' + (version ? `"${version}"` : '(not tested)'));
  return version;
};

const execaWithDebug = (async (...args: Parameters<typeof execa>) => {
  try {
    const res = await execa(...args);
    debug.extend('stdout')(res.stdout);
    debug.extend('stderr')(res.stderr);
    return res;
  } catch (error) {
    const error_ =
      'npm test failed! The latest Next.js is incompatible with this package!';
    debug(error_);

    debug.extend('stdout')((error as ExecaError).stdout);
    debug.extend('stderr')((error as ExecaError).stderr);

    throw new Error(error_);
  }
}) as unknown as typeof execa;

/**
 * The is-next-compat runtime.
 *
 * This tool looks for a `_is_next_compat_test_mode` npm script with a zero exit
 * code. If found, no DB connections will be made. Should appear in integration
 * tests' package files to prevent those tests from making DB connections using
 * a project's (potentially production) .env values.
 *
 * ```
 * "scripts": {
 *   "_is_next_compat_test_mode": "true"
 * }
 * ```
 */
const invoked = async () => {
  debug('connecting to GitHub');

  if (!process.env.GH_TOKEN) debug('warning: not using a personal access token!');

  const { Octokit } = await import('@octokit/rest');

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
  debug(`using path: ${path}`);
  if (!path) throw new Error('could not find package.json');

  await getLastTestedVersion();

  debug(`installing next@${latestReleaseVersion} for unit tests`);
  debug(`(integration tests use their own Next.js versions)`);

  // ? Install peer deps manually for ancient node versions
  await execaWithDebug('npm', [
    'install',
    '--no-save',
    '--force',
    `next@${latestReleaseVersion}`,
    // !!!
    // TODO: need to remove the explicit react install after next@15 drops
    'react@19.0.0-rc-cd22717c-20241013'
  ]);

  debug('running compatibility tests');

  await execaWithDebug('npm', ['run', 'test:unit']);
  await execaWithDebug('npm', ['run', 'test:integration:client']);

  debug('test succeeded');

  await setCompatFlagTo(latestReleaseVersion);

  debug('execution complete');

  process.exitCode = 0;
};

export default invoked().catch((error: Error | string) => {
  debug.extend('error')(typeof error === 'string' ? error : error.message);
  process.exitCode = 2;
});
