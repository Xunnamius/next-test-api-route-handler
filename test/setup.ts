/* eslint-disable unicorn/no-object-as-default-parameter */
// TODO: remove the previous line ^^^
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import debugFactory from 'debug';
import execa from 'execa';
import glob from 'glob';
import { name as pkgName, version as pkgVersion } from 'package';
import gitFactory from 'simple-git';
import uniqueFilename from 'unique-filename';
// ? https://github.com/jest-community/jest-extended#typescript
import 'jest-extended';
import 'jest-extended/all';

import type { AnyFunction, AnyVoid } from '@xunnamius/types';
import type { Debugger } from 'debug';
import type { ExecaReturnValue } from 'execa';
import type { SimpleGit } from 'simple-git';

const { writeFile, readFile, access: accessFile } = fs;
const debug = debugFactory(`${pkgName}:jest-setup`);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

// TODO: XXX: add this to @ergodark/types:
export function asMockedFunction<T extends AnyFunction = never>(): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn: T): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn?: T): jest.MockedFunction<T> {
  return (fn || jest.fn()) as unknown as jest.MockedFunction<T>;
}

// TODO: XXX: make this into a separate (mock-argv) package (along w/ the below)
export type MockArgvOptions = {
  /**
   * By default, the first two elements in `process.argv` are preserved. Setting
   * `replace` to `true` will cause the entire process.argv array to be replaced
   * @default false
   */
  replace?: boolean;
};

// TODO: XXX: make this into a separate (mock-env) package (along w/ the below)
export type MockEnvOptions = {
  /**
   * By default, the `process.env` object is emptied and re-hydrated with
   * `newEnv`. Setting `replace` to `false` will cause `newEnv` to be appended
   * instead
   * @default true
   */
  replace?: boolean;
};

// TODO: XXX: make this into a separate (mock-argv) package
export async function withMockedArgv(
  fn: () => AnyVoid,
  newArgv: string[],
  options: MockArgvOptions = { replace: false }
) {
  // ? Take care to preserve the original argv array reference in memory
  const previousArgv = process.argv.splice(options?.replace ? 0 : 2, process.argv.length);
  process.argv.push(...newArgv);

  await fn();

  process.argv.splice(options?.replace ? 0 : 2, process.argv.length);
  process.argv.push(...previousArgv);
}

// TODO: XXX: make this into a separate (mock-argv) package (along w/ the above)
export function mockArgvFactory(
  newArgv: typeof process.argv,
  options: MockArgvOptions = { replace: false }
) {
  const factoryNewArgv = newArgv;
  const factoryOptions = options;

  return (fn: () => AnyVoid, newArgv?: string[], options?: MockArgvOptions) => {
    return withMockedArgv(
      fn,
      [...factoryNewArgv, ...(newArgv || [])],
      options || factoryOptions
    );
  };
}

// TODO: XXX: make this into a separate (mock-env) package
export async function withMockedEnv(
  fn: () => AnyVoid,
  newEnv: Record<string, string>,
  options: MockEnvOptions = { replace: true }
) {
  const previousEnv = { ...process.env };
  const clearEnv = () =>
    Object.getOwnPropertyNames(process.env).forEach((prop) => delete process.env[prop]);

  // ? Take care to preserve the original env object reference in memory
  if (options.replace) clearEnv();
  Object.assign(process.env, newEnv);

  await fn();

  clearEnv();
  Object.assign(process.env, previousEnv);
}

// TODO: XXX: make this into a separate (mock-env) package (along w/ the above)
export function mockEnvFactory(
  // eslint-disable-next-line unicorn/no-keyword-prefix
  newEnv: Record<string, string>,
  options: MockEnvOptions = { replace: true }
) {
  // eslint-disable-next-line unicorn/no-keyword-prefix
  const factoryNewEnv = newEnv;
  const factoryOptions = options;

  return (
    fn: () => AnyVoid,
    // eslint-disable-next-line unicorn/no-keyword-prefix
    newEnv?: Record<string, string>,
    options?: MockEnvOptions
  ) => {
    return withMockedEnv(
      fn,
      // eslint-disable-next-line unicorn/no-keyword-prefix
      { ...factoryNewEnv, ...newEnv },
      options || factoryOptions
    );
  };
}

/**
 * Performs a module import as if it were being imported for the first time.
 *
 * Note that this function breaks the "require caching" expectation of Node.js
 * modules. Problems can arise, for example, when closing an app-wide database
 * connection in your test cleanup phase and expecting it to close for the
 * isolated module too. In this case, the isolated module has its own isolated
 * "app-wide" connection that would not actually be closed and could cause your
 * test to hang unexpectedly, even when all tests pass.
 */
export function isolatedImport<T = unknown>(args: {
  /**
   * Path to the module to import. Module resolution is handled by `require`.
   */
  path: string;
  /**
   * By default, if `module.__esModule === true`, the default export will be
   * returned instead. Use `useDefault` to override this behavior in either
   * direction.
   */
  useDefault?: boolean;
}) {
  let pkg: T | undefined;

  // ? Cache-busting
  jest.isolateModules(() => {
    pkg = ((r) => {
      debug(
        `performing isolated import of ${args.path}${
          args.useDefault ? ' (returning default by force)' : ''
        }`
      );

      return r.default &&
        (args.useDefault === true ||
          (args.useDefault !== false && r.__esModule && Object.keys(r).length == 1))
        ? r.default
        : r;
    })(require(args.path));
  });

  return pkg as T;
}

// TODO: XXX: make this into a separate package (along with the above)
export function isolatedImportFactory<T = unknown>(args: {
  path: string;
  useDefault?: boolean;
}) {
  return () => isolatedImport<T>({ path: args.path, useDefault: args.useDefault });
}

// TODO: XXX: make this into a separate (mock-exit) package
export async function withMockedExit(
  fn: (spies: { exitSpy: jest.SpyInstance }) => AnyVoid
) {
  const exitSpy = jest
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);

  try {
    await fn({ exitSpy });
  } finally {
    exitSpy.mockRestore();
  }
}

// TODO: XXX: make this into a separate package (along with the above)
export function protectedImportFactory(path: string) {
  return async (parameters?: { expectedExitCode?: number }) => {
    let pkg: unknown = undefined;

    await withMockedExit(async ({ exitSpy }) => {
      pkg = await isolatedImport({ path });
      if (expect && parameters?.expectedExitCode)
        expect(exitSpy).toBeCalledWith(parameters.expectedExitCode);
      else if (!expect)
        debug('WARNING: "expect" object not found, so exit check was skipped');
    });

    return pkg;
  };
}

// TODO: XXX: make this into a separate (mock-output) package
export async function withMockedOutput(
  fn: (spies: {
    logSpy: jest.SpyInstance;
    warnSpy: jest.SpyInstance;
    errorSpy: jest.SpyInstance;
    infoSpy: jest.SpyInstance;
    stdoutSpy: jest.SpyInstance;
    stdErrSpy: jest.SpyInstance;
  }) => unknown
) {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  const stdErrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

  try {
    await fn({
      logSpy,
      warnSpy,
      errorSpy,
      infoSpy,
      stdoutSpy,
      stdErrSpy
    });
  } finally {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
    stdoutSpy.mockRestore();
    stdErrSpy.mockRestore();
  }
}

// TODO: XXX: make this into a separate (run) package (along w/ below)
export interface RunOptions extends execa.Options {
  /**
   * Setting this to `true` rejects the promise instead of resolving it with the error.
   * @default false
   */
  reject?: boolean;
}

// TODO: XXX: make this into a separate (run) package
// ! By default, does NOT reject on bad exit code (set reject: true to override)
export async function run(file: string, args?: string[], options?: RunOptions) {
  let result: ExecaReturnValue & { code: ExecaReturnValue['exitCode'] };
  // eslint-disable-next-line prefer-const
  result = (await execa(file, args, { reject: false, ...options })) as typeof result;

  result.code = result.exitCode;
  debug('executed command result: %O', result);

  return result;
}

// TODO: XXX: make this into a separate (run) package (along w/ above)
export function runnerFactory(file: string, args?: string[], options?: RunOptions) {
  const factoryArgs = args;
  const factoryOptions = options;

  return (args?: string[], options?: RunOptions) =>
    run(file, args || factoryArgs, { ...factoryOptions, ...options });
}

// TODO: XXX: need some way to make setting different fixture options for
// TODO: XXX: different tests much less painful!

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface FixtureOptions
  extends Partial<WebpackTestFixtureOptions>,
    Partial<GitRepositoryFixtureOptions>,
    Partial<NodeImportTestFixtureOptions>,
    Partial<DummyDirectoriesFixtureOptions> {
  performCleanup: boolean;
  use: MockFixture[];
  initialFileContents: { [filePath: string]: string };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface WebpackTestFixtureOptions {
  webpackVersion: string;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface GitRepositoryFixtureOptions {
  setupGit: (git: SimpleGit) => AnyVoid;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface DummyDirectoriesFixtureOptions {
  directoryPaths: string[];
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface NodeImportTestFixtureOptions {
  npmInstall?: string | string[];
  runWith?: {
    binary?: string;
    args?: string[];
    opts?: Record<string, unknown>;
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
// eslint-disable-next-line @typescript-eslint/ban-types
export interface FixtureContext<CustomOptions extends Record<string, unknown> = {}>
  extends Partial<TestResultProvider>,
    Partial<TreeOutputProvider>,
    Partial<GitProvider> {
  root: string;
  testIdentifier: string;
  options: FixtureOptions & CustomOptions;
  using: MockFixture[];
  fileContents: { [filePath: string]: string };
  debug: Debugger;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface TestResultProvider {
  testResult: { code: number; stdout: string; stderr: string };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface TreeOutputProvider {
  treeOutput: string;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface GitProvider {
  git: SimpleGit;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
// eslint-disable-next-line @typescript-eslint/ban-types
export type FixtureAction<Context = FixtureContext> = (
  context: Context
) => Promise<unknown>;

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export type ReturnsString<Context = FixtureContext> = (
  context: Context
) => Promise<string> | string;

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface MockFixture<Context = FixtureContext> {
  name: 'root' | 'describe-root' | string | ReturnsString<Context> | symbol;
  description: string | ReturnsString<Context>;
  setup?: FixtureAction<Context>;
  teardown?: FixtureAction<Context>;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function rootFixture(): MockFixture {
  return {
    name: 'root', // ? If first isn't named root, root used automatically
    description: (context) =>
      `creating a unique root directory${
        context.options.performCleanup
          ? ' (will be deleted after all tests complete)'
          : ''
      }`,
    setup: async (context) => {
      context.root = uniqueFilename(tmpdir(), context.testIdentifier);

      await run('mkdir', ['-p', context.root], { reject: true });
      await run('mkdir', ['-p', 'src'], { cwd: context.root, reject: true });
    },
    teardown: async (context) =>
      context.options.performCleanup && run('rm', ['-rf', context.root], { reject: true })
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function dummyNpmPackageFixture(): MockFixture {
  return {
    name: 'dummy-npm-package',
    description: 'creating package.json file and node_modules subdirectory',
    setup: async (context) => {
      await Promise.all([
        writeFile(
          `${context.root}/package.json`,
          (context.fileContents['package.json'] =
            context.fileContents['package.json'] || '{"name":"dummy-pkg"}')
        ),
        run('mkdir', ['-p', 'node_modules'], { cwd: context.root, reject: true })
      ]);

      if (pkgName.includes('/')) {
        await run('mkdir', ['-p', pkgName.split('/')[0]], {
          cwd: `${context.root}/node_modules`,
          reject: true
        });
      }
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function npmLinkSelfFixture(): MockFixture {
  return {
    name: 'npm-link-self',
    description:
      'soft-linking project repo into node_modules to emulate package installation',
    setup: async (context) => {
      await run('ln', ['-s', resolve(`${__dirname}/..`), pkgName], {
        cwd: `${context.root}/node_modules`,
        reject: true
      });
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function npmCopySelfFixture(): MockFixture {
  return {
    name: 'npm-copy-self',
    description:
      'copying package.json#files into node_modules to emulate package installation',
    setup: async (context) => {
      const root = resolve(`${__dirname}/..`);

      const { files: patterns } = await import('package');

      const files = patterns.flatMap((p) => glob.sync(p, { cwd: root, root }));
      const dest = `${context.root}/node_modules/${pkgName}`;
      const destPkgJson = `${dest}/package.json`;

      context.debug(`cp destination: ${dest}`);
      context.debug(`cp sources (cwd: ${root}): %O`, files);

      await run('mkdir', ['-p', dest], { reject: true });
      await run('cp', ['-r', ...files, dest], { cwd: root, reject: true });

      if (!destPkgJson) {
        throw new Error(`expected "${destPkgJson}" to exist`);
      }

      // TODO: only optionally remove peer dependencies from the install loop
      // TODO: (and by default they should NOT be removed, unlike below).
      // TODO: Same deal with dev dependencies (except removed by default).
      const {
        peerDependencies: _,
        devDependencies: __,
        ...dummyPkgJson
      } = JSON.parse(await readFile(destPkgJson, 'utf8'));

      const installTargets = [context.options.npmInstall]
        .flat()
        .filter((r): r is string => Boolean(r))
        // TODO: fix/merge this
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce<Record<string, string>>((obj, pkgStr) => {
          const pkg = pkgStr.split('@');
          return { ...obj, [pkg[0]]: pkg[1] || 'latest' };
        }, dummyPkgJson.dependencies || {});

      await writeFile(
        destPkgJson,
        JSON.stringify({ ...dummyPkgJson, dependencies: installTargets })
      );

      await run('npm', ['install', '--no-save', '--production', '--force'], {
        cwd: dest,
        reject: true,
        env: { NODE_ENV: 'production', CI: 'true' }
      });

      await run('mv', ['node_modules', 'node_modules_old'], {
        cwd: context.root,
        reject: true
      });

      await run('mv', [`node_modules_old/${pkgName}/node_modules`, '.'], {
        cwd: context.root,
        reject: true
      });

      await run('mv', [`node_modules_old/${pkgName}`, 'node_modules'], {
        cwd: context.root,
        reject: true
      });

      await run('rm', ['-rf', 'node_modules_old'], { cwd: context.root, reject: true });
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function webpackTestFixture(): MockFixture {
  return {
    name: 'webpack-test',
    description: 'setting up webpack jest integration test',
    setup: async (context) => {
      if (typeof context.options.webpackVersion != 'string') {
        throw new TypeError('invalid or missing options.webpackVersion, expected string');
      }

      const indexPath = Object.keys(context.fileContents).find((path) =>
        /^src\/index\.(((c|m)?js)|ts)x?$/.test(path)
      );

      if (!indexPath)
        throw new Error('could not find initial contents for src/index file');

      if (!context.fileContents['webpack.config.js'])
        throw new Error('could not find initial contents for webpack.config.js file');

      await Promise.all([
        writeFile(`${context.root}/${indexPath}`, context.fileContents[indexPath]),
        writeFile(
          `${context.root}/webpack.config.js`,
          context.fileContents['webpack.config.js']
        )
      ]);

      context.treeOutput = await getTreeOutput(context);

      await run(
        'npm',
        [
          'install',
          '--no-save',
          `webpack@${context.options.webpackVersion}`,
          'webpack-cli'
        ],
        {
          cwd: context.root,
          reject: true
        }
      );

      await run('npx', ['webpack'], { cwd: context.root, reject: true });

      const { code, stdout, stderr } = await run('node', [
        `${context.root}/dist/index.js`
      ]);

      context.testResult = {
        code,
        stdout,
        stderr
      };
    }
  };
}

async function getTreeOutput(context: FixtureContext) {
  return (await execa('tree', ['-a', '-L', '2'], { cwd: context.root })).stdout;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function nodeImportTestFixture(): MockFixture {
  return {
    name: 'node-import-test',
    description: 'setting up node import jest integration test',
    setup: async (context) => {
      const indexPath = Object.keys(context.fileContents).find((path) =>
        /^src\/index(\.test)?\.(((c|m)?js)|ts)x?$/.test(path)
      );

      if (!indexPath)
        throw new Error('could not find initial contents for src/index test file');

      await writeFile(`${context.root}/${indexPath}`, context.fileContents[indexPath]);

      // TODO: also test all current/active/maintenance versions of node too
      // TODO: and enable that functionality
      const bin = context.options.runWith?.binary || 'node';
      const args = context.options.runWith?.args || ['--experimental-json-modules'];
      const options = context.options.runWith?.opts || {};

      context.treeOutput = await getTreeOutput(context);

      const { code, stdout, stderr } = await run(bin, [...args, indexPath], {
        cwd: context.root,
        ...options
      });

      context.testResult = {
        code,
        stdout,
        stderr
      };
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function gitRepositoryFixture(): MockFixture {
  return {
    name: 'git-repository',
    description: 'configuring fixture root to be a git repository',
    setup: async (context) => {
      if (context.options.setupGit && typeof context.options.setupGit != 'function') {
        throw new Error('invalid or missing options.setupGit, expected function');
      }

      context.git = gitFactory({ baseDir: context.root });

      await (context.options.setupGit
        ? context.options.setupGit(context.git)
        : context.git
            .init()
            .addConfig('user.name', 'fake-user')
            .addConfig('user.email', 'fake@email'));
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function dummyDirectoriesFixture(): MockFixture {
  return {
    name: 'dummy-directories',
    description: 'creating dummy directories under fixture root',
    setup: async (context) => {
      if (!Array.isArray(context.options.directoryPaths)) {
        throw new TypeError('invalid or missing options.directoryPaths, expected array');
      }

      await Promise.all(
        context.options.directoryPaths.map((path) =>
          run('mkdir', ['-p', path], { cwd: context.root, reject: true })
        )
      );
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function dummyFilesFixture(): MockFixture {
  return {
    name: 'dummy-files',
    description: 'creating dummy files under fixture root',
    setup: async (context) => {
      await Promise.all(
        Object.entries(context.fileContents).map(async ([path, contents]) => {
          const fullPath = `${context.root}/${path}`;
          await accessFile(fullPath).then(
            () => debug(`skipped creating dummy file: file already exists at ${path}`),
            async () => {
              debug(`creating dummy file "${path}" with contents:`);
              debug.extend('contents >')(contents);
              await writeFile(fullPath, (context.fileContents[path] = contents));
            }
          );
        })
      );
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
// ? If a fixture w/ this name isn't included, it's appended
// ! This fixture, when included, is always run even when errors occur!
export function describeRootFixture(): MockFixture {
  return {
    name: 'describe-root',
    description: 'outputting debug information about environment',
    setup: async (context) => {
      context.debug('test identifier: %O', context.testIdentifier);
      context.debug('root: %O', context.root);
      context.debug(context.treeOutput || (await getTreeOutput(context)));
      context.debug('per-file contents: %O', context.fileContents);
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package
export async function withMockedFixture<
  // eslint-disable-next-line @typescript-eslint/ban-types
  CustomOptions extends Record<string, unknown> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  CustomContext extends Record<string, unknown> = {}
>({
  fn,
  testIdentifier,
  options
}: {
  fn: FixtureAction<
    FixtureContext<FixtureOptions & Partial<Record<string, unknown> & CustomOptions>> &
      CustomContext
  >;
  testIdentifier: string;
  options?: Partial<FixtureOptions & CustomOptions>;
}) {
  type CustomizedFixtureOptions = FixtureOptions &
    Partial<Record<string, unknown> & CustomOptions>;
  type CustomizedFixtureContext = FixtureContext<CustomizedFixtureOptions> &
    CustomContext;
  type CustomizedMockFixture = MockFixture<CustomizedFixtureContext>;

  const testSymbol = Symbol('test');
  const finalOptions = {
    performCleanup: true,
    use: [] as MockFixture[],
    initialFileContents: {},
    ...options
  } as CustomizedFixtureOptions & { use: CustomizedMockFixture[] };

  const context = {
    root: '',
    testIdentifier,
    debug,
    using: [] as MockFixture[],
    options: finalOptions,
    fileContents: { ...finalOptions.initialFileContents }
  } as CustomizedFixtureContext & { using: CustomizedMockFixture[] };

  if (finalOptions.use) {
    if (finalOptions.use?.[0]?.name != 'root') context.using.push(rootFixture());
    context.using = [...context.using, ...finalOptions.use];
    // ? `describe-root` fixture doesn't have to be the last one, but a fixture
    // ? with that name must be included at least once
    if (!finalOptions.use.some((f) => f.name == 'describe-root'))
      context.using.push(describeRootFixture());
  } else context.using = [rootFixture(), describeRootFixture()];

  context.using.push({
    name: testSymbol,
    description: '',
    setup: fn
  });

  let ranDescribe = false;
  const cleanupFunctions: NonNullable<CustomizedMockFixture['teardown']>[] = [];

  const setupDebugger = async (fixture: CustomizedMockFixture, error = false) => {
    const toString = async (
      p: CustomizedMockFixture['name'] | CustomizedMockFixture['description']
      // TODO: replace with toss
    ) =>
      typeof p == 'function' ? p(context) : typeof p == 'string' ? p : ':impossible:';
    const name = await toString(fixture.name.toString());
    const desc = await toString(fixture.description);
    const dbg = debug.extend(error ? `${name}:<error>` : name);
    context.debug = dbg;
    dbg(desc);
  };

  /*eslint-disable no-await-in-loop */
  try {
    for (const mockFixture of context.using) {
      if (mockFixture.name == testSymbol) {
        context.debug = debug;
        debug('executing test callback');
      } else {
        await setupDebugger(mockFixture);
        if (mockFixture.teardown) cleanupFunctions.push(mockFixture.teardown);
      }

      mockFixture.setup
        ? await mockFixture.setup(context)
        : context.debug('(warning: mock fixture has no setup function)');

      if (mockFixture.name == 'describe-root') ranDescribe = true;
    }
  } catch (error) {
    context.debug.extend('<error>')('exception occurred: %O', error);
    throw error;
  } finally {
    if (!ranDescribe) {
      const fixture = describeRootFixture();
      await setupDebugger(fixture, true);
      await fixture.setup?.(context);
    }

    context.debug = debug.extend('<cleanup>');

    for (const cfn of cleanupFunctions.reverse()) {
      await cfn(context).catch((error) =>
        context.debug(
          `ignored exception in teardown function: ${
            error?.message || error.toString() || '<no error message>'
          }`
        )
      );
    }
  }
  /*eslint-enable no-await-in-loop */
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ above)
export function mockFixtureFactory<
  // eslint-disable-next-line @typescript-eslint/ban-types
  CustomOptions extends Record<string, unknown> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  CustomContext extends Record<string, unknown> = {}
>(testIdentifier: string, options?: Partial<FixtureOptions & CustomOptions>) {
  return (
    fn: FixtureAction<
      FixtureContext<FixtureOptions & Partial<Record<string, unknown> & CustomOptions>> &
        CustomContext
    >
  ) => withMockedFixture<CustomOptions, CustomContext>({ fn, testIdentifier, options });
}
