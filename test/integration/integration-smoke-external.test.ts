// * These brutally minimal "smoke" tests ensure the externals can be invoked
// * and, when it is, exits cleanly. Functionality testing is not the goal here.

import { toAbsolutePath } from '@-xun/fs';
import { isAccessible } from '@-xun/project-fs';
import { runnerFactory } from '@-xun/run';

import { peerDependencies } from 'rootverse:package.json';

import {
  dummyNpmPackageFixture,
  globalDebugger,
  mockFixturesFactory,
  reconfigureJestGlobalsToSkipTestsInThisFileIfRequested
} from 'testverse:util.ts';

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested({ it: true });

const TEST_IDENTIFIER = 'ntarh-client-changelog';
const EXTERNAL_BIN_PATH = toAbsolutePath(
  __dirname,
  '..',
  '..',
  'external-scripts',
  'bin',
  'is-next-compat.js'
);

const debug = globalDebugger.extend(TEST_IDENTIFIER);
const runExternal = runnerFactory('node', ['--no-warnings', EXTERNAL_BIN_PATH]);
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

debug(`nodeVersion: "${nodeVersion}"`);

beforeAll(async () => {
  // TODO: remove this customization once externals retired
  if (!(await isAccessible(EXTERNAL_BIN_PATH, { useCached: false }))) {
    throw new Error('must build externals first (try `npm run build:externals`)');
  }
});

const withMockedFixture = mockFixturesFactory([dummyNpmPackageFixture], {
  performCleanup: true,
  identifier: TEST_IDENTIFIER,
  // ? We use _is_next_compat_test_mode to prevent the external script (compiled
  // ? using a .env file potentially with production keys) from attempting
  // ? external connections
  initialVirtualFiles: {
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
  }
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
