// This webpack config is used to transpile src to dist, compile externals, etc

const DotenvPlugin = require('dotenv-webpack');
const { config: populateEnv } = require('dotenv');
const nodeExternals = require('webpack-node-externals');
const { verifyEnvironment } = require('./env-expect');
const debug = require('debug')(`${require('./package.json').name}:webpack-config`);

populateEnv();
verifyEnvironment();

const mainConfig = {
  name: 'main',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/index.ts`,

  output: {
    filename: 'index.js',
    path: `${__dirname}/dist/lib`,
    libraryTarget: 'commonjs2'
  },

  externals: [nodeExternals()],
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true
  },

  resolve: { extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'] },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  ignoreWarnings: [/critical dependency:/i]
};

const externalsConfig = {
  name: 'externals',
  mode: 'production',
  target: 'node',
  node: false,

  entry: {
    'is-next-compat': `${__dirname}/external-scripts/is-next-compat.ts`
  },

  output: {
    filename: '[name].js',
    path: `${__dirname}/external-scripts/bin`
  },

  externals: [nodeExternals()],
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true
  },

  resolve: { extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'] },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  ignoreWarnings: [/critical dependency:/i],
  plugins: [new DotenvPlugin()]
};

module.exports = [mainConfig, externalsConfig];
debug('exports = %O', module.exports);
