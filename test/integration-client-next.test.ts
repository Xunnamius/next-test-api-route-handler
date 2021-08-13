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
const NEXT_VERSIONS_TO_TEST = ['9.0.0', '10.0.0', '11.0.0', '11.1.0'];

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
      esm ? 'ESM import' : 'CJS require'
    } syntax`, async () => {
      expect.hasAssertions();

      const indexPath = `src/index.${esm ? 'm' : ''}js`;

      fixtureOptions.initialFileContents[indexPath] =
        (esm
          ? `import { testApiHandler } from '${pkgName}';`
          : `const { testApiHandler } = require('${pkgName}');`) +
        `
      const getHandler = (status) => async (_, res) => {
        res.status(status || 200).send({ works: 'working' });
      };

      testApiHandler({
        handler: getHandler(),
        test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
      });`;

      fixtureOptions.npmInstall = versionStr;

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
          expect(ctx.testResult.stdout).toBe('working');
        }
      });

      delete fixtureOptions.initialFileContents[indexPath];
    });
  }
}
