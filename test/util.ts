import debugFactory from 'debug';
import { maxSatisfying } from 'semver';

import execa_ from 'execa';

/**
 * Since some versions of Next.js are released with flawed `package.json::peerDependencies`, sometimes we need to ensure the correct versions of
 * Next.js's peer dependencies are actually installed.
 */
// TODO: replace execa param with internal use of @-xun/run
export async function getNextjsReactPeerDependencies(
  /**
   * For example: `next`, `next@latest`, or `next@15.0.0-rc.1`
   */
  npmInstallNextJsString: string,
  execa = execa_
): Promise<string[]> {
  const debug = debugFactory('util:getNextPeerDependencies');

  return Promise.all([
    execa('npm', ['show', 'react', 'versions', '--json']),
    execa('npm', ['show', 'react-dom', 'versions', '--json']),
    execa('npm', ['show', npmInstallNextJsString, 'peerDependencies', '--json'])
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
