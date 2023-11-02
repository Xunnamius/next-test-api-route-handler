'use strict';

/**
 * @type {import('prettier').Options}
 */
module.exports = {
  endOfLine: 'lf',
  printWidth: 80,
  proseWrap: 'always',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  overrides: [
    {
      files: '**/*.?(@(c|m))@(ts|js)?(x)',
      options: {
        parser: 'babel-ts',
        printWidth: 90
      }
    }
  ]
};
