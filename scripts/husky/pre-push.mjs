// @ts-check

/**
 * Pre-push hook used by Husky.
 */

import { spawnSync } from 'node:child_process';
import { EOL } from 'node:os';

/** @param {unknown} line */
function writeOut(line) {
  process.stdout.write(String(line) + EOL);
}

/** @param {unknown} line */
function writeError(line) {
  process.stderr.write(String(line) + EOL);
}

/** @param {string[]} args */
function git(args) {
  const res = spawnSync('git', args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  if (res.status && res.status !== 0) {
    const message = (res.stderr || res.stdout || '').trim();
    throw new Error(`git ${args.join(' ')} failed: ${message}`);
  }
  const out = res.stdout || '';
  return out.endsWith('\n') || out.endsWith('\r\n') ? out.replace(/\r?\n$/, '') : out;
}

/**
 * Get files tracked at HEAD (paths only)
 * @returns {string[]}
 */
function listFilesAtHEAD() {
  const out = git(['ls-tree', '-r', '--full-tree', '--name-only', 'HEAD']);
  return out.split(/\r?\n/).filter(Boolean);
}

/**
 * Read a file's content as it exists at HEAD.
 * @param {string} path
 */
function readHeadFile(path) {
  const res = spawnSync('git', ['show', `HEAD:${path}`], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50
  });
  if (res.status !== 0) return '';
  return res.stdout || '';
}

/**
 * Prefix each line with a string.
 * @param {string} prefix
 * @param {string[]} lines
 */
function prepend(prefix, lines) {
  return lines.map((l) => `${prefix}${l}`);
}

function main() {
  const action = process.env.GIT_REFLOG_ACTION || '';
  if (action.startsWith('rebase')) {
    throw new Error(
      'husky-hook::pre-push: pushing commits in the middle of a rebase/merge/cherry-pick is not allowed!'
    );
  }

  writeOut('husky-hook::pre-push: checking for commits that should not be pushed...');

  // Commits not on any remote
  const log = git(['log', 'HEAD', '--oneline', '--not', '--remotes']);
  const logLines = log ? log.split(/\r?\n/) : [];

  // Incomplete commit subjects
  const incompleteCommitLines = logLines.filter((line) => {
    const subj = line; // one-line log already
    return /mergeme/i.test(subj) || /\[(?:WIP|NOPUSH)\]/i.test(subj);
  });
  const hasIncompleteCommits = incompleteCommitLines.length > 0;

  // Gather files
  const allHeadFiles = listFilesAtHEAD();
  const excludeDirRe =
    /(^|\/)\.(?:husky)(?:\/|$)|(^|\/)assets\/templates\/husky\/|(^|\/)scripts\/husky\//;
  const interestingXxxFiles = allHeadFiles.filter(
    (p) => !excludeDirRe.test(p) && !p.endsWith('.snap')
  );

  // Subsets
  const interestingMdFiles = interestingXxxFiles.filter((p) => {
    const lower = p.toLowerCase();
    return (
      lower.endsWith('.md') &&
      !/(^|\/)(src|test|docs)\//i.test(p) &&
      !lower.endsWith('/changelog.md')
    );
  });
  const interestingTestFiles = interestingXxxFiles.filter((p) =>
    p.toLowerCase().endsWith('.test.ts')
  );
  const interestingPackageJsonFiles = interestingXxxFiles.filter((p) => {
    if (p === 'package.json') return true;
    if (p.startsWith('packages/')) {
      const parts = p.split('/');
      return parts.length === 3 && parts[2] === 'package.json';
    }
    return false;
  });

  // Checks against HEAD contents
  /** @type {string[]} */
  const filesWithXXX = [];
  for (const f of interestingXxxFiles) {
    const txt = readHeadFile(f);
    if (txt.includes('XXX: ')) filesWithXXX.push(f);
  }

  /** @type {string[]} */
  const filesWithMdMarkers = [];
  for (const f of interestingMdFiles) {
    const txt = readHeadFile(f);
    if (/-✄-/i.test(txt)) filesWithMdMarkers.push(f);
  }

  /** @type {string[]} */
  const filesWithFocusedTests = [];
  for (const f of interestingTestFiles) {
    const txt = readHeadFile(f);
    if (/(?:^|\W)(it|test|describe)\.only\(/i.test(txt)) filesWithFocusedTests.push(f);
  }

  /** @type {string[]} */
  const packageJsonsWithIncompleteScripts = [];
  // Ported PCRE to JS: --assets-preset followed by any non-" up to either a single quote or 3 occurrences of (basic|cli|lib|react|nextjs ...)
  const packageRe =
    /--assets-preset [^"]*?(?:'|(?:(?:basic|cli|lib|react|nextjs) [^"]*){3})/i;
  for (const f of interestingPackageJsonFiles) {
    const txt = readHeadFile(f);
    if (packageRe.test(txt)) packageJsonsWithIncompleteScripts.push(f);
  }

  const hasMdMarkers = filesWithMdMarkers.length > 0;
  const hasXXX = filesWithXXX.length > 0;
  const hasFocused = filesWithFocusedTests.length > 0;
  const hasPackageIssues = packageJsonsWithIncompleteScripts.length > 0;

  if (hasIncompleteCommits || hasMdMarkers || hasXXX || hasFocused || hasPackageIssues) {
    writeError('husky-hook::pre-push: BAD COMMIT(S) DETECTED!');
    writeError(
      'husky-hook::pre-push: merge, delete, reword, or otherwise rectify the following commits before trying again:'
    );

    if (hasIncompleteCommits) {
      writeError('');
      writeError(
        'husky-hook::pre-push: incomplete commits (e.g. WIP, mergeme, NOPUSH):'
      );
      writeError('');
      const lines = incompleteCommitLines.map((l) => `  ⋗ ${l}`);
      writeError(lines.join(EOL));
    }

    if (hasMdMarkers) {
      writeError('');
      writeError(
        'husky-hook::pre-push: markdown files at HEAD with unmerged replacer regions:'
      );
      writeError('');
      writeError(prepend('  ⋗ ', filesWithMdMarkers).join(EOL));
    }

    if (hasXXX) {
      writeError('');
      writeError('husky-hook::pre-push: files at HEAD with "XXX" error comments:');
      writeError('');
      writeError(prepend('  ⋗ ', filesWithXXX).join(EOL));
    }

    if (hasFocused) {
      writeError('');
      writeError('husky-hook::pre-push: files at HEAD with erroneously focused tests:');
      writeError('');
      writeError(prepend('  ⋗ ', filesWithFocusedTests).join(EOL));
    }

    if (hasPackageIssues) {
      writeError('');
      writeError(
        'husky-hook::pre-push: package.json files at HEAD with incomplete scripts:'
      );
      writeError('');
      writeError(prepend('  ⋗ ', packageJsonsWithIncompleteScripts).join(EOL));
    }

    writeError('');
    throw new Error('husky-hook::pre-push: validation failed');
  }

  writeOut('husky-hook::pre-push: ✅');
}

main();
