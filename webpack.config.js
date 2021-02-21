// This webpack config is used to transpile src to dist, compile externals,
// compile executables, etc

const { EnvironmentPlugin, DefinePlugin, BannerPlugin } = require('webpack');
const { config: populateEnv } = require('dotenv');
const { verifyEnvironment } = require('./expect-env');
const nodeExternals = require('webpack-node-externals');
const debug = require('debug')(`${require('./package.json').name}:webpack-config`);

let enableDotenvSupport = false;

try {
  require('fs').access('.env');
  enableDotenvSupport = true;
} catch {}

const dotenv = enableDotenvSupport ? populateEnv() : null;
debug(
  ...(enableDotenvSupport
    ? ['saw dotenv result: %O', dotenv]
    : ['(dotenv support disabled)'])
);

const env = (dotenv && dotenv.parsed) || {};
debug('saw env: %O', env);

verifyEnvironment();

const envPlugins = [
  // ? Load our .env results as the defaults (overridden by process.env)
  new EnvironmentPlugin({ ...env, ...process.env }),
  // ? Create shim process.env for undefined vars (per my tastes!)
  new DefinePlugin({ 'process.env': '{}' })
];

const externals = [
  nodeExternals(),
  ({ request }, cb) =>
    // ? Externalize all .json imports (required as commonjs modules)
    /\.json$/.test(request) ? cb(null, `commonjs ${request}`) : cb()
];

const mainConfig = {
  name: 'main',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/index.ts`,

  output: {
    filename: 'index.js',
    path: `${__dirname}/dist`,
    // ! ▼ Only required for libraries (CJS2/UMD/etc)
    // ! Note: ESM outputs are handled by Babel ONLY!
    //libraryTarget: 'umd',
    libraryTarget: 'commonjs2'
    // ! ▼ Only required for when libraryTarget is UMD (to help globals work)
    //globalObject: 'this',
  },

  externals,
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
  plugins: [
    ...envPlugins
    // * ▼ For UMD libraries
    //new BannerPlugin({ banner: '"undefined"!=typeof window&&(window.global=window);', raw: true, entryOnly: true })]
  ]
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

  externals,
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
  plugins: [
    ...envPlugins,
    // * ▼ For non-bundled externals, make entry file executable w/ shebang
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true, entryOnly: true })
  ]
};

module.exports = [mainConfig, externalsConfig];
debug('exports: %O', module.exports);
