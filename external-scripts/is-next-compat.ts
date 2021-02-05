import { dirname } from 'path';
import { name as pkgName } from '../package.json';
import { Octokit } from '@octokit/rest';
import { MongoClient } from 'mongodb';
import sjx from 'shelljs';
import findPackageJson from 'find-package-json';
import debugFactory from 'debug';

const TEST_IDENTIFIER = `${pkgName}:is-next-compat`;

sjx.config.silent = !process.env.DEBUG;

export async function main(isCli = false) {
  const debug = debugFactory(TEST_IDENTIFIER);
  // ? Print debug messages to stdout if isCli == true
  // eslint-disable-next-line no-console
  debug.log = (...args) => void console[isCli ? 'log' : 'error'](...args);

  if (isCli && !process.env.DEBUG) debugFactory.enable(TEST_IDENTIFIER);

  /**
   * Update the cluster with the new information so that the badge stays current
   */
  const setCompatFlagTo = async (version: string) => {
    try {
      // ? Update database
      if (process.env.MONGODB_URI) {
        if (!process.env.NO_DB_UPDATE) {
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
        } else debug('(NO_DB_UPDATE in effect)');

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
    } catch (e: unknown) {
      debug('database access failed');
      throw e;
    }

    debug('last tested version was ' + (version ? `"${version}"` : '(not tested)') + '');
    return version;
  };

  let error = false;

  try {
    debug('connecting to GitHub');

    if (!process.env.GH_TOKEN)
      isCli && debug('warning: not using a personal access token!');

    const { repos } = new Octokit({
      auth: process.env.GH_TOKEN,
      userAgent: 'Xunnamius/next-test-api-route-handler/external-scripts/is-next-compat'
    });

    const {
      data: { tag_name: vlatest }
    } = await repos.getLatestRelease({
      owner: 'vercel',
      repo: 'next.js'
    });

    const latest = vlatest.replace(/^v/, '');

    debug(`saw latest release version "${latest}"`);

    const { filename: path } = findPackageJson(process.cwd()).next();

    if (!path) throw new Error('could not find package.json');

    const dir = dirname(path);
    debug(`using path: ${dir}`);

    const cd = sjx.cd(dir);

    if (cd.code != 0) throw new Error(`cd failed: ${cd.stderr} ${cd.stdout}`);

    const prev: string = await getLastTestedVersion();

    if (latest != prev) {
      debug(`installing next@${latest}`);

      const npmi = sjx.exec(`npm install --no-save next@${latest}`);

      if (npmi.code != 0)
        throw new Error(`initial npm install failed: ${npmi.stderr} ${npmi.stdout}`);

      debug('running compatibility test');

      const test = sjx.exec('npm run test-unit && npm run test-integration');

      if (test.code != 0) {
        debug(`npm test failed! The latest Next.js is incompatible with this package`);
        throw new Error(`npm test failed: ${test.stderr} ${test.stdout}`);
      }

      debug('test succeeded');

      await setCompatFlagTo(latest);
    } else debug('no new release detected');

    debug('execution complete');

    return true;
  } catch (e) {
    if (isCli) {
      debug('FATAL', e);
      error = true;
    }

    // ? We either resolve to `true` or reject with e
    else throw new Error(e);
  } finally {
    isCli && process.exit(Number(error));
  }
}

!module.parent && main(true);
