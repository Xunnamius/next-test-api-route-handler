// This webpack config is only used for compiling the scripts under
// external-scripts/ and helping transpile src/ => dist/ as dual CJS2+ES2015

const DotenvPlugin = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals')

const mainConfig = {
    name: 'main',
    mode: 'production',
    target: 'node',
    node: false,

    entry: `${__dirname}/src/index.ts`,

    output: {
        filename: 'main.js',
        path: `${__dirname}/dist`,
        libraryTarget: 'commonjs2'
    },

    externals: [nodeExternals()],

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

    externals: [nodeExternals()],

    resolve: { extensions: ['.ts', '.js', '.json'] },
    module: { rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }] },
    stats: { warningsFilter: [/critical dependency:/i] },

    plugins: [ new DotenvPlugin() ]
};

module.exports = [ mainConfig, externalsConfig ];
