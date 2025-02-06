// @ts-check
'use strict';

const { createDebugLogger } = require('rejoinder');

const debug = createDebugLogger({ namespace: 'symbiote:config:ncurc' });

// * https://www.npmjs.com/package/npm-check-updates#configuration-files
module.exports = {
  install: 'never',
  reject: [
    // ? Reject any super-pinned dependencies (e.g. find-up~5 and execa~7)
    '*~*',
    // !
    // TODO: delete these
    // ? Pin the CJS version of strip-ansi
    'strip-ansi',
    // ? Pin the non-broken version of glob
    'glob',
    // ? Pin the CJS version of execa
    'execa'
  ]
};

debug('exported config: %O', module.exports);
