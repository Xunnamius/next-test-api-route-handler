'use strict';

/**
 * These scripts are the constituent parts of the `npm run format` command.
 */
module.exports = {
  '*.md': [
    'npx remark --output --ignore-path=.prettierignore --silently-ignore',
    'npx doctoc --no-title --maxlevel=3 --update-only'
  ],
  'package.json': 'sort-package-json',
  '*': 'prettier --write --ignore-unknown'
};
