/* eslint-disable jest/no-conditional-in-test */
import debugFactory from 'debug';
import { main as pkgMain, name as pkgName, version as pkgVersion } from 'package';

import {
  dummyNpmPackageFixture,
  mockFixtureFactory,
  nodeImportAndRunTestFixture,
  npmLinkSelfFixture,
  run
} from './setup';

const TEST_IDENTIFIER = 'integration-node';

const pkgMainPath = `${__dirname}/../${pkgMain}`;
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

// eslint-disable-next-line jest/require-hook
debug(`nodeVersion: "${nodeVersion}"`);

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  },
  use: [dummyNpmPackageFixture(), npmLinkSelfFixture(), nodeImportAndRunTestFixture()]
});

const runTest = async (
  importAsEsm: boolean,
  handlerCode: string,
  testCode: string,
  testFixtureFn: Parameters<typeof withMockedFixture>[0]
) => {
  const indexPath = `src/index.${importAsEsm ? 'm' : ''}js`;

  await withMockedFixture(
    async (context) => {
      if (!context.testResult) throw new Error('must use node-import-test fixture');
      await testFixtureFn(context);
    },
    {
      initialFileContents: {
        [indexPath]:
          (importAsEsm
            ? `import { testApiHandler } from '${pkgName}';`
            : `const { testApiHandler } = require('${pkgName}');`) +
          `
const getHandler = (status) => async (_, res) => {
  ${handlerCode}
};

(async () => {
  await testApiHandler({
    handler: getHandler(),
    test: async ({ fetch }) => ${testCode}
  });
})();`
      }
    }
  );
};

beforeAll(async () => {
  if ((await run('test', ['-e', pkgMainPath])).code != 0) {
    debug(`unable to find main distributable: ${pkgMainPath}`);
    throw new Error('must build distributables first (try `npm run build:dist`)');
  }
});

it('works as an ESM import', async () => {
  expect.hasAssertions();
  await runTest(
    true,
    `res.status(status || 200).send({ works: 'working' });`,
    `console.log((await (await fetch()).json()).works)`,
    async (context) => {
      debug('(expecting stdout to be "working")');
      debug('(expecting exit code to be 0)');

      expect(context.testResult?.stdout).toBe('working');
      expect(context.testResult?.code).toBe(0);
    }
  );
});

it('works as a CJS require(...)', async () => {
  expect.hasAssertions();
  await runTest(
    false,
    `res.status(status || 200).send({ works: 'working' });`,
    `console.log((await (await fetch()).json()).works)`,
    async (context) => {
      debug('(expecting stdout to be "working")');
      debug('(expecting exit code to be 0)');

      expect(context.testResult?.stdout).toBe('working');
      expect(context.testResult?.code).toBe(0);
    }
  );
});

it('does not hang (500ms limit) on exception in handler function', async () => {
  expect.hasAssertions();
  await runTest(
    false,
    `throw new Error('BadBadNotGood');`,
    `console.log(await (await fetch()).text())`,
    async (context) => {
      debug('(expecting stdout to be "Internal Server Error")');
      debug('(expecting stderr to contain "BadBadNotGood")');
      debug('(expecting exit code to be non-zero)');

      expect(context.testResult?.stdout).toBe('Internal Server Error');
      expect(context.testResult?.stderr).toStrictEqual(
        expect.stringContaining('Error: BadBadNotGood')
      );
      expect(context.testResult?.code).toBe(0);
    }
  );
}, 500);

it('does not hang (500ms limit) on exception in test function', async () => {
  expect.hasAssertions();
  await runTest(
    false,
    `res.status(status || 200).send({ works: 'working' });`,
    `{ throw new Error('BadBadNotGood'); }`,
    async (context) => {
      debug('(expecting exit code to be non-zero)');
      debug('(expecting stdout to be "")');
      debug('(expecting stderr to contain "BadBadNotGood")');

      expect(context.testResult?.code).toBe(
        // ? node@<15 does not die on unhandled promise rejections
        Number(process.versions.node.split('.')[0]) < 15 ? 0 : 1
      );

      expect(context.testResult?.stdout).toBeEmpty();
      expect(context.testResult?.stderr).toStrictEqual(
        expect.stringContaining('Error: BadBadNotGood')
      );
    }
  );
}, 500);
