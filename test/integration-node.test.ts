/* eslint-disable jest/no-conditional-in-test */

// * These tests ensure NTARH is importable and functions in both ESM and CJS

import debugFactory from 'debug';
import { exports as pkgExports, name as pkgName, version as pkgVersion } from 'package';

import {
  dummyFilesFixture,
  dummyNpmPackageFixture,
  mockFixtureFactory,
  nodeImportAndRunTestFixture,
  // TODO: add recommendation to documentation of published fixture packages
  // TODO: that npmCopySelfFixture is for projects with peer deps,
  // TODO: npmLinkSelfFixture can be dangerous to use in that case (something
  // TODO: akin to the dual package hazard)
  npmCopySelfFixture,
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
    npmCopySelfFixture(),
    dummyFilesFixture(),
    nodeImportAndRunTestFixture()
  ]
});

const runTest = async ({
  importAs,
  additionalImports,
  insertAdditionalImportsFirst,
  routerType,
  handlerCode,
  testCode,
  testFixtureFn
}: {
  importAs: 'esm' | 'cjs';
  additionalImports?: string;
  insertAdditionalImportsFirst?: boolean;
  routerType: 'app' | 'pages';
  handlerCode: string;
  testCode: string;
  testFixtureFn: Parameters<typeof withMockedFixture>[0];
}) => {
  const importAsEsm = importAs === 'esm';
  const indexPath = `src/index.${importAsEsm ? 'm' : ''}js`;
  const routePath = `src/route.${importAsEsm ? 'm' : ''}js`;

  const initialFileContents =
    insertAdditionalImportsFirst && additionalImports
      ? {
          [indexPath]: `${additionalImports}\n`,
          [routePath]: `${additionalImports}\n`
        }
      : {
          [indexPath]: '',
          [routePath]: `${additionalImports}\n`
        };

  initialFileContents[indexPath] += importAsEsm
    ? `import { testApiHandler } from '${pkgName}';\nimport * as handler from '../${routePath}';`
    : `const { testApiHandler } = require('${pkgName}');\nconst handler = require('../${routePath}');`;

  if (!insertAdditionalImportsFirst && additionalImports) {
    initialFileContents[indexPath] += `${additionalImports}\n`;
  }

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
      additionalImports: `import { headers } from 'next/headers.js';`,
      handlerCode: `return Response.json({ works: (await headers()).get('x-works') });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
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
      additionalImports: `const { headers } = require('next/headers');`,
      handlerCode: `return Response.json({ works: (await headers()).get('x-works') });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('throws when next/headers is imported as ESM before NTARH', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'esm',
      routerType: 'app',
      insertAdditionalImportsFirst: true,
      additionalImports: `import { headers } from 'next/headers.js';`,
      handlerCode: `return Response.json({ works: (await headers()).get('x-works') });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "")');
        debug(
          '(expecting stderr to include "AsyncLocalStorage accessed in runtime where it is not available")'
        );
        debug('(expecting exit code to be non-zero)');

        expect(context.testResult?.stdout).toBeEmpty();
        expect(context.testResult?.stderr).toInclude(
          'AsyncLocalStorage accessed in runtime where it is not available'
        );
        expect(context.testResult?.code).not.toBe(0);
      }
    });
  });

  it('throws when next/headers is imported as CJS before NTARH', async () => {
    expect.hasAssertions();

    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      insertAdditionalImportsFirst: true,
      additionalImports: `const { headers } = require('next/headers');`,
      handlerCode: `return Response.json({ works: (await headers()).get('x-works') });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "")');
        debug(
          '(expecting stderr to include "AsyncLocalStorage accessed in runtime where it is not available")'
        );
        debug('(expecting exit code to be non-zero)');

        expect(context.testResult?.stdout).toBeEmpty();
        expect(context.testResult?.stderr).toInclude(
          'AsyncLocalStorage accessed in runtime where it is not available'
        );
        expect(context.testResult?.code).not.toBe(0);
      }
    });
  });

  it('does not hang on exception in handler function (probably requires SSD)', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      handlerCode: `throw new Error('BadBadNotGood');`,
      testCode: `console.log(await (await fetch({ headers: { 'x-works': 'working' }})).text())`,
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
  }, 10_000);

  it('does not hang on exception in test function (probably requires SSD)', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'app',
      additionalImports: `const { headers } = require('next/headers');`,
      handlerCode: `return Response.json({ works: (await headers()).get('x-works') });`,
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
  }, 10_000);
});

describe('<pages router>', () => {
  it('works as ESM using namespace import', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'esm',
      routerType: 'pages',
      handlerCode: `res.status(200).send({ works: req.headers['x-works'] });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
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
      handlerCode: `res.status(200).send({ works: req.headers['x-works'] });`,
      testCode: `console.log((await (await fetch({ headers: { 'x-works': 'working' }})).json()).works)`,
      testFixtureFn: async (context) => {
        debug('(expecting stdout to be "working")');
        debug('(expecting exit code to be 0)');

        expect(context.testResult?.stderr).toBeEmpty();
        expect(context.testResult?.stdout).toBe('working');
        expect(context.testResult?.code).toBe(0);
      }
    });
  });

  it('does not hang on exception in handler function (probably requires SSD)', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'pages',
      handlerCode: `throw new Error('BadBadNotGood');`,
      testCode: `console.log(await (await fetch({ headers: { 'x-works': 'working' }})).text())`,
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
  }, 10_000);

  it('does not hang on exception in test function (probably requires SSD)', async () => {
    expect.hasAssertions();
    await runTest({
      importAs: 'cjs',
      routerType: 'pages',
      handlerCode: `res.status(200).send({ works: req.headers['x-works'] });`,
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
  }, 10_000);
});
