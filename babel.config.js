'use strict';
// * Every now and then, we adopt best practices from CRA
// * https://tinyurl.com/yakv4ggx

// ? https://nodejs.org/en/about/releases
const NODE_LTS = 'maintained node versions';
// TODO: replace with 'package'
const pkgName = require('./package.json').name;
const debug = require('debug')(`${pkgName}:babel-config`);

debug('NODE_ENV: %O', process.env.NODE_ENV);

/**
 * @type {import('@babel/core').TransformOptions}
 */
module.exports = {
  comments: false,
  parserOpts: { strictMode: true },
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-syntax-import-assertions'
  ],
  // ? Sub-keys under the "env" config key will augment the above
  // ? configuration depending on the value of NODE_ENV and friends. Default
  // ? is: development
  env: {
    // * Used by Jest and `npm test`
    test: {
      comments: true,
      sourceMaps: 'both',
      presets: [
        ['@babel/preset-env', { targets: { node: true } }],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ],
      plugins: [
        // ? Only active when testing, the plugin solves the following problem:
        // ? https://stackoverflow.com/q/40771520/1367414
        'explicit-exports-references'
      ]
    },
    // * Used by `npm run build` for transpiling TS to CJS output in ./dist
    'production-cjs': {
      presets: [
        [
          '@babel/preset-env',
          {
            // ? https://babeljs.io/docs/en/babel-preset-env#modules
            modules: 'cjs',
            targets: NODE_LTS,
            useBuiltIns: 'usage',
            corejs: '3.27',
            shippedProposals: true
          }
        ],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ],
      plugins: [
        [
          'babel-plugin-transform-rewrite-imports',
          {
            replaceExtensions: {
              '^../package.json$': '../../package.json'
            }
          }
        ]
      ]
    },
    // * Used by `npm run build` for compiling TS to ESM output in ./dist
    'production-external': {
      presets: [
        [
          '@babel/preset-env',
          {
            // ? https://babeljs.io/docs/en/babel-preset-env#modules
            modules: false,
            targets: NODE_LTS,
            useBuiltIns: 'usage',
            corejs: '3.27',
            shippedProposals: true
          }
        ],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ],
      plugins: [
        [
          'babel-plugin-transform-rewrite-imports',
          {
            replaceExtensions: {
              '^../package.json$': '../../package.json'
            }
          }
        ]
      ]
    }
  }
};

debug('exports: %O', module.exports);
