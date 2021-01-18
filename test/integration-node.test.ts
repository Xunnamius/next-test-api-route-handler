import { name as pkgName, version as pkgVersion } from '../package.json';
import { relative, resolve } from 'path';
import sjx from 'shelljs';
import Debug from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';
import { satisfies } from 'semver';

const debug = Debug(
  `${pkgName}:${relative(resolve('.'), __filename).split('.').find(Boolean)}`
);

debug(`pkgName = "${pkgName}"`);
debug(`pkgVersion = "${pkgVersion}"`);

const nodeVersion = process.env.MATRIX_NODE_VERSION || process.version;
debug(`nodeVersion = "${nodeVersion}"`);

if (!nodeVersion) throw new Error('bad MATRIX_NODE_VERSION encountered');

sjx.config.silent = true;

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

  debug(`echoing string ${cmd1} to ${root}/index.${ext}`);
  cmd1.to(`${root}/index.${ext}`);

  debug(`package.json contents => ${sjx.cat('package.json').stdout}`);
  const result = sjx.exec(`node index.${ext}`).stdout.trim();

  debug(`result = "${result}" (expected "working")`);
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

describe('next-test-api-route-handler [INTEGRATION-NODE]', () => {
  // ? Unflagged ESM support dropped in node >=12.17.0
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
