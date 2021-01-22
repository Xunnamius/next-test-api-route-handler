import { name as pkgName, version as pkgVersion } from '../package.json';
import { relative, resolve } from 'path';
import sjx from 'shelljs';
import Debug from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';

const debug = Debug(
  `${pkgName}:${relative(resolve('.'), __filename).split('.').find(Boolean)}`
);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

const webpackVersion = process.env.MATRIX_WEBPACK_VERSION || 'latest';
debug(`webpackVersion: "${webpackVersion}"`);

if (!webpackVersion) throw new Error('bad MATRIX_WEBPACK_VERSION encountered');

sjx.config.silent = true;

enum SourceType {
  CJS = 'cjs',
  ESM = 'esm'
}

enum DestType {
  CJS = 'cjs',
  CJS_LIB = 'cjs-library',
  UMD_LIB = 'umd-library'
}

const createIndexAndRunTest = (root: string) => ({
  source,
  dest
}: {
  source: SourceType;
  dest: DestType;
}) => {
  const ext = `${source == SourceType.ESM ? 'm' : ''}js`;

  const cmd1 = new sjx.ShellString(
    `${
      source == SourceType.ESM
        ? "import { testApiHandler } from 'next-test-api-route-handler';"
        : "const { testApiHandler } = require('next-test-api-route-handler');"
    }

    const getHandler = (status) => async (_, res) => {
      res.status(status || 200).send({ works: 'working' });
    };

    testApiHandler({
      handler: getHandler(),
      test: async ({ fetch }) => console.log((await (await fetch()).json()).works)
    });`.trim()
  );

  debug(`echoing string ${cmd1} to ${root}/src/index.${ext}`);
  cmd1.to(`${root}/src/index.${ext}`);

  const cmd2 = new sjx.ShellString(
    `
    module.exports = {
      name: 'dummy',
      mode: 'production',
      target: 'node',
      node: false,
      entry: \`\${__dirname}/src/index.${ext}\`,
      output: {
        filename: 'index.js',
        path: \`\${__dirname}/dist\`,
        ${
          dest == DestType.CJS_LIB
            ? "libraryTarget: 'commonjs2'"
            : dest == DestType.UMD_LIB
            ? "libraryTarget: 'umd'"
            : ''
        }
      }
    }`.trim()
  );

  debug(`echoing string ${cmd2} to ${root}/webpack.config.js`);
  cmd2.to(`${root}/webpack.config.js`);

  debug(`directory at this point: ${sjx.exec('tree').stdout}`);

  sjx.exec(`npm install webpack@${webpackVersion} webpack-cli`);

  debug(`package.json contents: ${sjx.cat('package.json').stdout}`);

  const webpack = sjx.exec('npx webpack');

  debug(`webpack run: (${webpack.code})\n${webpack.stderr}\n${webpack.stdout}`);
  expect(webpack.code).toBe(0);

  const result = sjx.exec('node dist/index.js').stdout.trim();
  debug(`result: "${result}" (expected "working")`);
  expect(result).toBe('working');
};

let deleteRoot: () => Promise<void>;
let runTest: ReturnType<typeof createIndexAndRunTest>;

beforeEach(async () => {
  const root = uniqueFilename(sjx.tempdir(), 'integration-webpack');
  const pkgJson = `${root}/package.json`;

  deleteRoot = async () => {
    sjx.cd('..');
    debug(`forcibly removing dir ${root}`);
    await del(root);
  };

  sjx.mkdir('-p', root);
  sjx.mkdir('-p', `${root}/src`);
  sjx.mkdir('-p', `${root}/node_modules`);
  const cd = sjx.cd(root);

  if (cd.code != 0) {
    await deleteRoot();
    throw new Error(`failed to mkdir/cd into ${root}: ${cd.stderr} ${cd.stdout}`);
  } else debug(`created temp root dir: ${root}`);

  new sjx.ShellString(
    `{"name":"dummy-pkg","dependencies":{"${pkgName}":"${pkgVersion}"}}`
  ).to(pkgJson);

  const makeLink = sjx.ln('-s', resolve(`${__dirname}/..`), `node_modules/${pkgName}`);
  debug(`creating symbolic link (soft) via \`${makeLink}\`...`);

  if (makeLink.code !== 0) {
    throw new Error(
      `unable to create symbolic link: ${makeLink}\n\t${makeLink.stderr} ${makeLink.stdout}`
    );
  }

  runTest = createIndexAndRunTest(root);
});

afterEach(() => deleteRoot());

describe('next-test-api-route-handler [INTEGRATION-WEBPACK]', () => {
  // eslint-disable-next-line jest/lowercase-name
  it('CJS source can be bundled into CJS app by webpack', async () => {
    expect.hasAssertions();
    runTest({ source: SourceType.CJS, dest: DestType.CJS });
  });

  // eslint-disable-next-line jest/lowercase-name
  it('CJS source can be bundled into CJS library by webpack', async () => {
    expect.hasAssertions();
    runTest({ source: SourceType.CJS, dest: DestType.CJS_LIB });
  });

  // eslint-disable-next-line jest/lowercase-name
  it('ESM source can be bundled into CJS app by webpack', async () => {
    expect.hasAssertions();
    runTest({ source: SourceType.ESM, dest: DestType.CJS });
  });

  // eslint-disable-next-line jest/lowercase-name
  it('ESM source can be bundled into CJS library by webpack', async () => {
    expect.hasAssertions();
    runTest({ source: SourceType.ESM, dest: DestType.CJS_LIB });
  });
});
