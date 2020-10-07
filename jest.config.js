module.exports = {
    collectCoverageFrom: [
        '**/*.{js,ts}',
        '!**/*.d.ts',
        '!**/node_modules/**'
    ],
    testEnvironment: 'node',
    testRunner: 'jest-circus/runner',
    verbose: false,
    testPathIgnorePatterns: [ '/node_modules/' ],
    setupFilesAfterEnv: [ 'jest-extended' ]
};
