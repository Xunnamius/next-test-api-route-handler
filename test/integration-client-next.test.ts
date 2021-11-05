/* eslint-disable jest/no-conditional-expect */
import debugFactory from 'debug';
import stripAnsi from 'strip-ansi';
import { satisfies as satisfiesRange } from 'semver';

import { name as pkgName, version as pkgVersion, main as pkgMain } from 'package';

import {
  run,
  mockFixtureFactory,
  dummyNpmPackageFixture,
  npmCopySelfFixture,
  nodeImportTestFixture
} from './setup';

import type { FixtureOptions } from './setup';

const TEST_IDENTIFIER = 'integration-client-next';

/* prettier-ignore */
const NEXT_VERSIONS_UNDER_TEST = satisfiesRange(process.versions.node, '<15') ?
[
  // ? We need to install some peer deps (like react) manually thanks to npm@<7
  // * [next@version, react@version, others...]
  ['next@9.0.0', 'react@^16', 'next-server'],
  ['next@^9', 'react@^16'],
  ['next@10.1.x', 'react@^17'],
  ['next@^10', 'react@^17'],
  ['next@11.0.x', 'react@^17'],
  ['next@^11', 'react@^17'],
  ['next@^12', 'react@^17']
]
:
[
  // * [next@version]
  ['next@9.0.0'],  // ? Earliest compat release
  ['next@^9'],     // ? Latest version 9 release
  ['next@10.1.x'], // ? See issue #184
  ['next@^10'],    // ? Latest version 10 release
  ['next@11.0.x'], // ? See issue #295
  ['next@^11'],    // ? Latest version 11 release
  ['next@^12']     // ? Latest version 12 release
];

const pkgMainPath = `${__dirname}/../${pkgMain}`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);

// eslint-disable-next-line jest/require-hook
debug('NEXT_VERSIONS_UNDER_TEST: %O', NEXT_VERSIONS_UNDER_TEST);

const fixtureOptions = {
  performCleanup: true,
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  } as FixtureOptions['initialFileContents'],
  use: [dummyNpmPackageFixture(), npmCopySelfFixture(), nodeImportTestFixture()]
} as Partial<FixtureOptions> & {
  initialFileContents: FixtureOptions['initialFileContents'];
};

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, fixtureOptions);

beforeAll(async () => {
  if ((await run('test', ['-e', pkgMainPath])).code != 0) {
    debug(`unable to find main distributable: ${pkgMainPath}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }
});

for (const [nextVersion, ...otherPkgVersions] of NEXT_VERSIONS_UNDER_TEST) {
  for (const esm of [/*true,*/ false]) {
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

      if (esm) {
        fixtureOptions.initialFileContents[
          indexPath
        ] = `import { testApiHandler } from '${pkgName}';
        ${commonSrc}

        testApiHandler({
          handler: getHandler(),
          test: async ({ fetch }) => {
            if((await (await fetch()).json()).works != 'working') {
              throw new Error('initial promise assertion failed');
            }

            await testApiHandler({
              handler: getHandler(),
              test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
            })
          }
        });`;

        fixtureOptions.npmInstall = [nextVersion, ...otherPkgVersions];
      } else {
        fixtureOptions.initialFileContents[
          indexPath
        ] = `const { testApiHandler } = require('${pkgName}');
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
        });`;

        fixtureOptions.npmInstall = ['jest', nextVersion, ...otherPkgVersions];

        fixtureOptions.runWith = {
          binary: 'npx',
          args: ['jest']
        };
      }

      await withMockedFixture(async (ctx) => {
        if (!ctx.testResult) throw new Error('must use node-import-test fixture');

        if (esm) {
          debug('(expecting stdout to be "working" or "")');
          debug('(expecting stderr to be "" or an error in a 3rd party dependency)');

          if (ctx.testResult.stdout == '') {
            expect(ctx.testResult.stderr).toMatch(/ \/.+\/node_modules\/.+$/m);
          } else expect(ctx.testResult.stderr).toBeEmpty();

          expect(ctx.testResult.stdout).toBeOneOf(['working', '']);
        } else {
          debug('(expecting exit code to be 0)');
          debug('(expecting stdout to be "working")');

          expect(stripAnsi(ctx.testResult.stderr)).toMatch(
            /PASS.*?\s+src\/index\.test\.js/
          );

          expect(ctx.testResult.stdout).toStrictEqual(expect.stringContaining('working'));
          expect(ctx.testResult.code).toBe(0);
        }
      });

      delete fixtureOptions.npmInstall;
      delete fixtureOptions.runWith;
      delete fixtureOptions.initialFileContents[indexPath];
    });
  }
}

it('fails fast (no jest timeout) when using incompatible Next.js version', async () => {
  expect.hasAssertions();

  const indexPath = 'src/index.test.js';

  fixtureOptions.initialFileContents[indexPath] = `
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
  });`;

  fixtureOptions.npmInstall = ['next@8', 'react@^16.6.0', 'jest'];
  fixtureOptions.runWith = {
    binary: 'npx',
    args: ['jest'],
    opts: { timeout: 10000 }
  };

  await withMockedFixture(async (ctx) => {
    if (!ctx.testResult) throw new Error('must use node-import-test fixture');

    debug('(expecting exit code to be non-zero)');
    expect(ctx.testResult.code).not.toBe(0);

    debug('(expecting no forced timeout: exit code must be a number)');
    expect(ctx.testResult.code).toBeNumber();

    debug('(expecting stderr not to contain "Exceeded timeout")');
    expect(ctx.testResult.stderr).not.toStrictEqual(
      expect.stringContaining('Exceeded timeout')
    );

    debug('(expecting stderr to contain "Failed import attempts:")');
    expect(ctx.testResult.stderr).toStrictEqual(
      expect.stringContaining('Failed import attempts:')
    );

    debug('(expecting stderr to contain "3 failed, 3 total")');
    expect(ctx.testResult.stderr).toStrictEqual(
      expect.stringMatching(/^.*?Tests:.*?3 failed.*?,.*?3 total/m)
    );
  });

  delete fixtureOptions.npmInstall;
  delete fixtureOptions.runWith;
  delete fixtureOptions.initialFileContents[indexPath];
});
