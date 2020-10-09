// This webpack config is only used for compiling the scripts under
// external-scripts/

const DotenvPlugin = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

process.env.NODE_ENV = 'external';

module.exports = {
    mode: 'production',
    target: 'node',
    node: false,

    entry: {
        'is-next-compat': `${__dirname}/external-scripts/is-next-compat.ts`,
    },

    output: {
        filename: '[name].js',
        path: `${__dirname}/external-scripts/bin`
    },

    resolve: {
        extensions: ['.ts', '.js', '.json'],
        // ! If changed, also update these aliases in tsconfig.json,
        // ! jest.config.js, and .eslintrc.js
        alias: {
            universe: `${__dirname}/src/`,
            multiverse: `${__dirname}/lib/`,
            testverse: `${__dirname}/src/__test__/`
            // ? We don't care about types at this point
        }
    },

    module: {
        rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }],
    },

    stats: {
        warningsFilter: [/critical dependency:/i],
    },

    plugins: [
        new DotenvPlugin(),
        new CopyWebpackPlugin({
            patterns: [{ from: './node_modules/shelljs/src/exec-child.js', to: '' }]
        })
    ]
};
