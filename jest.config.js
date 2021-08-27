'use strict';

module.exports = {
  restoreMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  // ? 1 hour so MMS and other tools don't choke during debugging
  testTimeout: 60000,
  verbose: false,
  testPathIgnorePatterns: ['/node_modules/'],
  // ! If changed, also update these aliases in tsconfig.json,
  // ! webpack.config.js, next.config.ts, and .eslintrc.js
  moduleNameMapper: {
    '^universe/(.*)$': '<rootDir>/src/$1',
    '^multiverse/(.*)$': '<rootDir>/lib/$1',
    '^testverse/(.*)$': '<rootDir>/test/$1',
    '^externals/(.*)$': '<rootDir>/external-scripts/$1',
    '^types/(.*)$': '<rootDir>/types/$1',
    '^package$': '<rootDir>/package.json'
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts?(x)', 'external-scripts/**/*.ts?(x)']
};
