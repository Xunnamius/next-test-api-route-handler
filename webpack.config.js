// This webpack config is used for transpiling source to UMD+ES2015 and
// depositing bundled output to dist/

process.env.NODE_ENV = 'production';

module.exports = {
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
