import { name as pkgName, version as pkgVersion } from '../package.json';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import execa from 'execa';
import uniqueFilename from 'unique-filename';
import debugFactory from 'debug';
import gitFactory from 'simple-git';
import 'jest-extended';

import type { ExecaReturnValue } from 'execa';
import type { AnyFunction, AnyVoid } from '@ergodark/types';
import type { Debugger } from 'debug';
import type { SimpleGit } from 'simple-git';

const { writeFile, access: accessFile } = fs;
const debug = debugFactory(`${pkgName}:jest-setup`);

debug(`pkgName: "${pkgName}"`);
debug(`pkgVersion: "${pkgVersion}"`);

// TODO: XXX: add this to @ergodark/types:
export function asMockedFunction<T extends AnyFunction = never>(): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn: T): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn?: T): jest.MockedFunction<T> {
  return ((fn || jest.fn()) as unknown) as jest.MockedFunction<T>;
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
  const prevArgv = process.argv.splice(options?.replace ? 0 : 2, process.argv.length);
  process.argv.push(...newArgv);

  await fn();

  process.argv.splice(options?.replace ? 0 : 2, process.argv.length);
  process.argv.push(...prevArgv);
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
  const prevEnv = { ...process.env };
  const clearEnv = () =>
    Object.getOwnPropertyNames(process.env).forEach((prop) => delete process.env[prop]);

  // ? Take care to preserve the original env object reference in memory
  if (options.replace) clearEnv();
  Object.assign(process.env, newEnv);

  await fn();

  clearEnv();
  Object.assign(process.env, prevEnv);
}

// TODO: XXX: make this into a separate (mock-env) package (along w/ the above)
export function mockEnvFactory(
  newEnv: Record<string, string>,
  options: MockEnvOptions = { replace: true }
) {
  const factoryNewEnv = newEnv;
  const factoryOptions = options;

  return (
    fn: () => AnyVoid,
    newEnv?: Record<string, string>,
    options?: MockEnvOptions
  ) => {
    return withMockedEnv(
      fn,
      { ...factoryNewEnv, ...(newEnv || {}) },
      options || factoryOptions
    );
  };
}

// TODO: XXX: make this into a separate (jest-isolated-import) package
export async function isolatedImport(path: string) {
  let pkg: Promise<unknown> | undefined;

  // ? Cache-busting
  jest.isolateModules(() => {
    pkg = ((r) => {
      debug(
        `performing isolated import of ${path} as ${r.__esModule ? 'es' : 'cjs'} module`
      );

      if (!r.__esModule && r.default) {
        debug(
          'WARNING: treating module with default export as CJS instead of ESM, which could cause undefined behavior!'
        );
      }

      return r.__esModule ? r.default : r;
    })(require(path));
  });

  return pkg;
}

// TODO: XXX: make this into a separate package (along with the above)
export function isolatedImportFactory(path: string) {
  return () => isolatedImport(path);
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
  return async (params?: { expectedExitCode?: number }) => {
    let pkg: unknown = undefined;

    await withMockedExit(async ({ exitSpy }) => {
      pkg = await isolatedImport(path);
      if (expect && params?.expectedExitCode)
        expect(exitSpy).toBeCalledWith(params.expectedExitCode);
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
  }) => AnyVoid
) {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);

  try {
    await fn({
      logSpy,
      warnSpy,
      errorSpy,
      infoSpy
    });
  } finally {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
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

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export interface FixtureOptions
  extends Partial<WebpackTestFixtureOptions>,
    Partial<GitRepositoryFixtureOptions>,
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
export type FixtureAction<Context = FixtureContext> = (ctx: Context) => Promise<unknown>;

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export type ReturnsString<Context = FixtureContext> = (
  ctx: Context
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
    description: (ctx) =>
      `creating a unique root directory${
        ctx.options.performCleanup && ' (will be deleted after all tests complete)'
      }`,
    setup: async (ctx) => {
      ctx.root = uniqueFilename(tmpdir(), ctx.testIdentifier);

      await run('mkdir', ['-p', ctx.root], { reject: true });
      await run('mkdir', ['-p', 'src'], { cwd: ctx.root, reject: true });
    },
    teardown: async (ctx) =>
      ctx.options.performCleanup && run('rm', ['-rf', ctx.root], { reject: true })
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function dummyNpmPackageFixture(): MockFixture {
  return {
    name: 'dummy-npm-package',
    description: 'creating package.json file and node_modules subdirectory',
    setup: async (ctx) => {
      await Promise.all([
        writeFile(
          `${ctx.root}/package.json`,
          (ctx.fileContents['package.json'] =
            ctx.fileContents['package.json'] || '{"name":"dummy-pkg"}')
        ),
        run('mkdir', ['-p', 'node_modules'], { cwd: ctx.root, reject: true })
      ]);

      if (pkgName.includes('/')) {
        await run('mkdir', ['-p', pkgName.split('/')[0]], {
          cwd: `${ctx.root}/node_modules`,
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
    setup: async (ctx) => {
      await run('ln', ['-s', resolve(`${__dirname}/..`), pkgName], {
        cwd: `${ctx.root}/node_modules`,
        reject: true
      });
    }
  };
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function webpackTestFixture(): MockFixture {
  return {
    name: 'webpack-test',
    description: 'setting up webpack jest integration test',
    setup: async (ctx) => {
      if (typeof ctx.options.webpackVersion != 'string') {
        throw new Error('invalid or missing options.webpackVersion, expected string');
      }

      const indexPath = Object.keys(ctx.fileContents).find((path) =>
        /^src\/index\.(((c|m)?js)|ts)x?$/.test(path)
      );

      if (!indexPath)
        throw new Error('could not find initial contents for src/index file');

      if (!ctx.fileContents['webpack.config.js'])
        throw new Error('could not find initial contents for webpack.config.js file');

      await Promise.all([
        writeFile(`${ctx.root}/${indexPath}`, ctx.fileContents[indexPath]),
        writeFile(`${ctx.root}/webpack.config.js`, ctx.fileContents['webpack.config.js'])
      ]);

      ctx.treeOutput = await getTreeOutput(ctx);

      await run(
        'npm',
        ['install', `webpack@${ctx.options.webpackVersion}`, 'webpack-cli'],
        {
          cwd: ctx.root,
          reject: true
        }
      );

      await run('npx', ['webpack'], { cwd: ctx.root, reject: true });

      const { code, stdout, stderr } = await run('node', [`${ctx.root}/dist/index.js`]);

      ctx.testResult = {
        code,
        stdout,
        stderr
      };
    }
  };
}

async function getTreeOutput(ctx: FixtureContext) {
  return (await execa('tree', ['-a'], { cwd: ctx.root })).stdout;
}

// TODO: XXX: make this into a separate (mock-fixture) package (along w/ below)
export function nodeImportTestFixture(): MockFixture {
  return {
    name: 'node-import-test',
    description: 'setting up node import jest integration test',
    setup: async (ctx) => {
      const indexPath = Object.keys(ctx.fileContents).find((path) =>
        /^src\/index\.(((c|m)?js)|ts)x?$/.test(path)
      );

      if (!indexPath)
        throw new Error('could not find initial contents for src/index file');

      await writeFile(`${ctx.root}/${indexPath}`, ctx.fileContents[indexPath]);

      ctx.treeOutput = await getTreeOutput(ctx);

      const { code, stdout, stderr } = await run(
        'node',
        ['--experimental-json-modules', indexPath],
        { cwd: ctx.root }
      );

      ctx.testResult = {
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
    setup: async (ctx) => {
      if (ctx.options.setupGit && typeof ctx.options.setupGit != 'function') {
        throw new Error('invalid or missing options.setupGit, expected function');
      }

      ctx.git = gitFactory({ baseDir: ctx.root });

      await (ctx.options.setupGit
        ? ctx.options.setupGit(ctx.git)
        : ctx.git
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
    setup: async (ctx) => {
      if (!Array.isArray(ctx.options.directoryPaths)) {
        throw new Error('invalid or missing options.directoryPaths, expected array');
      }

      await Promise.all(
        ctx.options.directoryPaths.map((path) =>
          run('mkdir', ['-p', path], { cwd: ctx.root, reject: true })
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
    setup: async (ctx) => {
      await Promise.all(
        Object.entries(ctx.fileContents).map(async ([path, contents]) => {
          const fullPath = `${ctx.root}/${path}`;
          await accessFile(fullPath).then(
            () => debug(`skipped creating dummy file: file already exists at ${path}`),
            async () => {
              debug(`creating dummy file "${path}" with contents:`);
              debug.extend('contents >')(contents);
              await writeFile(fullPath, (ctx.fileContents[path] = contents));
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
    setup: async (ctx) => {
      ctx.debug('test identifier: %O', ctx.testIdentifier);
      ctx.debug('root: %O', ctx.root);
      ctx.debug(ctx.treeOutput || (await getTreeOutput(ctx)));
      ctx.debug('per-file contents: %O', ctx.fileContents);
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

  const ctx = {
    root: '',
    testIdentifier,
    debug,
    using: [] as MockFixture[],
    options: finalOptions,
    fileContents: { ...finalOptions.initialFileContents }
  } as CustomizedFixtureContext & { using: CustomizedMockFixture[] };

  if (finalOptions.use) {
    if (finalOptions.use?.[0]?.name != 'root') ctx.using.push(rootFixture());
    ctx.using = [...ctx.using, ...finalOptions.use];
    // ? `describe-root` fixture doesn't have to be the last one, but a fixture
    // ? with that name must be included at least once
    if (!finalOptions.use.find((f) => f.name == 'describe-root'))
      ctx.using.push(describeRootFixture());
  } else ctx.using = [rootFixture(), describeRootFixture()];

  ctx.using.push({
    name: testSymbol,
    description: '',
    setup: fn
  });

  let ranDescribe = false;
  const cleanupFunctions: NonNullable<CustomizedMockFixture['teardown']>[] = [];

  const setupDebugger = async (fixture: CustomizedMockFixture, error = false) => {
    const toString = async (
      p: CustomizedMockFixture['name'] | CustomizedMockFixture['description']
    ) => (typeof p == 'function' ? p(ctx) : typeof p == 'string' ? p : ':impossible:');
    const name = await toString(fixture.name.toString());
    const desc = await toString(fixture.description);
    const dbg = debug.extend(error ? `${name}:<error>` : name);
    ctx.debug = dbg;
    dbg(desc);
  };

  /*eslint-disable no-await-in-loop */
  try {
    for (const mockFixture of ctx.using) {
      if (mockFixture.name == testSymbol) {
        ctx.debug = debug;
        debug('executing test callback');
      } else {
        await setupDebugger(mockFixture);
        if (mockFixture.teardown) cleanupFunctions.push(mockFixture.teardown);
      }

      mockFixture.setup
        ? await mockFixture.setup(ctx)
        : ctx.debug('(warning: mock fixture has no setup function)');

      if (mockFixture.name == 'describe-root') ranDescribe = true;
    }
  } catch (e) {
    ctx.debug.extend('<error>')('exception occurred: %O', e);
    throw e;
  } finally {
    if (!ranDescribe) {
      const fixture = describeRootFixture();
      await setupDebugger(fixture, true);
      await fixture.setup?.(ctx);
    }

    ctx.debug = debug.extend('<cleanup>');

    for (const cfn of cleanupFunctions.reverse()) {
      await cfn(ctx).catch((e) =>
        ctx.debug(
          `ignored exception in teardown function: ${
            e?.message || e.toString() || '<no error message>'
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
