// @ts-check
'use strict';

const {
  assertEnvironment,
  moduleExport
} = require('@-xun/symbiote/assets/conventional.config.cjs');

const { createDebugLogger } = require('rejoinder');

const debug = createDebugLogger({ namespace: 'symbiote:config:conventional' });

module.exports = moduleExport({
  ...assertEnvironment(),
  configOverrides: {
    // Any custom configs here will be deep merged with moduleExport with
    // special considerations for certain keys. `configOverrides` can also
    // be a function instead of an object.
  }
});

debug('exported config: %O', module.exports);
