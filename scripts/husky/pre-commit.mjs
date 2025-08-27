// @ts-check

/**
 * Pre-commit hook used by Husky.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {unknown} line */
/** @param {unknown} line */
function writeOut(line) {
  process.stdout.write(String(line) + '\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');

/**
 * Spawn a process synchronously, inheriting stdio.
 * Throws on non-zero exit.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ cwd?: string, env?: Record<string, string | undefined> }} [options]
 */
function run(cmd, args, options) {
  const envObj = { ...process.env };
  if (options?.env) Object.assign(envObj, options.env);
  const spawnOptions = /** @type {any} */ ({
    stdio: 'inherit',
    cwd: options?.cwd || ROOT,
    env: envObj,
    windowsHide: true,
    shell: false
  });
  const res = spawnSync(cmd, args, spawnOptions);
  if (res.error) throw res.error;
  if (typeof res.status === 'number' && res.status !== 0) {
    const pretty = [cmd, ...args].join(' ');
    throw new Error(`Command failed (${res.status}): ${pretty}`);
  }
}

/**
 * Resolve a local binary from node_modules/.bin, with Windows compatibility.
 * @param {string} name
 */
function binPath(name) {
  const isWin = process.platform === 'win32';
  return path.join(ROOT, 'node_modules', '.bin', isWin ? `${name}.cmd` : name);
}

function main() {
  const action = process.env.GIT_REFLOG_ACTION || '';
  if (action.startsWith('rebase')) {
    writeOut('husky-hook::commit-msg: skipped pre-commit hook due to rebase');
    return;
  }

  // Run package lint unless GAC_VERIFY_SIMPLE is set
  if (!process.env.GAC_VERIFY_SIMPLE) {
    const effectiveNodeEnv =
      typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development';
    run('npm', ['run', 'lint:package'], { env: { NODE_ENV: effectiveNodeEnv } });
  }

  // Run lint-staged with NODE_NO_WARNINGS=1 (set temporarily for this process)
  const previousNodeNoWarnings = process.env.NODE_NO_WARNINGS;
  try {
    const effectiveNodeEnv =
      typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'development';
    run(
      binPath('lint-staged'),
      ['--concurrent', 'false', '--config', 'lint-staged.config.mjs'],
      {
        env: { NODE_NO_WARNINGS: '1', NODE_ENV: effectiveNodeEnv }
      }
    );
  } finally {
    // no-op; we don't mutate process.env anymore
    void previousNodeNoWarnings;
  }

  // Run symbiote clean with flags
  run(binPath('symbiote'), [
    'clean',
    '--env',
    'NODE_NO_WARNINGS=1',
    '--only-empty-directories',
    '--hush',
    '--scope',
    'unlimited'
  ]);
}

main();
