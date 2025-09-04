/* eslint-disable no-console */

import { getNextjsReactPeerDependencies } from 'multiverse+shared';

import type { RootConfiguration } from '@black-flag/core';

export const command: NonNullable<RootConfiguration['command']> = '$0 <packageSemver>';

export const handler: NonNullable<
  RootConfiguration<{ packageSemver: string }>['handler']
> = async ({ packageSemver }) => {
  console.log((await getNextjsReactPeerDependencies(packageSemver)).join(' '));
};
