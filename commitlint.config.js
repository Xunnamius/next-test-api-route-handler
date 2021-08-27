'use strict';

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'feature',
        'fix',
        'perf',
        'revert',
        'build',
        'docs',
        'style',
        'refactor',
        'test',
        'ci',
        'cd',
        'chore'
      ]
    ]
  }
};
