// * These are smoke tests to ensure the externals are runnable

import { toAbsolutePath, toDirname } from '@-xun/fs';
import { ensurePackageHasBeenBuilt } from '@-xun/jest';
import { runnerFactory } from '@-xun/run';
import { createDebugLogger } from 'rejoinder';

import {
  exports as packageExports,
  name as packageName,
  peerDependencies
} from 'rootverse:package.json';

import { dummyNpmPackageFixture, mockFixtureFactory } from 'testverse:setup.ts';
import { reconfigureJestGlobalsToSkipTestsInThisFileIfRequested } from 'testverse:util.ts';

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested({ it: true });

const TEST_IDENTIFIER = 'integration-externals';

const EXTERNAL_BIN_PATH = toAbsolutePath(
  __dirname,
  '..',
  '..',
  'external-scripts',
  'bin',
  'is-next-compat.js'
);

// TODO: update this and all others to use single unified ntarh namespace
const debug = createDebugLogger({ namespace: `${packageName}:${TEST_IDENTIFIER}` });
const runExternal = runnerFactory('node', ['--no-warnings', EXTERNAL_BIN_PATH]);

const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

debug(`nodeVersion: "${nodeVersion}"`);

beforeAll(async () => {
  await ensurePackageHasBeenBuilt(
    toAbsolutePath(toDirname(require.resolve('rootverse:package.json'))),
    packageName,
    packageExports
  );
});

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  performCleanup: true,
  // ? We use _is_next_compat_test_mode to prevent the external script (compiled
  // ? using a .env file potentially with production keys) from attempting
  // ? external connections
  initialFileContents: {
    'package.json': `{
      "name": "dummy-pkg",
      "scripts": {
        "test:packages:all": "true",
        "_is_next_compat_test_mode": "true"
      },
      "peerDependencies": {
        "next": "${peerDependencies.next}"
      }
    }`
  },
  use: [dummyNpmPackageFixture()]
});

it('runs to completion', async () => {
  expect.hasAssertions();

  await withMockedFixture(async ({ root }) => {
    const { exitCode, stdout, stderr } = await runExternal(undefined, { cwd: root });

    expect(stdout).toStrictEqual(expect.stringContaining('execution complete'));

    expect(
      stderr
        .replace(/Debugger attached\.\s*/, '')
        .replace('Waiting for the debugger to disconnect...', '')
    ).toBeEmpty();

    expect(exitCode).toBe(0);
  });
});
