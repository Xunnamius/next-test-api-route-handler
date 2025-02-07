// * These tests ensure NTARH is importable and functions in both ESM and CJS

import { toAbsolutePath, toDirname } from '@-xun/fs';
import { createDebugLogger } from 'rejoinder';

import { exports as packageExports, name as packageName } from 'rootverse:package.json';

import {
  dummyFilesFixture,
  dummyNpmPackageFixture,
  mockFixtureFactory,
  nodeImportAndRunTestFixture,
  npmCopySelfFixture
} from 'testverse:setup.ts';

import {
  ensurePackageHasBeenBuilt,
  getNextjsReactPeerDependencies,
  reconfigureJestGlobalsToSkipTestsInThisFileIfRequested
} from 'testverse:util.ts';

reconfigureJestGlobalsToSkipTestsInThisFileIfRequested();

const TEST_IDENTIFIER = 'integration-node';
// TODO: update this and all others to use single unified ntarh namespace
const debug = createDebugLogger({ namespace: `${packageName}:${TEST_IDENTIFIER}` });
const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;

debug(`nodeVersion: "${nodeVersion}"`);

beforeAll(async () => {
  await ensurePackageHasBeenBuilt(
    toAbsolutePath(toDirname(require.resolve('rootverse:package.json'))),
    packageName,
    packageExports
  );
});

const withMockedFixture = mockFixtureFactory(TEST_IDENTIFIER, {
  performCleanup: true,
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

  const dependencies = [
    'next@latest',
    ...(await getNextjsReactPeerDependencies('next@latest'))
  ];

  const initialFileContents: Record<string, string> = {
    'package.json': '{"name":"dummy-pkg"}'
  };

  Object.assign(
    initialFileContents,
    {
      [indexPath]:
        insertAdditionalImportsFirst && additionalImports ? `${additionalImports}\n` : ''
    },
    additionalImports ? { [routePath]: `${additionalImports}\n` } : {}
  );

  initialFileContents[indexPath]! += importAsEsm
    ? `import { testApiHandler } from '${packageName}';\nimport * as handler from '../${routePath}';`
    : `const { testApiHandler } = require('${packageName}');\nconst handler = require('../${routePath}');`;

  if (!insertAdditionalImportsFirst && additionalImports) {
    initialFileContents[indexPath]! += `${additionalImports}\n`;
  }

  initialFileContents[indexPath]! += `
(async () => {
  await testApiHandler({
    ${routerType === 'app' ? 'appHandler' : 'pagesHandler'}: handler,
    test: async ({ fetch }) => ${testCode}
  });
})();`;

  initialFileContents[routePath]! +=
    routerType === 'app'
      ? `
${importAsEsm ? 'export const ' : 'module.exports.'}GET = async function(request, context) {
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
    { initialFileContents, npmInstall: dependencies }
  );
};

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
