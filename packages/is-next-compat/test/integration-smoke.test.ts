// * These brutally minimal "smoke" tests ensure this software can be invoked
// * and, when it is, exits cleanly. Functionality testing is not the goal here.

import { toAbsolutePath, toDirname } from '@-xun/fs';
import { readXPackageJsonAtRoot } from '@-xun/project-fs';
import { createDebugLogger } from 'rejoinder';

import {
  exports as packageExports,
  name as packageName
} from 'rootverse+is-next-compat:package.json';

import { peerDependencies as ntarhPeerDependencies } from 'rootverse:package.json';

import {
  dummyNpmPackageFixture,
  ensurePackageHasBeenBuilt,
  mockFixturesFactory,
  npmLinkPackageFixture,
  reconfigureJestGlobalsToSkipTestsInThisFileIfRequested,
  runTestFixture
} from 'testverse:util.ts';

const TEST_IDENTIFIER = `${packageName.split('/').at(-1)!}-smoke`;
const nodeVersion = process.env.XPIPE_MATRIX_NODE_VERSION || process.version;
const packageRoot = toAbsolutePath(__dirname, '..');
const debug = createDebugLogger({ namespace: 'is-next-compat' }).extend(TEST_IDENTIFIER);

debug('nodeVersion: %O (process.version=%O)', nodeVersion, process.version);

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested({ it: true, test: true });

beforeAll(async () => {
  await ensurePackageHasBeenBuilt(
    toDirname(toAbsolutePath(require.resolve('rootverse+is-next-compat:package.json'))),
    packageName,
    packageExports
  );
});

const withMockedFixture = mockFixturesFactory(
  [dummyNpmPackageFixture, npmLinkPackageFixture, runTestFixture],
  {
    performCleanup: true,
    identifier: TEST_IDENTIFIER,
    packageUnderTest: {
      root: packageRoot,
      json: readXPackageJsonAtRoot.sync(packageRoot, { useCached: true }),
      attributes: { cjs: true }
    },
    // ? We use _is_next_compat_test_mode to prevent the external script (compiled
    // ? using a .env file potentially with production keys) from attempting
    // ? external connections
    initialVirtualFiles: {
      'package.json': {
        name: 'dummy-pkg',
        scripts: {
          'test:packages:all': 'true',
          _is_next_compat_test_mode: 'true'
        },
        peerDependencies: {
          next: ntarhPeerDependencies.next
        }
      }
    },
    runWith: {
      binary: 'node',
      args: ['node_modules/is-next-compat/dist/packages/is-next-compat/src/cli.js']
    }
  }
);

it('runs to completion', async () => {
  expect.hasAssertions();

  await withMockedFixture(async (context) => {
    expect(context.testResult.stdout).toStrictEqual(
      expect.stringContaining('execution complete')
    );

    expect(context.testResult.stderr).toBeEmpty();
    expect(context.testResult.exitCode).toBe(0);
  });
});
