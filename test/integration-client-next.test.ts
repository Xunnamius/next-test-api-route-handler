/* eslint-disable jest/no-conditional-in-test, jest/no-conditional-expect */

// * These tests ensure NTARH and Next.js integrate as expected

import debugFactory from 'debug';
import { exports as pkgExports, name as pkgName, version as pkgVersion } from 'package';
import stripAnsi from 'strip-ansi';

import {
  dummyNpmPackageFixture,
  mockFixtureFactory,
  nodeImportAndRunTestFixture,
  npmCopySelfFixture,
  run
} from 'testverse/setup';

const TEST_IDENTIFIER = 'integration-client-next';

/* prettier-ignore */
const NEXT_VERSIONS_UNDER_TEST: [next: `next@${string}`, routerType: 'app' | 'pages' | 'both'][] = [
  // * [next@version, routerType]
  ['next@9.0.0', 'pages'],   // ? Earliest compat release
  ['next@^9', 'pages'],      // ? Latest version 9 release
  ['next@10.1.x', 'pages'],  // ? See issue #184
  ['next@^10', 'pages'],     // ? Latest version 10 release
  ['next@11.0.x', 'pages'],  // ? See issue #295
  ['next@^11', 'pages'],     // ? Latest version 11 release
  ['next@12.0.x', 'pages'],  // ? See issue #487
  ['next@13.5.3', 'pages'],  // ? See issue #887
  ['next@14.0.4', 'both'],   // ? Ntarh guarantees App Router support here on
  ['next@latest', 'both']    // ! Latest release (must always be here)
];

const pkgMainPaths = Object.values(pkgExports)
  .map((xport) =>
    typeof xport === 'string' ? null : `${__dirname}/../${xport.node ?? xport.default}`
  )
  .filter(Boolean) as string[];

const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);

// eslint-disable-next-line jest/require-hook
debug('NEXT_VERSIONS_UNDER_TEST: %O', NEXT_VERSIONS_UNDER_TEST);

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  performCleanup: true,
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  },
  use: [dummyNpmPackageFixture(), npmCopySelfFixture(), nodeImportAndRunTestFixture()]
});

beforeAll(async () => {
  debug('pkgMainPaths: %O', pkgMainPaths);

  await Promise.all(
    pkgMainPaths.map(async (pkgMainPath) => {
      if ((await run('test', ['-e', pkgMainPath])).code != 0) {
        debug(`unable to find main distributable: ${pkgMainPath}`);
        throw new Error('must build distributables first (try `npm run build:dist`)');
      }
    })
  );
});

for (const [nextVersion, routerType_] of NEXT_VERSIONS_UNDER_TEST) {
  const routerTypes: ['app'] | ['pages'] | ['app', 'pages'] =
    routerType_ === 'both' ? ['app', 'pages'] : [routerType_];

  for (const esm of [true, false]) {
    for (const routerType of routerTypes) {
      it(`works with ${nextVersion} via ${
        routerType[0].toUpperCase() + routerType.slice(1)
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

        await withMockedFixture(
          async (context) => {
            if (!context.testResult)
              throw new Error('must use node-import-and-run-test fixture');

            if (esm) {
              debug('(expecting stderr to be "")');
              debug('(expecting stdout to be "working\\nworking\\nworking")');
              debug('(expecting exit code to be 0)');

              expect(context.testResult.stderr).toBeEmpty();
              expect(context.testResult.stdout).toBe('working\nworking\nworking');
              expect(context.testResult.code).toBe(0);
            } else {
              debug('(expecting stderr to contain jest test PASS confirmation)');
              debug('(expecting stdout to contain "working")');
              debug('(expecting exit code to be 0)');

              expect(stripAnsi(context.testResult.stderr)).toMatch(
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
                initialFileContents: {
                  [indexPath]: `import { testApiHandler } from '${pkgName}';
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
                npmInstall: [nextVersion]
              }
            : {
                initialFileContents: {
                  [indexPath]: `const { testApiHandler } = require('${pkgName}');
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
                npmInstall: ['jest', nextVersion],
                runWith: {
                  binary: 'npx',
                  args: ['jest']
                }
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
      if (!context.testResult)
        throw new Error('must use node-import-and-run-test fixture');

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
      initialFileContents: {
        [indexPath]: `
const { testApiHandler } = require('${pkgName}');

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

      npmInstall: ['next@12', 'jest'],
      runWith: {
        binary: 'npx',
        args: ['jest'],
        opts: { timeout: 10_000 }
      }
    }
  );
});

it('fails fast (no jest timeout) when using Rages Router and incompatible Next.js version', async () => {
  expect.hasAssertions();

  const indexPath = 'src/index.test.js';

  await withMockedFixture(
    async (context) => {
      if (!context.testResult)
        throw new Error('must use node-import-and-run-test fixture');

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
      initialFileContents: {
        [indexPath]: `
const { testApiHandler } = require('${pkgName}');

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

      npmInstall: ['next@8', 'jest'],
      runWith: {
        binary: 'npx',
        args: ['jest'],
        opts: { timeout: 10_000 }
      }
    }
  );
});
