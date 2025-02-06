// @ts-check

import { deepMergeConfig } from '@-xun/symbiote/assets';
import { assertEnvironment, moduleExport } from '@-xun/symbiote/assets/.remarkrc.mjs';
import { createDebugLogger } from 'rejoinder';

const debug = createDebugLogger({ namespace: 'symbiote:config:remarkrc' });

const config = deepMergeConfig(moduleExport(await assertEnvironment()), {
  // Any custom configs here will be deep merged with moduleExport
});

export default config;

debug('exported config: %O', config);
