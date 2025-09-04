import { runWithInheritedIo } from '@-xun/run';
import { createGenericLogger } from 'rejoinder';

const log = createGenericLogger({ namespace: 'husky-hook:pre-commit' });
if (process.env.GIT_REFLOG_ACTION?.startsWith('rebase')) {
  log.warn('skipped pre-commit hook due to rebase');
} else {
  const isInSimpleVerificationMode = !!process.env.GAC_VERIFY_SIMPLE;

  if (!isInSimpleVerificationMode) {
    await runWithInheritedIo('npm', ['run', 'lint:package']);
  }

  await runWithInheritedIo(
    'npx',
    ['lint-staged', '--concurrent', 'false', '--config', 'lint-staged.config.mjs'],
    { env: { NODE_NO_WARNINGS: '1' } }
  );

  await runWithInheritedIo('npx', [
    'symbiote',
    'clean',
    '--env',
    'NODE_NO_WARNINGS=1',
    '--only-empty-directories',
    '--hush',
    '--scope',
    'unlimited'
  ]);
}
