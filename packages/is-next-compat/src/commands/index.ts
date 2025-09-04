import { getCurrentWorkingDirectory } from '@-xun/fs';
import { run, runNoRejectOnBadExit } from '@-xun/run';
import findPackageJson from 'find-package-json';
import { MongoClient } from 'mongodb';
import { createDebugLogger, createGenericLogger, SINGLE_SPACE } from 'rejoinder';
import { satisfies as satisfiesRange, validRange } from 'semver';

import { getNextjsReactPeerDependencies } from 'multiverse+shared';

import {
  name as ntarhPackageName,
  version as ntarhPackageVersion
} from 'rootverse:package.json';

import type { RootConfiguration } from '@black-flag/core';

const log = createGenericLogger({ namespace: 'is-next-compat' });
const debug = createDebugLogger({ namespace: 'is-next-compat' });

export const description: RootConfiguration['description'] = `
Runs tests to determine if the current version of NTARH is compatible with the current version of Next.js.

This tool additionally looks for a \`_is_next_compat_test_mode\` npm script with a zero exit code. If found, no DB connections will be made. Said script should appear in integration tests' package files to prevent those tests from making DB connections using a project's (potentially production) .env values.

Example:

{
${SINGLE_SPACE} "scripts": {
${SINGLE_SPACE}   "_is_next_compat_test_mode": "true"
${SINGLE_SPACE} }
}
`.trim();

export const handler: RootConfiguration['handler'] = async () => {
  const cwd = getCurrentWorkingDirectory();

  if (!process.env.CI && cwd.includes('/repos/next-test-api-route-handler')) {
    log.warn(
      'It is dangerous to run this CLI tool in the actual NTARH repository directory. Consider running this tool in a temporary clone instead'
    );
  }

  log(`internal NTARH package: ${ntarhPackageName}@${ntarhPackageVersion}`);
  log('connecting to GitHub');

  if (!process.env.GH_TOKEN) {
    log('warning: not using a personal access token!');
  }

  const { Octokit } = await import('@octokit/rest');

  const { repos } = new Octokit({
    auth: process.env.GH_TOKEN,
    userAgent: `${ntarhPackageName}@${ntarhPackageVersion}`
  });

  const {
    data: { tag_name: latestVersion }
  } = await repos.getLatestRelease({
    owner: 'vercel',
    repo: 'next.js'
  });

  const latestReleaseVersion = latestVersion.replace(/^v/, '');
  log(`saw latest release version "${latestReleaseVersion}"`);

  if (!latestReleaseVersion) {
    throw new Error('could not find latest Next.js version');
  }

  const { filename: path } = findPackageJson(getCurrentWorkingDirectory()).next();
  log(`using path: %O`, path);

  if (!path) {
    throw new Error('could not find package.json');
  }

  const nextVersionUnderTestFullNameAndVersion = `next@${latestReleaseVersion}`;

  log('installing %O for unit tests', nextVersionUnderTestFullNameAndVersion);
  log('(integration tests use their own Next.js versions)');

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

  log('attempting to repair node_modules after install using %O', 'npm run prepare');

  const { exitCode, all } = await runNoRejectOnBadExit('npm', ['run', 'prepare'], {
    all: true
  });

  if (exitCode !== 0) {
    debug.warn('%O command did not complete successfully: %O', 'npm run prepare', all);
  }

  log('running compatibility tests');

  await run('npm', ['run', 'test:packages:all']);

  log('test succeeded');

  await setCompatFlagTo(latestReleaseVersion);

  log('execution complete');
};

/**
 * Detect if this tool was invoked in the context of an integration test
 */
async function checkIfRunningInTestMode() {
  const isRunningInTestMode =
    (await runNoRejectOnBadExit('npm', ['run', '_is_next_compat_test_mode']))
      .exitCode === 0;

  log(`test override mode: ${isRunningInTestMode ? 'ACTIVE' : 'inactive'}`);
  return isRunningInTestMode;
}

/**
 * Update remote DB with the new information so that the badge stays current.
 */
async function setCompatFlagTo(version: string) {
  try {
    if (await checkIfRunningInTestMode()) {
      log('skipped updating database (test override mode)');
    } else {
      const semverRange = process.env.NODE_TARGET_VERSION;
      log(`saw potential semver range: ${semverRange ?? '(undefined)'}`);

      if (
        validRange(semverRange) &&
        !satisfiesRange(process.versions.node, semverRange!)
      ) {
        log(
          `skipped updating database (node version ${process.versions.node} not in range)`
        );
      } else {
        /* istanbul ignore next */
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

          log(`updated database compat: "${version}"`);
        } else log('skipped updating database (no MONGODB_URI)');
      }
    }
  } catch (error) {
    log.warn('an attempt to update the database failed');
    throw error;
  }
}
