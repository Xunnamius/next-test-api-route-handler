// This webpack config is only used for compiling the scripts under
// external-scripts/ and transpiling src/ to UMD+ES2015 and depositing bundled
// output to dist/

const DotenvPlugin = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

process.env.NODE_ENV = 'external';

const umdConfig = {
    name: 'umd',
    target: 'node',
    mode: 'production',
    entry: `${__dirname}/src/index.ts`,

    output: {
        filename: 'umd.js',
        path: `${__dirname}/dist`,
        globalObject: 'this',
        libraryTarget: 'umd'
    },

    resolve: { extensions: ['.ts', '.js'] },
    module: { rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }] },
    stats: { warningsFilter: [/critical dependency:/i] }
};

const externalsConfig = {
    name: 'externals',
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
        new CopyWebpackPlugin({ patterns: [{ from: './node_modules/shelljs/src/exec-child.js', to: '' }]})
    ]
};

module.exports = [ umdConfig, externalsConfig ];
