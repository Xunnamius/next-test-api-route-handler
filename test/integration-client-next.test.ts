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
} from './setup';

const TEST_IDENTIFIER = 'integration-client-next';

/* prettier-ignore */
const NEXT_VERSIONS_UNDER_TEST = [
  // * [next@version]
  ['next@9.0.0'],   // ? Earliest compat release
  ['next@^9'],      // ? Latest version 9 release
  ['next@10.1.x'],  // ? See issue #184
  ['next@^10'],     // ? Latest version 10 release
  ['next@11.0.x'],  // ? See issue #295
  ['next@^11'],     // ? Latest version 11 release
  ['next@^12.0.x'], // ? See issue #487
  ['next@^13.5.3'], // ? See issue #887
  ['next@latest']   // ? Latest release
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

for (const [nextVersion, ...otherPkgVersions] of NEXT_VERSIONS_UNDER_TEST) {
  for (const esm of [true, false]) {
    it(`works with ${nextVersion}${
      otherPkgVersions.length ? ` (and ${otherPkgVersions.join(', ')})` : ''
    } using ${
      esm ? 'ESM import (w/o jest)' : 'CJS require (w/ jest)'
    } syntax`, async () => {
      expect.hasAssertions();

      const indexPath = `src/index.${esm ? 'm' : 'test.'}js`;
      const commonSrc = `
const getHandler = (status) => async (_, res) => {
  res.status(status || 200).send({ works: 'working' });
};`;

      await withMockedFixture(
        async (context) => {
          if (!context.testResult) throw new Error('must use node-import-test fixture');

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
    handler: getHandler(),
    test: async ({ fetch }) => {
      if((await (await fetch()).json()).works!=='working') {
        throw new Error('initial promise assertion failed');
      }
    }
  });

  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });

  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });

  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
  });
})();`
              },
              npmInstall: [nextVersion, ...otherPkgVersions]
            }
          : {
              initialFileContents: {
                [indexPath]: `const { testApiHandler } = require('${pkgName}');
${commonSrc}

it('does what I want', async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 2', async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 3', async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
      console.log(result);
    }
  });
});`
              },
              npmInstall: ['jest', nextVersion, ...otherPkgVersions],
              runWith: {
                binary: 'npx',
                args: ['jest']
              }
            }
      );
    });
  }
}

it('fails fast (no jest timeout) when using incompatible Next.js version', async () => {
  expect.hasAssertions();

  const indexPath = 'src/index.test.js';

  await withMockedFixture(
    async (context) => {
      if (!context.testResult) throw new Error('must use node-import-test fixture');

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
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 2', async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
    }
  });
});

it('does what I want 3', async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => {
      const result = (await (await fetch()).json()).works;
      expect(result).toBe('working');
      console.log(result);
    }
  });
});`
      },

      npmInstall: ['next@8', 'react@^16.6.0', 'jest'],
      runWith: {
        binary: 'npx',
        args: ['jest'],
        opts: { timeout: 10_000 }
      }
    }
  );
});
