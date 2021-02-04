import { name as pkgName, version as pkgVersion, main as pkgMain } from '../package.json';
import { resolve } from 'path';
import { satisfies } from 'semver';
import sjx from 'shelljs';
import debugFactory from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';

const TEST_IDENTIFIER = 'integration-node';
const debug = debugFactory(`${pkgName}:${TEST_IDENTIFIER}`);

sjx.config.silent = !process.env.DEBUG;

if (!sjx.test('-e', `${__dirname}/../${pkgMain}`)) {
  debug(`unable to find main distributable: ${__dirname}/../${pkgMain}`);
  throw new Error(
    'must build distributables before running this test suite (try `npm run build-dist`)'
  );
}

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;
debug(`nodeVersion: "${nodeVersion}"`);

if (!nodeVersion) throw new Error('bad MATRIX_NODE_VERSION encountered');
const createIndexAndRunTest = (root: string) => ({ esm }: { esm: boolean }) => {
  const ext = `${esm ? 'm' : ''}js`;

  const cmd1 = new sjx.ShellString(
    `${
      esm
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

  debug(`echoing string \`${cmd1}\` to ${root}/index.${ext}`);
  cmd1.to(`${root}/index.${ext}`);

  debug(`package.json contents: ${sjx.cat('package.json').stdout}`);
  debug(`directory at this point: ${sjx.exec('tree -a').stdout}`);

  const exec = sjx.exec(`node --experimental-json-modules index.${ext}`);
  const stdout = exec.stdout.trim();
  const stderr = exec.stderr.trim();

  if (esm) {
    debug(`result: \`${stdout}\` (expected "working" or "")`);
    debug(`result: \`${stderr}\` (expected "" or an error in a 3rd party dependency)`);
    expect(stdout == 'working' || / \/.+\/node_modules\/.+$/m.test(stderr)).toBeTrue();
  } else {
    debug(`result: "${stdout}" (expected "working")`);
    expect(stdout).toBe('working');
  }
};

let deleteRoot: () => Promise<void>;
let runTest: ReturnType<typeof createIndexAndRunTest>;

beforeEach(async () => {
  const root = uniqueFilename(sjx.tempdir(), TEST_IDENTIFIER);
  const pkgJson = `${root}/package.json`;

  deleteRoot = async () => {
    sjx.cd('..');
    debug(`forcibly removing dir ${root}`);
    await del(root);
  };

  sjx.mkdir('-p', root);
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
  debug(`creating symbolic link`);

  if (makeLink.code !== 0) {
    throw new Error(
      `unable to create symbolic link: ${makeLink}\n\t${makeLink.stderr} ${makeLink.stdout}`
    );
  }

  runTest = createIndexAndRunTest(root);
});

afterEach(() => deleteRoot());

describe(`${pkgName} [${TEST_IDENTIFIER}]`, () => {
  // ? Unflagged ESM support appeared in node >=12.17.0
  // ? See the table at https://bit.ly/3hHGaqR
  (satisfies(nodeVersion, '>=12.17.0') ? it : test.skip)(
    'works as an ESM import',
    async () => {
      expect.hasAssertions();
      runTest({ esm: true });
    }
  );

  it('works as a CJS require(...)', async () => {
    expect.hasAssertions();
    runTest({ esm: false });
  });
});
