process.env.MONGODB_URI = 'fake://fake/fake';

import { relative, resolve } from 'path';
import sjx from 'shelljs';
import Debug from 'debug';
import uniqueFilename from 'unique-filename';
import del from 'del';

import {
  name as pkgName,
  version as pkgVersion,
  peerDependencies
} from '../package.json';

const debug = Debug(
  `${pkgName}:${relative(resolve('.'), __filename).split('.').find(Boolean)}`
);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);
sjx.config.silent = !process.env.DEBUG;

if (!sjx.test('-d', `${__dirname}/../external-scripts/bin`))
  throw new Error(
    'must build externals before running this test suite (try `npm run build-externals`)'
  );

let deleteRoot: () => Promise<void>;

afterAll(() => deleteRoot());

describe('next-test-api-route-handler [INTEGRATION-EXTERNALS]', () => {
  describe('/is-next-compat', () => {
    it('runs as expected', async () => {
      expect.hasAssertions();

      const root = uniqueFilename(sjx.tempdir(), 'integration-externals');
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
        '{"name":"dummy-pkg","scripts":{"test-unit":"true","test-integration":"true"},' +
          `"peerDependencies":{"next":"${peerDependencies.next}"}}`
      ).to(pkgJson);

      debug(`package.json contents: ${sjx.cat('package.json').stdout}`);

      const result = sjx.exec(
        `NO_DB_UPDATE=true node "${resolve(
          __dirname,
          '../external-scripts/bin/is-next-compat.js'
        )}"`
      );

      debug(`cmd "${result}": (${result.code})\n${result.stderr}\n${result.stdout}`);
      expect(result.code).toBe(0);
    });
  });
});
