/* eslint-disable @typescript-eslint/prefer-string-starts-ends-with */

import { readFile } from 'node:fs/promises';

import { run } from '@-xun/run';
import { createGenericLogger } from 'rejoinder';

const log = createGenericLogger({ namespace: 'husky-hook:pre-push' });
const errorOutputPrefix = '  ⋗ ';

// ! vvv
// !   - Paths should always use forward slashes as separators
// !   - Regexps must not use the global (g) flag

// ? Files with paths matching any of these regexps are never considered
// ? "interesting"
const uninterestingFilePathsRegExps = [
  /(^|\/)\.husky\//,
  /(^|\/)docs\//,
  /(^|\/)assets\/templates\/husky\//,
  /(^|\/)assets\/transformers\/_eslint/,
  /CHANGELOG\.md$/,
  /\.snap$/
];

// ? Files with paths matching this regexp are considered package.json files
const interestingPackageJsonPathRegExp = /^(packages\/[^/]+\/)?package\.json$/;

// ? Files with paths matching this regexp are considered markdown files
const interestingMarkdownPathRegExp = /\.md$/;

// ? Files with paths matching this regexp are considered test files
const interestingTestPathRegExp = /\.test\.ts$/;

// ? A commit message matching any of these regexps will prevent pushes
const unpushableCommitMessageMatchers = [
  {
    regexp: /mergeme/i,
    reason: 'Incomplete commits (contains "mergeme" in their headers)'
  },
  {
    regexp: /\[wip]/i,
    reason: 'Incomplete commits (contains "[wip]" in their headers)'
  },
  {
    regexp: /\[nopush]/i,
    reason: 'Incomplete commits (contains "[nopush]" in their headers)'
  }
];

// ? Interesting files' contents matching any of these regexps will prevent
// ? pushes
const unpushableFileContentMatchers = [
  { regexp: /\bXXX:/i, reason: 'Files at HEAD with "XXX" error comments' }
];

// ? Interesting package.json files' contents matching any of these regexps will
// ? prevent pushes
const unpushablePackageJsonFileContentMatchers = [
  {
    regexp: /--assets-preset [^"]*?('|((basic|cli|lib|react|nextjs) [^"]*){3})/i,
    reason: 'Root package.json files at HEAD with incomplete scripts'
  }
];

// ? Interesting markdown files' contents matching any of these regexps will
// ? prevent pushes
const unpushableMarkdownFileContentMatchers = [
  {
    regexp: /-✄-/iu,
    reason: 'Markdown files at HEAD with unmerged replacer regions'
  }
];

// ? Interesting test files' contents matching any of these regexps will prevent
// ? pushes
const unpushableTestFileContentMatchers = [
  {
    regexp: /(it|test|describe)\.only\(/,
    reason: 'Test files at HEAD with erroneously focused tests'
  }
];

// ! ^^^

if (process.env.GIT_REFLOG_ACTION?.startsWith('rebase')) {
  log.error(
    'Pushing commits in the middle of a rebase/merge/cherry-pick is not allowed!'
  );

  process.exitCode = 1;
} else {
  log('Checking for commits that should not be pushed...');

  const [{ stdout: gitLogCommits }, { stdout: gitLsTreeFiles }] = await Promise.all([
    run('git', ['log', 'HEAD', '--oneline', '--not', '--remotes'], { lines: true }),
    run('git', ['ls-tree', '-r', '--full-tree', '--name-only', 'HEAD'], { lines: true })
  ]);

  const interestingFilePaths = gitLsTreeFiles.filter((path) =>
    uninterestingFilePathsRegExps.every((regexp) => !regexp.test(path))
  );

  /** @type {{[reason: string]: string[]}} */
  const unpushableCommitsLogLines = reduce(
    gitLogCommits.flatMap((line) =>
      unpushableCommitMessageMatchers
        .filter(({ regexp }) => regexp.test(line))
        .map(toEntry(line))
    )
  );

  /** @type {{[reason: string]: string[]}} */
  const unpushableFilePaths = reduce(
    (
      await Promise.all(
        interestingFilePaths.map(async (path) => {
          // ? If the file is not readable, then skip it
          const fileContents = await readFile(path, 'utf8').catch(() => undefined);
          const result = [];

          const isInterestingPackageJson = interestingPackageJsonPathRegExp.test(path);
          const isInterestingMarkdown = interestingMarkdownPathRegExp.test(path);
          const isInterestingTest = interestingTestPathRegExp.test(path);

          if (!fileContents) {
            return result;
          }

          result.push(
            ...unpushableFileContentMatchers
              .filter(({ regexp }) => regexp.test(fileContents))
              .map(toEntry(path))
          );

          if (isInterestingPackageJson) {
            result.push(
              ...unpushablePackageJsonFileContentMatchers
                .filter(({ regexp }) => regexp.test(fileContents))
                .map(toEntry(path))
            );
          }

          if (isInterestingMarkdown) {
            result.push(
              ...unpushableMarkdownFileContentMatchers
                .filter(({ regexp }) => regexp.test(fileContents))
                .map(toEntry(path))
            );
          }

          if (isInterestingTest) {
            result.push(
              ...unpushableTestFileContentMatchers
                .filter(({ regexp }) => regexp.test(fileContents))
                .map(toEntry(path))
            );
          }

          return result;
        })
      )
    ).flat()
  );

  const hasUnpushableCommits = !!Object.keys(unpushableCommitsLogLines).length;
  const hasUnpushableFiles = !!Object.keys(unpushableFilePaths).length;

  if (hasUnpushableCommits || hasUnpushableFiles) {
    log.error('PUSH ABORTED: BAD COMMIT(S) DETECTED!');
    log.error('Rectify the following issues before trying again:');

    Object.entries(unpushableCommitsLogLines).forEach(([reason, lines]) => {
      log.newline();
      log.error(`${reason}:`);
      log.newline();

      lines.forEach((line) => log.error(`${errorOutputPrefix}${line}`));
    });

    Object.entries(unpushableFilePaths).forEach(([reason, lines]) => {
      log.newline();
      log.error(`${reason}:`);
      log.newline();

      lines.forEach((line) => log.error(`${errorOutputPrefix}${line}`));
    });

    process.exitCode = 2;
  } else {
    log('✅');
    process.exitCode = 0;
  }
}

/**
 * Returns a function that maps a RegExp-reason object to a reason-value object
 * entry.
 *
 * @param {string} value
 * @returns {(target: typeof unpushableCommitMessageMatchers[number]) => [
 *  string, string
 * ]}
 */
function toEntry(value) {
  return ({ reason }) => [reason, value];
}

/**
 * Reduces `keysValuesArray` to an object of string keys and aggregated string
 * array values.
 *
 * @param {string[][]} keysValuesArray
 */
function reduce(keysValuesArray) {
  /** @type {Record<string, string[]>} */
  const aggregate = {};

  for (const [key, value] of keysValuesArray) {
    aggregate[key] ??= [];
    aggregate[key].push(value);
  }

  return aggregate;
}
