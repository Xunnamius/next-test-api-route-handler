/* eslint-disable jest/no-conditional-in-test */

// * These are smoke tests to ensure the externals are runnable

import debugFactory from 'debug';
import { peerDependencies, name as pkgName } from 'package';

import { dummyNpmPackageFixture, mockFixtureFactory, run, runnerFactory } from './setup';

const TEST_IDENTIFIER = 'integration-externals';
const EXTERNAL_BIN_PATH = `${__dirname}/../external-scripts/bin/is-next-compat.js`;

const debugId = `${pkgName}:*`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const runExternal = runnerFactory('node', ['--no-warnings', EXTERNAL_BIN_PATH]);

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  // ? We use _is_next_compat_test_mode to prevent the external script (compiled
  // ? using a .env file potentially with production keys) from attempting
  // ? external connections
  initialFileContents: {
    'package.json': `{
      "name": "dummy-pkg",
      "scripts": {
        "test:unit": "true",
        "test:integration:client": "true",
        "_is_next_compat_test_mode": "true"
      },
      "peerDependencies": {
        "next": "${peerDependencies.next}"
      }
    }`
  },
  use: [dummyNpmPackageFixture()]
});

beforeAll(async () => {
  if ((await run('test', ['-e', EXTERNAL_BIN_PATH])).code !== 0) {
    debug(`unable to find external executable: ${EXTERNAL_BIN_PATH}`);
    throw new Error('must build externals first (try `npm run build:externals`)');
  }
});

it('runs silent by default', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout, stderr } = await runExternal(undefined, { cwd: root });

    expect(stdout).toBeEmpty();

    if (!process.env.DEBUG) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(stderr).toBeEmpty();
    }

    expect(code).toBe(0);
  });
});

it("is verbose when DEBUG='${debugId}'", async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { code, stdout, stderr } = await runExternal(undefined, {
      env: { NODE_ENV: process.env.NODE_ENV, DEBUG: debugId },
      cwd: root
    });

    expect(stdout).toBeEmpty();
    expect(stderr).toStrictEqual(expect.stringContaining('execution complete'));
    expect(code).toBe(0);
  });
});
