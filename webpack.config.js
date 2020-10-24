// This webpack config is used for compiling the scripts under external-scripts/
// and helping transpile src/ => dist/ as dual CJS2+ES2015

const DotenvPlugin = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');

const mainConfig = {
    name: 'main',
    mode: 'production',
    target: 'node',
    node: false,

    entry: `${__dirname}/src/index.ts`,

    output: {
        filename: 'index.js',
        path: `${__dirname}/dist/lib`,
        libraryTarget: 'commonjs2',
    },

    externals: [nodeExternals()],

    stats: {
        //orphanModules: true, // ? Webpack 5
        providedExports: true,
        usedExports: true,
    },

    resolve: { extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'] },
    module: { rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }] },
    optimization: { usedExports: true },
    //ignoreWarnings: [/critical dependency:/i], // ? Webpack 5
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
        path: `${__dirname}/external-scripts/bin`,
    },

    externals: [nodeExternals()],

    stats: {
        //orphanModules: true, // ? Webpack 5
        providedExports: true,
        usedExports: true,
    },

    resolve: { extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'] },
    module: { rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }] },
    optimization: { usedExports: true },
    //ignoreWarnings: [/critical dependency:/i], // ? Webpack 5
    plugins: [ new DotenvPlugin() ],
};

module.exports = [ mainConfig, externalsConfig ];
