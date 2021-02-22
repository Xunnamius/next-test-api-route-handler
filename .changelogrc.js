// ? See https://github.com/conventional-changelog/conventional-changelog

const debug = require('debug')(
  `${require('./package.json').name}:conventional-changelog-config`
);

const escapeRegExpStr = require('escape-string-regexp');
const semver = require('semver');
const execa = require('execa');

// ? Commit types that trigger releases by default (using angular configuration)
// ? See https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
const DEFAULT_RELEASED_TYPES = ['feat', 'fix', 'perf'];

// ? Same options as commit-analyzer's releaseRules (see
// ? https://github.com/semantic-release/commit-analyzer#releaserules) with the
// ? addition of the `title` property to set the resulting section title
const ADDITIONAL_RELEASE_RULES = [
  { type: 'build', release: 'patch', title: 'Build System' }
];

const changelogTitle =
  `# Changelog\n\n` +
  `All notable changes to this project will be documented in this file.\n\n` +
  `The format is based on [Conventional Commits](https://conventionalcommits.org),\n` +
  `and this project adheres to [Semantic Versioning](https://semver.org).`;

// ? Strings in commit messages that, when found, are skipped
// ! These also have to be updated in build-test-deploy.yml and cleanup.yml
const SKIP_COMMANDS = '[skip ci], [ci skip], [skip cd], [cd skip]'.split(', ');

debug('SKIP_COMMANDS:', SKIP_COMMANDS);

// ! XXX: dark magic to synchronously deal with this async package
// TODO: fork this package and offer a sync export instead of this dark magic
let wait;
try {
  wait = execa.sync('node', [
    '-e',
    'require("conventional-changelog-angular").then(o => console.log(o.writerOpts.transform.toString()));'
  ]).stdout;
} catch (e) {
  throw new Error(`failed to acquire angular transformation: ${e}`);
}

const transform = Function(`"use strict";return (${wait})`)();
const sentenceCase = (s) => s.toString().charAt(0).toUpperCase() + s.toString().slice(1);

const extraReleaseTriggerCommitTypes = ADDITIONAL_RELEASE_RULES.map((r) => r.type);
const allReleaseTriggerCommitTypes = [
  DEFAULT_RELEASED_TYPES,
  extraReleaseTriggerCommitTypes
].flat();

debug('extra types that trigger releases: %O', extraReleaseTriggerCommitTypes);
debug('all types that trigger releases: %O', allReleaseTriggerCommitTypes);

// ? Releases made before this repo adopted semantic-release. They will be
// ? collected together under a single header
const legacyReleases = [];
let shouldGenerate = true;

module.exports = {
  changelogTitle,
  additionalReleaseRules: ADDITIONAL_RELEASE_RULES.map(({ title, ...r }) => r),
  parserOpts: {
    mergePattern: /^Merge pull request #(\d+) from (.*)$/,
    mergeCorrespondence: ['id', 'source'],
    noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
    // eslint-disable-next-line no-console
    warn: console.warn.bind(console)
  },
  writerOpts: {
    generateOn: (commit) => {
      const decision =
        shouldGenerate === 'always' ||
        (shouldGenerate &&
          !!semver.valid(commit.version) &&
          !semver.prerelease(commit.version));
      debug(`::generateOn shouldGenerate: ${shouldGenerate} [decision: ${decision}]`);
      shouldGenerate = true;
      return decision;
    },
    transform: (commit, context) => {
      const version = commit.version || null;
      const firstRelease = version === context.gitSemverTags?.slice(-1)[0]?.slice(1);

      debug('::transform encountered commit: %O', commit);
      debug(`::transform commit version: ${version}`);
      debug(`::transform commit firstRelease: ${firstRelease}`);

      if (commit.revert) {
        debug('::transform coercing to type "revert"');
        commit.type = 'revert';
      } else if (commit.type == 'revert') {
        debug('::transform ignoring malformed revert commit');
        return null;
      }

      commit.originalType = commit.type;

      if (!firstRelease || commit.type) {
        // ? This commit does not have a type, but has a version. It must be a
        // ? legacy release!
        if (version && !commit.type) {
          debug('::transform determined commit is legacy release');
          legacyReleases.push(commit);
          commit = null;
          shouldGenerate = false;
        } else {
          let fakeFix = false;

          if (extraReleaseTriggerCommitTypes.includes(commit.type)) {
            debug(`::transform encountered custom commit type: ${commit.type}`);
            commit.type = 'fix';
            fakeFix = true;
          }

          commit = transform(commit, context);

          debug('::transform angular transformed commit: %O', commit);

          if (commit) {
            if (fakeFix) {
              commit.type = ADDITIONAL_RELEASE_RULES.find(
                (r) => r.type == commit.originalType
              )?.title;
              debug('::transform debug: %O', ADDITIONAL_RELEASE_RULES);
              debug(`::transform commit type set to custom title: ${commit.type}`);
            } else commit.type = sentenceCase(commit.type);

            // ? Ignore any commits with skip commands in them
            if (SKIP_COMMANDS.some((cmd) => commit.subject?.includes(cmd))) {
              debug(`::transform saw skip command in commit message; commit skipped`);
              return null;
            }

            if (commit.subject) {
              // ? Make scope-less commit subjects sentence case in the
              // ? changelog per my tastes
              if (!commit.scope) commit.subject = sentenceCase(commit.subject);

              // ? Italicize reverts per my tastes
              if (commit.originalType == 'revert') commit.subject = `*${commit.subject}*`;
            }

            // ? For breaking changes, make all scopes and subjects bold.
            // ? Scope-less subjects are made sentence case. All per my
            // ? tastes
            commit.notes.forEach((note) => {
              if (note.text) {
                debug('::transform saw BC notes for this commit');
                const [firstLine, ...remainder] = note.text.trim().split('\n');
                note.text =
                  `**${!commit.scope ? sentenceCase(firstLine) : firstLine}**` +
                  remainder.reduce((result, line) => `${result}\n${line}`, '');
              }
            });
          }
        }
      }

      // ? If this is the commit representing the earliest release (and there
      // ? are legacy releases), use this commit to report collected legacy
      // ? releases
      else {
        debug('::transform generating summary legacy release commit');
        shouldGenerate = 'always';

        const getShortHash = (h) => h.substring(0, 7);
        const shortHash = getShortHash(commit.hash);
        const url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;

        const subject = legacyReleases
          .reverse()
          .map(({ hash, version }) => ({
            url: `[${getShortHash(hash)}](${url}/commit/${hash})`,
            version
          }))
          .reduce(
            (subject, { url, version }) => `Version ${version} (${url})\n\n- ${subject}`,
            `Version ${commit.version}`
          );

        commit = {
          type: null,
          scope: null,
          subject,
          id: null,
          source: null,
          merge: null,
          header: null,
          body: null,
          footer: null,
          notes: [],
          references: [],
          mentions: [],
          revert: null,
          hash: commit.hash,
          shortHash,
          gitTags: null,
          committerDate: 'pre-CI/CD',
          version: 'Archived Releases'
        };
      }

      debug('::transform final commit: %O', commit);
      return commit;
    }
  }
};

debug('exports: %O', module.exports);
