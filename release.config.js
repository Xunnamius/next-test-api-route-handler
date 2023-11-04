'use strict';

const debug = require('debug')(
  `${require('./package.json').name}:semantic-release-config`
);

// TODO: replace this with @xunnamius/semantic-release-projector-config

const updateChangelog =
  process.env.UPDATE_CHANGELOG === 'true' ||
  // ? Legacy
  process.env.SHOULD_UPDATE_CHANGELOG === 'true';

debug(`will update changelog: ${updateChangelog ? 'yes' : 'no'}`);

const { changelogTitle, parserOpts, writerOpts } = require('./conventional.config');

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
              prepareCmd: 'CHANGELOG_SKIP_TITLE=true npm run build:changelog'
            }
          ],
          ['@semantic-release/changelog', { changelogTitle }],
          [
            '@semantic-release/exec',
            {
              prepareCmd: 'NODE_ENV=format npx remark --output --frail CHANGELOG.md'
            }
          ],
          [
            // ! Account for marked's incredibly short-sighted decision to
            // ! MIX WARNING TEXT WITH PERFECTLY FINE F****NG OUTPUT TEXT WTF
            '@semantic-release/exec',
            {
              prepareCmd: `node -e '
                const fs = require("node:fs");
                fs.writeFileSync("CHANGELOG.md", fs.readFileSync("CHANGELOG.md", "utf8")
                  .split("\\n")
                  .filter(line => !line.startsWith("marked()"))
                  .join("\\n")
                );
              '`
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
