'use strict';

// This webpack config is used to transpile src to dist, compile externals,
// compile executables, etc

const { EnvironmentPlugin, DefinePlugin, BannerPlugin } = require('webpack');
const { verifyEnvironment } = require('./expect-env');
const nodeExternals = require('webpack-node-externals');
const pkgName = require('./package.json').name;
const debug = require('debug')(`${pkgName}:webpack-config`);

const IMPORT_ALIASES = {
  universe: `${__dirname}/src/`,
  multiverse: `${__dirname}/lib/`,
  testverse: `${__dirname}/test/`,
  externals: `${__dirname}/external-scripts/`,
  types: `${__dirname}/types/`,
  package: `${__dirname}/package.json`
};

let sanitizedEnv = {};
let { NODE_ENV: nodeEnv, ...sanitizedProcessEnv } = {
  ...process.env,
  NODE_ENV: 'production'
};

try {
  require('fs').accessSync('.env');
  const { NODE_ENV: forceEnv, ...parsedEnv } = require('dotenv').config().parsed;
  nodeEnv = forceEnv || nodeEnv;
  sanitizedEnv = parsedEnv;
  debug(`NODE_ENV: ${nodeEnv}`);
  debug('sanitized env: %O', sanitizedEnv);
} catch (e) {
  debug(`env support disabled; reason: ${e}`);
}

debug('sanitized process env: %O', sanitizedProcessEnv);
verifyEnvironment();

const envPlugins = ({ esm /*: boolean */ }) => [
  // ? NODE_ENV is not a "default" (unlike below) but an explicit overwrite
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  }),
  // ? NODE_ESM is true when we're compiling in ESM mode (useful in source)
  ...(esm
    ? [
        new DefinePlugin({
          'process.env.NODE_ESM': String(esm)
        })
      ]
    : []),
  // ? Load our .env results as the defaults (overridden by process.env)
  new EnvironmentPlugin({ ...sanitizedEnv, ...sanitizedProcessEnv }),
  // ? Create shim process.env for undefined vars
  // ! The above already replaces all process.env.X occurrences in the code
  // ! first, so plugin order is important here
  new DefinePlugin({ 'process.env': '{}' })
];

const externals = ({ esm /*: boolean */ }) => [
  'next-server/dist/server/api-utils.js',
  nodeExternals({ importType: esm ? 'node-commonjs' : 'commonjs' }),
  ({ request }, cb) => {
    if (request == 'package') {
      // ? Externalize special "package" (alias of package.json) imports
      cb(null, `${esm ? 'node-commonjs' : 'commonjs'} ${pkgName}/package.json`);
    } else if (/\.json$/.test(request)) {
      // ? Externalize all other .json imports
      cb(null, `${esm ? 'node-commonjs' : 'commonjs'} ${request}`);
    } else cb();
  }
];

const libCjsConfig = {
  name: 'lib',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/index.ts`,

  output: {
    filename: 'index.js',
    path: `${__dirname}/dist`,
    // ! ▼ Only required for libraries
    // ! ▼ Note: ESM outputs are handled by Babel (bundle) and Webpack (below)
    library: {
      type: 'commonjs2'
    }
  },

  externals: externals({ esm: false }),
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true,
    errorDetails: true
  },

  resolve: {
    extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'],
    // ! If changed, also update these aliases in tsconfig.json,
    // ! jest.config.js, next.config.ts, and .eslintrc.js
    alias: IMPORT_ALIASES
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  plugins: [...envPlugins({ esm: false })]
};

const libEsmConfig = {
  name: 'esm',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/index.ts`,

  output: {
    module: true,
    filename: 'index.mjs',
    path: `${__dirname}/dist/esm`,
    chunkFormat: 'module',
    // ! ▼ Only required for libraries
    // ! ▼ Note: ESM outputs are handled by Babel ONLY!
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true
  },

  externals: externals({ esm: true }),
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true,
    errorDetails: true
  },

  resolve: {
    extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'],
    // ! If changed, also update these aliases in tsconfig.json,
    // ! jest.config.js, next.config.ts, and .eslintrc.js
    alias: IMPORT_ALIASES
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  plugins: [...envPlugins({ esm: true })]
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

  externals: externals({ esm: false }),
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true,
    errorDetails: true
  },

  resolve: {
    extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'],
    // ! If changed, also update these aliases in tsconfig.json,
    // ! jest.config.js, next.config.ts, and .eslintrc.js
    alias: IMPORT_ALIASES
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  optimization: { usedExports: true },
  plugins: [
    ...envPlugins({ esm: false }),
    // * ▼ For non-bundled externals, make entry file executable w/ shebang
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true, entryOnly: true })
  ]
};

/* const cliConfig = {
  name: 'cli',
  mode: 'production',
  target: 'node',
  node: false,

  entry: `${__dirname}/src/cli.ts`,

  output: {
    filename: 'cli.js',
    path: `${__dirname}/dist`
  },

  externals: externals({ esm: false }),
  externalsPresets: { node: true },

  stats: {
    orphanModules: true,
    providedExports: true,
    usedExports: true,
    errorDetails: true
  },

  resolve: {
    extensions: ['.ts', '.wasm', '.mjs', '.cjs', '.js', '.json'],
    // ! If changed, also update these aliases in tsconfig.json,
    // ! jest.config.js, next.config.ts, and .eslintrc.js
    alias: IMPORT_ALIASES
  },
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  optimization: { usedExports: true },
  plugins: [
    ...envPlugins({ esm: false }),
    // * ▼ For bundled CLI applications, make entry file executable w/ shebang
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true, entryOnly: true })
  ]
}; */

module.exports = [libCjsConfig, libEsmConfig, externalsConfig /*, cliConfig*/];
debug('exports: %O', module.exports);
