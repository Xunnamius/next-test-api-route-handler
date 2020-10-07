// * Every now and then, take best practices from CRA
// * https://tinyurl.com/yakv4ggx

const targets = '>1% in US and not ie 11';

module.exports = {
    parserOpts: { strictMode: true },
    plugins: [
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-json-strings',
        // * https://babeljs.io/blog/2018/09/17/decorators
        // ? We're using the legacy proposal b/c that's what TypeScript wants
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-function-bind',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-transform-typescript',
    ],
    env: {
        // * Used by Jest and `npm test`
        test: {
            sourceMaps: 'both',
            presets: [
                ['@babel/preset-env', { targets: targets }],
                ['@babel/preset-typescript', { allowDeclareFields: true }]
            ]
        },
        // * Used by `npm run build`
        production: {
            presets: [
                ['@babel/preset-env', { targets: targets }],
                ['@babel/preset-typescript', { allowDeclareFields: true }]
            ]
        },
    }
};
