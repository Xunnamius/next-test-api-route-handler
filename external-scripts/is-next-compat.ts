// ! WARNING: don't run this in the real repo dir, but in a duplicate temp dir !

import { getCurrentWorkingDirectory } from '@-xun/fs';
import { run } from '@-xun/run';
import findPackageJson from 'find-package-json';
import { MongoClient } from 'mongodb';
import { createDebugLogger } from 'rejoinder';
import { satisfies as satisfiesRange, validRange } from 'semver';

import { getNextjsReactPeerDependencies } from 'testverse:util.ts';

import { name as packageName, version as packageVersion } from 'package.json';

// * By default, external scripts should be silent. Use the DEBUG environment
// * variable to see relevant output

const debug = createDebugLogger({ namespace: `${packageName}:is-next-compat` });

debug(`pkgName: "${packageName}"`);
debug(`pkgVersion: "${packageVersion}"`);

export default main().catch((error: unknown) => {
  debug.error(error);
  process.exitCode = 2;
});

let isRunningInTestMode: boolean | undefined = undefined;

/**
 * Detect if this tool was invoked in the context of an integration test
 */
async function checkIfRunningInTestMode() {
  try {
    isRunningInTestMode =
      isRunningInTestMode ??
      (await run('npm', ['run', '_is_next_compat_test_mode'])).exitCode === 0;
  } catch {}

  debug(`test override mode: ${isRunningInTestMode ? 'ACTIVE' : 'inactive'}`);
  return !!isRunningInTestMode;
}

/**
 * Update remote DB with the new information so that the badge stays current.
 */
async function setCompatFlagTo(version: string) {
  try {
    if (await checkIfRunningInTestMode()) {
      debug('skipped updating database (test override mode)');
    } else {
      const semverRange = process.env.NODE_TARGET_VERSION!;
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
}

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
async function main() {
  debug('connecting to GitHub');

  if (!process.env.GH_TOKEN) debug('warning: not using a personal access token!');

  const { Octokit } = await import('@octokit/rest');

  const { repos } = new Octokit({
    auth: process.env.GH_TOKEN,
    userAgent: `${packageName}@${packageVersion}`
  });

  const {
    data: { tag_name: latestVersion }
  } = await repos.getLatestRelease({
    owner: 'vercel',
    repo: 'next.js'
  });

  const latestReleaseVersion = latestVersion.replace(/^v/, '');
  debug(`saw latest release version "${latestReleaseVersion}"`);

  if (!latestReleaseVersion) throw new Error('could not find latest Next.js version');

  const { filename: path } = findPackageJson(getCurrentWorkingDirectory()).next();
  debug(`using path: %O`, path);

  if (!path) {
    throw new Error('could not find package.json');
  }

  const nextVersionUnderTestFullNameAndVersion = `next@${latestReleaseVersion}`;

  debug('installing %O for unit tests', nextVersionUnderTestFullNameAndVersion);
  debug(`(integration tests use their own Next.js versions)`);

  // ? Install peer deps manually for Next.js
  const nextLatestReleaseVersionPeerDependencies = await getNextjsReactPeerDependencies(
    nextVersionUnderTestFullNameAndVersion
  );

  await run('npm', [
    'install',
    '--no-save',
    '--force',
    nextVersionUnderTestFullNameAndVersion,
    ...nextLatestReleaseVersionPeerDependencies
  ]);

  debug('running compatibility tests');

  await run('npm', ['run', 'test:unit']);
  await run('npm', ['run', 'test:integration:client']);

  debug('test succeeded');

  await setCompatFlagTo(latestReleaseVersion);

  debug('execution complete');

  process.exitCode = 0;
}
