import { runWithInheritedIo } from '@-xun/run';
import { createGenericLogger } from 'rejoinder';

const log = createGenericLogger({ namespace: 'husky-hook:commit-msg' });
if (process.env.GIT_REFLOG_ACTION?.startsWith('rebase')) {
  log.warn('skipped commit-msg hook due to rebase');
} else {
  const isInSimpleVerificationMode = !!process.env.GAC_VERIFY_SIMPLE;

  await runWithInheritedIo('npx', ['commitlint', '-e'], {
    env: { NODE_NO_WARNINGS: '1' }
  });

  if (!isInSimpleVerificationMode) {
    await runWithInheritedIo('npm', ['run', 'test:packages:all:unit']);
  }

  // TODO: bring back spellchecker
}
