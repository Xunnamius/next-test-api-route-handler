/**
 ** This file exports test utilities specific to this project and beyond what is
 ** exported by @-xun/jest; these can be imported using the testversal aliases.
 */

// ? These will always come from @-xun/symbiote and @-xun/jest (transitively)
// {@symbiote/notInvalid
//   - @-xun/jest
//   - @-xun/test-mock-argv
//   - @-xun/test-mock-exit
//   - @-xun/test-mock-import
//   - @-xun/test-mock-env
//   - @-xun/test-mock-fixture
//   - @-xun/test-mock-output
// }

import { createDebugLogger } from 'rejoinder';

export * from '@-xun/jest';

/**
 * The project-wide namespace that appears in debugger output. Only used in
 * tests.
 */
export const globalDebuggerNamespace = 'ntarh';

export const globalDebugger = createDebugLogger({ namespace: globalDebuggerNamespace });
