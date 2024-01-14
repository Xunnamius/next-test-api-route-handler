/* eslint-disable jest/no-conditional-in-test */

// * These tests ensure NTARH is importable and functions in both ESM and CJS

import debugFactory from 'debug';
import { exports as pkgExports, name as pkgName, version as pkgVersion } from 'package';

import {
  dummyFilesFixture,
  dummyNpmPackageFixture,
  mockFixtureFactory,
  nodeImportAndRunTestFixture,
  npmLinkSelfFixture,
  run
} from 'testverse/setup';

const TEST_IDENTIFIER = 'integration-node';

const pkgMainPaths = Object.values(pkgExports)
  .map((xport) =>
    typeof xport === 'string' ? null : `${__dirname}/../${xport.node ?? xport.default}`
  )
  .filter(Boolean) as string[];

const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

// eslint-disable-next-line jest/require-hook
debug(`nodeVersion: "${nodeVersion}"`);

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  performCleanup: true,
  initialFileContents: {
    'package.json': `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  },
  use: [
    dummyNpmPackageFixture(),
    npmLinkSelfFixture(),
    dummyFilesFixture(),
    nodeImportAndRunTestFixture()
  ]
});

const runTest = async ({
  importAs,
  additionalImports,
  routerType,
  handlerCode,
  testCode,
  testFixtureFn
}: {
  importAs: 'esm' | 'cjs';
  additionalImports?: string;
  routerType: 'app' | 'pages';
  handlerCode: string;
  testCode: string;
  testFixtureFn: Parameters<typeof withMockedFixture>[0];
}) => {
  const importAsEsm = importAs === 'esm';
  const indexPath = `src/index.${importAsEsm ? 'm' : ''}js`;
  const routePath = `src/route.${importAsEsm ? 'm' : ''}js`;

  const initialFileContents = {
    [indexPath]: additionalImports ? `${additionalImports}\n` : '',
    [routePath]: additionalImports ? `${additionalImports}\n` : ''
  };

  initialFileContents[indexPath] += importAsEsm
    ? `import { testApiHandler } from '${pkgName}';\nimport * as handler from '../${routePath}';`
    : `const { testApiHandler } = require('${pkgName}');\nconst handler = require('../${routePath}');`;

  initialFileContents[indexPath] += `
(async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: handler,
    test: async ({ fetch }) => ${testCode}
  });
})();`;

  initialFileContents[routePath] +=
    routerType === 'app'
      ? `
${importAsEsm ? 'export const ' : 'module.exports.'}GET = function(request, context) {
  ${handlerCode}
};`
      : `
${importAsEsm ? 'export default ' : 'module.exports ='} async function(req, res) {
  ${handlerCode}
};`;

  await withMockedFixture(
    async (context) => {
      if (!context.testResult)
        throw new Error('must use node-import-and-run-test fixture');
      await testFixtureFn(context);
    },
    {
      initialFileContents
    }
  );
};

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

describe('<app router>', () => {
  it('works as ESM using namespace import', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'esm',
      routerType: 'app',
      handlerCode: `return Response.json({ works: 'working' });`,
      testCode: `console.log((await (await fetch()).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('works as CJS using bare require(...)', async () => {
    expect.hasAssertions();

    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      handlerCode: `return Response.json({ works: 'working' });`,
      testCode: `console.log((await (await fetch()).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('does not hang (500ms limit) on exception in handler function', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      handlerCode: `throw new Error('BadBadNotGood');`,
      testCode: `console.log(await (await fetch()).text())`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "Internal Server Error")');
        debug('(expecting stderr to contain "BadBadNotGood")');
        debug('(expecting exit code to be zero)');

        expect(context.testResult?.stdout).toBe('Internal Server Error');
        expect(context.testResult?.stderr).toStrictEqual(
          expect.stringContaining('Error: BadBadNotGood')
        );
        expect(context.testResult?.code).toBe(0);
      }
    });
  }, 500);

  it('does not hang (500ms limit) on exception in test function', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      handlerCode: `return Response.json({ works: 'working' });`,
      testCode: `{ throw new Error('BadBadNotGood'); }`,
      testFixtureFn: async (context) => {
        debug('(expecting exit code to be non-zero)');
        debug('(expecting stdout to be "")');
        debug('(expecting stderr to contain "BadBadNotGood")');

        expect(context.testResult?.code).toBe(1);
        expect(context.testResult?.stdout).toBeEmpty();
        expect(context.testResult?.stderr).toStrictEqual(
          expect.stringContaining('Error: BadBadNotGood')
        );
      }
    });
  }, 500);
});

describe('<pages router>', () => {
  it('works as ESM using namespace import', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'esm',
      routerType: 'pages',
      handlerCode: `res.status(200).send({ works: 'working' });`,
      testCode: `console.log((await (await fetch()).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('works as CJS using bare require(...)', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'pages',
      handlerCode: `res.status(200).send({ works: 'working' });`,
      testCode: `console.log((await (await fetch()).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('does not hang (500ms limit) on exception in handler function', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'pages',
      handlerCode: `throw new Error('BadBadNotGood');`,
      testCode: `console.log(await (await fetch()).text())`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "Internal Server Error")');
        debug('(expecting stderr to contain "BadBadNotGood")');
        debug('(expecting exit code to be zero)');

        expect(context.testResult?.stdout).toBe('Internal Server Error');
        expect(context.testResult?.stderr).toStrictEqual(
          expect.stringContaining('Error: BadBadNotGood')
        );
        expect(context.testResult?.code).toBe(0);
      }
    });
  }, 500);

  it('does not hang (500ms limit) on exception in test function', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'pages',
      handlerCode: `res.status(200).send({ works: 'working' });`,
      testCode: `{ throw new Error('BadBadNotGood'); }`,
      testFixtureFn: async (context) => {
        debug('(expecting exit code to be non-zero)');
        debug('(expecting stdout to be "")');
        debug('(expecting stderr to contain "BadBadNotGood")');

        expect(context.testResult?.code).toBe(1);
        expect(context.testResult?.stdout).toBeEmpty();
        expect(context.testResult?.stderr).toStrictEqual(
          expect.stringContaining('Error: BadBadNotGood')
        );
      }
    });
  }, 500);
});
