const debug = require('debug')(`${require('./package.json').name}:eslint-config`);

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['jest', '@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      experimentalObjectRestSpread: true
    },
    extraFileExtensions: ['.mjs', '.cjs'],
    project: 'tsconfig.eslint.json'
  },
  env: {
    es6: true,
    node: true,
    jest: true,
    'jest/globals': true,
    browser: false,
    webextensions: false
  },
  rules: {
    'no-console': 'warn',
    'no-return-await': 'warn',
    'no-await-in-loop': 'warn',
    'import/no-unresolved': ['error', { commonjs: true }],
    'no-extra-boolean-cast': 'off',
    'no-empty': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'warn',
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreVoid: true, ignoreIIFE: true }
    ],
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-expect-error': 'allow-with-description',
        minimumDescriptionLength: 6
      }
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_+',
        varsIgnorePattern: '^_+',
        caughtErrorsIgnorePattern: '^ignored?\\d*$',
        caughtErrors: 'all'
      }
    ],
    // ? Ever since v4, we will rely on TypeScript to catch these
    'no-undef': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-unused-vars': 'off'
  },
  overrides: [
    {
      files: ['*.test.*'],
      extends: ['plugin:jest/all', 'plugin:jest/style'],
      rules: {
        'jest/lowercase': 'off',
        'jest/consistent-test-it': 'off',
        'jest/require-top-level-describe': 'off',
        'jest/valid-describe': 'off',
        'jest/no-hooks': 'off',
        'jest/require-to-throw-message': 'off',
        'jest/prefer-called-with': 'off',
        'jest/prefer-spy-on': 'off',
        'jest/no-if': 'off',
        'jest/no-disabled-tests': 'warn',
        'jest/no-commented-out-tests': 'warn',
        'jest/no-alias-methods': 'off'
      }
    }
  ],
  settings: {
    'import/extensions': ['.ts', '.js'],
    // ? Switch parsers depending on which type of file we're looking at
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
      'babel-eslint': ['.js']
    },
    'import/ignore': [
      // ? Don't go complaining about anything that we don't own
      '.*/node_modules/.*'
    ]
  },
  ignorePatterns: ['coverage', 'dist', 'bin']
};

debug('exports: %O', module.exports);
