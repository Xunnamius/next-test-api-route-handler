'use strict';

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
      files: '**/*.@(ts|?(@(c|m))js)?(x)',
      options: {
        parser: 'babel-ts',
        printWidth: 90
      }
    }
  ]
};
