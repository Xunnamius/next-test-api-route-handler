/**
 ** This file exports test utilities specific to this project and beyond what is
 ** exported by @-xun/jest; these can be imported using the testversal aliases.
 */

// ? @-xun/jest will always come from @-xun/symbiote (i.e. transitively)
// {@symbiote/notInvalid @-xun/jest}

import { run } from '@-xun/run';
import { createDebugLogger } from 'rejoinder';
import { maxSatisfying } from 'semver';

export * from '@-xun/jest';

/**
 * Since some versions of Next.js are released with flawed
 * `package.json::peerDependencies`, sometimes we need to ensure the correct
 * versions of Next.js's peer dependencies are actually installed.
 */
export async function getNextjsReactPeerDependencies(
  /**
   * For example: `next`, `next@latest`, or `next@15.0.0-rc.1`
   */
  npmInstallNextJsString: string
): Promise<string[]> {
  const debug = createDebugLogger({ namespace: 'util:getNextPeerDependencies' });

  return Promise.all([
    run('npm', ['show', 'react', 'versions', '--json']),
    run('npm', ['show', 'react-dom', 'versions', '--json']),
    run('npm', ['show', npmInstallNextJsString, 'peerDependencies', '--json'])
  ]).then(function ([
    { stdout: reactVersions_ },
    { stdout: reactDomVersions_ },
    { stdout: nextPeerDependencies_ }
  ]) {
    debug('reactVersions: %O bytes', reactVersions_.length);
    debug('reactDomVersions: %O bytes', reactDomVersions_.length);
    debug('nextPeerDependencies: %O bytes', nextPeerDependencies_.length);

    const reactVersions: string[] = JSON.parse(reactVersions_);
    const reactDomVersions: string[] = JSON.parse(reactDomVersions_);
    const nextPeerDependencies: Record<'react' | 'react-dom', string> =
      JSON.parse(nextPeerDependencies_);

    const reactVersion =
      typeof nextPeerDependencies.react === 'string'
        ? maxSatisfying(reactVersions, nextPeerDependencies.react)
        : null;

    const reactDomVersion =
      typeof nextPeerDependencies['react-dom'] === 'string'
        ? maxSatisfying(reactDomVersions, nextPeerDependencies['react-dom'])
        : null;

    const finalPeerDeps = [
      reactVersion ? `react@${reactVersion}` : '',
      reactDomVersion ? `react-dom@${reactDomVersion}` : ''
    ].filter(Boolean);

    debug('finalPeerDeps: %O', finalPeerDeps);
    return finalPeerDeps;
  });
}
