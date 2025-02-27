// * These tests run through the entire process of acquiring this software,
// * using its features, and dealing with its error conditions across a variety
// * of runtimes (e.g. the currently maintained node versions).
// *
// * Typically, these tests involve the use of deep mock fixtures and/or Docker
// * containers, and are built to run in GitHub Actions CI pipelines; some can
// * also be run locally.

import { toAbsolutePath, toDirname } from '@-xun/fs';
import { readXPackageJsonAtRoot } from '@-xun/project-fs';
import stripAnsi from 'strip-ansi~6';

import {
  exports as packageExports,
  name as packageName,
  version as packageVersion
} from 'rootverse:package.json';

import {
  dummyNpmPackageFixture,
  ensurePackageHasBeenBuilt,
  getNextjsReactPeerDependencies,
  globalDebugger,
  mockFixturesFactory,
  nodeImportAndRunTestFixture,
  npmCopyPackageFixture,
  reconfigureJestGlobalsToSkipTestsInThisFileIfRequested
} from 'testverse:util.ts';

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested({ it: true });

const TEST_IDENTIFIER = 'ntarh-client-changelog';
const TIMEOUTTEST_TIMEOUT_MS = 15_000;

const NEXT_VERSIONS_UNDER_TEST: [
  next: `next@${string}`,
  routerType: 'app' | 'pages' | 'both',
  additionalConfig?: { extraInstalls?: string[] }
][] = [
  // * [next@version, routerType, { extraInstalls: [...] }]
  ['next@9.0.0', 'pages'], //   ? Earliest compat release
  ['next@^9', 'pages'], //      ? Latest version 9 release
  ['next@10.1.x', 'pages'], //  ? See issue #184
  ['next@^10', 'pages'], //     ? Latest version 10 release
  ['next@11.0.x', 'pages'], //  ? See issue #295
  ['next@^11', 'pages'], //     ? Latest version 11 release
  ['next@12.0.x', 'pages'], //  ? See issue #487
  ['next@13.5.3', 'pages'], //  ? See issue #887
  ['next@14.0.4', 'both'], //   ? Ntarh guarantees App Router support here on
  ['next@14.2.11', 'both'], //  ? See issue #1076
  ['next@15.0.0', 'both'], //   ? Updated from 15.0.0-rc.1
  ['next@15.2.0', 'both'], //   ? See issue #1129
  ['next@latest', 'both'] //    ! Latest release (must always be here and last)
];

const debug = globalDebugger.extend(TEST_IDENTIFIER);
const packageRoot = toAbsolutePath(__dirname, '../..');

debug('NEXT_VERSIONS_UNDER_TEST: %O', NEXT_VERSIONS_UNDER_TEST);

beforeAll(async () => {
  await ensurePackageHasBeenBuilt(
    toAbsolutePath(toDirname(require.resolve('rootverse:package.json'))),
    packageName,
    packageExports
  );
});

const withMockedFixture = mockFixturesFactory(
  [dummyNpmPackageFixture, npmCopyPackageFixture, nodeImportAndRunTestFixture],
  {
    performCleanup: true,
    initialVirtualFiles: {
      'package.json': `{"name":"dummy-pkg","dependencies":{"${packageName}":"${packageVersion}"}}`
    },
    packageUnderTest: {
      root: packageRoot,
      json: readXPackageJsonAtRoot.sync(packageRoot, { useCached: true }),
      attributes: { cjs: true }
    }
  }
);

for (const [
  nextVersion,
  routerType_,
  { extraInstalls = [] } = {}
] of NEXT_VERSIONS_UNDER_TEST) {
  const routerTypes: ['app'] | ['pages'] | ['app', 'pages'] =
    routerType_ === 'both' ? ['app', 'pages'] : [routerType_];

  for (const esm of [true, false]) {
    for (const routerType of routerTypes) {
      it(`works with ${nextVersion} via ${
        routerType[0]!.toUpperCase() + routerType.slice(1)
      } Router ${
        esm ? 'ESM import (w/o jest)' : 'CJS require (w/ jest)'
      } syntax`, async () => {
        expect.hasAssertions();

        const indexPath = `src/index.${esm ? 'm' : 'test.'}js`;
        const commonSrc =
          routerType === 'app'
            ? `
const getHandler = (status) => ({
  GET(request) {
    return Response.json({ works: 'working' }, { status: status || 200 });
  }
});`
            : `
const getHandler = (status) => async (_, res) => {
  res.status(status || 200).send({ works: 'working' });
};`;

        const additionalPackagesToInstall = [
          nextVersion,
          ...(await getNextjsReactPeerDependencies(nextVersion)),
          ...extraInstalls
        ];

        await withMockedFixture(
          async (context) => {
            if (esm) {
              debug('(expecting stderr to be "")');
              debug(String.raw`(expecting stdout to be "working\nworking\nworking")`);
              debug('(expecting exit code to be 0)');

              expect(context.testResult.stderr).toBeEmpty();
              expect(context.testResult.stdout).toBe('working\nworking\nworking');
              expect(context.testResult.code).toBe(0);
            } else {
              debug('(expecting stderr to contain jest test PASS confirmation)');
              debug('(expecting stdout to contain "working")');
              debug('(expecting exit code to be 0)');

              expect(stripAnsi(String(context.testResult.stderr))).toMatch(
                /PASS.*?\s+src\/index\.test\.js/
              );

              expect(context.testResult.stdout).toStrictEqual(
                expect.stringContaining('working')
              );
              expect(context.testResult.code).toBe(0);
            }
          },
          esm
            ? {
                initialVirtualFiles: {
                  [indexPath]: `import { testApiHandler } from '${packageName}';
${commonSrc}

(async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => {
      if((await (await fetch()).json()).works!=='working') {
        throw new Error('initial promise assertion failed');
      }
    }
  });

  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });

  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });

  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });
})();`
                },
                additionalPackagesToInstall
              }
            : {
                initialVirtualFiles: {
                  [indexPath]: `const { testApiHandler } = require('${packageName}');
${commonSrc}

it('does what I want', async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 2', async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 3', async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
      console.log(result);
    }
  });
});`
                },
                additionalPackagesToInstall: ['jest', ...additionalPackagesToInstall],
                runWith: { binary: 'npx', args: ['jest'] }
              }
        );
      });
    }
  }
}

it('fails fast (no jest timeout) when using App Router and incompatible Next.js version', async () => {
  expect.hasAssertions();

  const indexPath = 'src/index.test.js';

  await withMockedFixture(
    async (context) => {
      debug('(expecting stderr not to contain "Exceeded timeout")');
      expect(context.testResult.stderr).not.toStrictEqual(
        expect.stringContaining('Exceeded timeout')
      );

      debug('(expecting stderr to contain "Failed import attempts:")');
      expect(context.testResult.stderr).toStrictEqual(
        expect.stringContaining('Failed import attempts:')
      );

      debug('(expecting stderr to contain "3 failed, 3 total")');
      expect(context.testResult.stderr).toStrictEqual(
        expect.stringMatching(/^.*?Tests:.*?3 failed.*?,.*?3 total/m)
      );

      debug('(expecting exit code to be non-zero)');
      expect(context.testResult.code).not.toBe(0);

      debug('(expecting no forced timeout: exit code must be a number)');
      expect(context.testResult.code).toBeNumber();
    },
    {
      initialVirtualFiles: {
        [indexPath]: `
const { testApiHandler } = require('${packageName}');

jest.setTimeout(5000);

const getHandler = (status) => ({
  GET(request) {
    return Response.json({ works: 'working' }, { status: status || 200 });
  }
});

it('does what I want', async () => {
  await testApiHandler({
    appHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 2', async () => {
  await testApiHandler({
    appHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 3', async () => {
  await testApiHandler({
    appHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
      console.log(result);
    }
  });
});`
      },

      additionalPackagesToInstall: ['next@12', 'jest'],
      runWith: {
        binary: 'npx',
        args: ['jest'],
        runnerOptions: { timeout: TIMEOUTTEST_TIMEOUT_MS }
      }
    }
  );
});

it('fails fast (no jest timeout) when using Rages Router and incompatible Next.js version', async () => {
  expect.hasAssertions();

  const indexPath = 'src/index.test.js';

  await withMockedFixture(
    async (context) => {
      debug('(expecting stderr not to contain "Exceeded timeout")');
      expect(context.testResult.stderr).not.toStrictEqual(
        expect.stringContaining('Exceeded timeout')
      );

      debug('(expecting stderr to contain "Failed import attempts:")');
      expect(context.testResult.stderr).toStrictEqual(
        expect.stringContaining('Failed import attempts:')
      );

      debug('(expecting stderr to contain "3 failed, 3 total")');
      expect(context.testResult.stderr).toStrictEqual(
        expect.stringMatching(/^.*?Tests:.*?3 failed.*?,.*?3 total/m)
      );

      debug('(expecting exit code to be non-zero)');
      expect(context.testResult.code).not.toBe(0);

      debug('(expecting no forced timeout: exit code must be a number)');
      expect(context.testResult.code).toBeNumber();
    },
    {
      initialVirtualFiles: {
        [indexPath]: `
const { testApiHandler } = require('${packageName}');

jest.setTimeout(5000);

const getHandler = (status) => async (_, res) => {
  res.status(status || 200).send({ works: 'working' });
};

it('does what I want', async () => {
  await testApiHandler({
    pagesHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 2', async () => {
  await testApiHandler({
    pagesHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 3', async () => {
  await testApiHandler({
    pagesHandler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
      console.log(result);
    }
  });
});`
      },

      additionalPackagesToInstall: ['next@8', 'jest'],
      runWith: {
        binary: 'npx',
        args: ['jest'],
        runnerOptions: { timeout: TIMEOUTTEST_TIMEOUT_MS }
      }
    }
  );
});
