'use strict';

const debug = require('debug')(
  `${require('./package.json').name}:semantic-release-config`
);

// TODO: turn this into @xunnamius/semantic-release-projector-config

const updateChangelog =
  process.env.UPDATE_CHANGELOG === 'true' ||
  // ? Legacy
  process.env.SHOULD_UPDATE_CHANGELOG === 'true';

debug(`will update changelog: ${updateChangelog ? 'yes' : 'no'}`);

const { changelogTitle, parserOpts, writerOpts } = require('./conventional.config.js');

module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    {
      name: 'canary',
      channel: 'canary',
      prerelease: true
    }
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        parserOpts,
        releaseRules: [
          // ? releaseRules are checked first; if none match, defaults are
          // ? checked next.

          // ! These two lines must always appear first and in order:
          { breaking: true, release: 'major' },
          { revert: true, release: 'patch' },

          // * Custom release rules, if any, may appear next:
          { type: 'build', release: 'patch' }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts,
        writerOpts
      }
    ],
    ...(updateChangelog
      ? [
          [
            '@semantic-release/exec',
            {
              prepareCmd: 'CHANGELOG_SKIP_TITLE=true npm run build-changelog'
            }
          ],
          ['@semantic-release/changelog', { changelogTitle }],
          [
            '@semantic-release/exec',
            {
              prepareCmd:
                'remark -o --use reference-links --use gfm --use frontmatter CHANGELOG.md'
            }
          ],
          [
            '@semantic-release/exec',
            {
              prepareCmd: 'npx prettier --write CHANGELOG.md'
            }
          ]
        ]
      : []),
    ['@semantic-release/npm'],
    [
      '@semantic-release/git',
      {
        assets: [
          'package.json',
          'package-lock.json',
          'npm-shrinkwrap.json',
          'CHANGELOG.md',
          'docs'
        ],
        message: 'release: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    ['@semantic-release/github']
  ]
};

debug('exports: %O', module.exports);
