import { name as pkgName, version as pkgVersion } from '../package.json';
import { Octokit } from '@octokit/rest';
import { dirname } from 'path';
import { MongoClient } from 'mongodb';
import findPackageJson from 'find-package-json';
import debugFactory from 'debug';
import execa from 'execa';

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
    // ? Update database
    if (process.env.MONGODB_URI) {
      const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true
      });

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
  } catch (e: unknown) {
    debug('additionally, an attempt to update the database failed');
    throw e;
  }
};

const getLastTestedVersion = async () => {
  let version = '';

  try {
    // ? Update database
    if (process.env.MONGODB_URI) {
      const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true
      });

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

  const { filename: path } = findPackageJson(process.cwd()).next();
  if (!path) throw new Error('could not find package.json');

  const dir = dirname(path);
  debug(`using path: ${dir}`);

  const lastTestedVersion = await getLastTestedVersion();

  if (latestReleaseVersion != lastTestedVersion) {
    debug(`installing next@${latestReleaseVersion}`);
    await execa('npm', ['install', '--no-save', 'next@${latest}']);

    try {
      debug('running compatibility tests');
      await execa('npm', ['run', 'test-unit']);
      await execa('npm', ['run', 'test-integration']);
    } catch (e) {
      const err =
        'npm test failed! The latest Next.js is incompatible with this package!';

      debug(err);
      // eslint-disable-next-line no-console
      console.log('node stdout: ', e.stdout);
      // eslint-disable-next-line no-console
      console.log('node stderr: ', e.stderr);

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
