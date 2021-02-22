import debugFactory from 'debug';
import { name as pkgName, version as pkgVersion, main as pkgMain } from '../package.json';
import {
  run,
  mockFixtureFactory,
  dummyNpmPackageFixture,
  npmLinkSelfFixture,
  nodeImportTestFixture
} from './setup';

import type { FixtureOptions } from './setup';

const TEST_IDENTIFIER = 'integration-node';

const pkgMainPath = `${__dirname}/../${pkgMain}`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

debug(`nodeVersion: "${nodeVersion}"`);

const fixtureOptions = {
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  } as FixtureOptions['initialFileContents'],
  use: [dummyNpmPackageFixture(), npmLinkSelfFixture(), nodeImportTestFixture()]
};

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, fixtureOptions);

const runTest = async ({ esm }: { esm: boolean }) => {
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
};

beforeAll(async () => {
  if ((await run('test', ['-e', pkgMainPath])).code != 0) {
    debug(`unable to find main distributable: ${pkgMainPath}`);
    throw new Error('must build distributables first (try `npm run build-dist`)');
  }
});

it('works as an ESM import', async () => {
  expect.hasAssertions();
  await runTest({ esm: true });
});

it('works as a CJS require(...)', async () => {
  expect.hasAssertions();
  await runTest({ esm: false });
});
