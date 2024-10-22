import debugFactory from 'debug';
import { toss } from 'toss-expression';
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
) {
  const debug = debugFactory('util:getNextPeerDependencies');

  return Promise.all([
    execa('npm', ['show', 'react', 'versions']),
    execa('npm', ['show', 'react-dom', 'versions']),
    execa('npm', ['show', npmInstallNextJsString, 'peerDependencies'])
  ]).then(function ([
    { stdout: reactVersions_ },
    { stdout: reactDomVersions_ },
    { stdout: nextPeerDependencies_ }
  ]) {
    const finalPeerDeps: string[] = [];

    debug('reactVersions: %O', reactVersions_);
    debug('reactDomVersions: %O', reactDomVersions_);
    debug('nextPeerDependencies: %O', nextPeerDependencies_);

    const reactVersions: string[] = JSON.parse(reactVersions_);
    const reactDomVersions: string[] = JSON.parse(reactDomVersions_);
    const nextPeerDependencies: Record<'react' | 'react-dom', string> =
      JSON.parse(nextPeerDependencies_);

    finalPeerDeps.push(
      'react@' +
        (maxSatisfying(reactVersions, nextPeerDependencies.react) ||
          toss(new Error('unable to resolve react peer dependency'))),
      'react-dom@' +
        (maxSatisfying(reactDomVersions, nextPeerDependencies['react-dom']) ||
          toss(new Error('unable to resolve react-dom peer dependency')))
    );

    debug('finalPeerDeps: %O', finalPeerDeps);
    return finalPeerDeps.join(' ');
  });
}
