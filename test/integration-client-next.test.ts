/* eslint-disable jest/no-conditional-expect */
import debugFactory from 'debug';

import { name as pkgName, version as pkgVersion, main as pkgMain } from '../package.json';

import {
  run,
  mockFixtureFactory,
  dummyNpmPackageFixture,
  npmCopySelfFixture,
  nodeImportTestFixture
} from './setup';

import type { FixtureOptions } from './setup';

const TEST_IDENTIFIER = 'integration-client-next';

// ? Looks for a NEXT_VERSIONS_TO_TEST env variable which can override testing
// ? version targets (mainly useful in CI/CD and automated testing pipelines)
const rawTestTargets =
  process.env.NEXT_VERSIONS_TO_TEST?.split(',').map((s) => s.trim()) || null;

/* prettier-ignore */
const NEXT_VERSIONS_TO_TEST = rawTestTargets ? rawTestTargets : [
  '9.0.0',  // ? Earliest compat release
  '^9',     // ? Latest version 9 release
  '10.0.0', // ? First version 10 release
  '10.1.x', // ? See issue #184
  '^10',    // ? Latest version 10 release
  '11.0.0', // ? First version 11 release
  '11.0.x', // ? See issue #295
  '^11'     // ? Latest version 11 release
];

const pkgMainPath = `${__dirname}/../${pkgMain}`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);

debug(`NEXT_VERSIONS_TO_TEST: "${NEXT_VERSIONS_TO_TEST}"`);

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

for (const nextVersion of NEXT_VERSIONS_TO_TEST) {
  for (const esm of [true, false]) {
    const versionStr = `next@${nextVersion}`;

    it(`works with ${versionStr} using ${
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

        fixtureOptions.npmInstall = versionStr;
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

        fixtureOptions.npmInstall = [versionStr, 'jest'];
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

          expect(ctx.testResult.stdout).toBeOneOf(['working', '']);
          ctx.testResult.stdout == '' &&
            expect(ctx.testResult.stderr).toMatch(/ \/.+\/node_modules\/.+$/m);
        } else {
          debug('(expecting exit code to be 0)');
          debug('(expecting stdout to be "working")');

          expect(ctx.testResult.code).toBe(0);
          expect(ctx.testResult.stdout).toStrictEqual(expect.stringContaining('working'));
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

  fixtureOptions.npmInstall = ['next@8', 'jest'];
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

    debug('(expecting stderr to contain "dependency resolution failed")');
    expect(ctx.testResult.stderr).toStrictEqual(
      expect.stringContaining('dependency resolution failed')
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
