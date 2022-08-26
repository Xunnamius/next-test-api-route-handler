/**
 * This object is used to configure the GitHub Actions that comprise the
 * build-test-deploy pipeline. Each property is optional.
 */
module.exports = {
  // * The name and email used to author commits and interact with GitHub.
  // ! This should correspond to the identity of the GH_TOKEN secret.
  // committer: {
  //   name: 'xunn-bot',
  //   email: 'bot@xunn.io'
  // },
  //
  // * Selectively enable debugger verbose output in the pipeline.
  // ? To enable debugging across all source in this repo (excluding
  // ? node_modules) without having to type the package name, use a boolean:
  // debugString: true, // false is treated the same as null/commented out
  // ? Or you can type out a custom debug namespace string instead, e.g.:
  // debugString: '@your-namespace/some-package:*',
  // ? This key can only appear in local pipeline config and not global.
  // ? See also: https://www.npmjs.com/package/debug#wildcards
  // ? For even more debugging tools, see: https://bit.ly/2R6NAdZ
  //
  // * The semver version of node to install and setup before each job.
  // nodeCurrentVersion: '18.x',
  //
  // * Node semver versions to run unit and integration tests against.
  // nodeTestVersions: ['14.x', '16.x'],
  //
  // * Webpack semver versions to run unit and integration tests against.
  // webpackTestVersions: ['5.x'],
  //
  // * Regular expressions for skipping CI/CD. To skip CL, use git with the
  // * `--no-verify` option.
  // ciSkipRegex: /\[skip ci\]|\[ci skip\]/i,
  // cdSkipRegex: /\[skip cd\]|\[cd skip\]/i,
  //
  // * Should auto-merge be retried on failure even when the PR appears
  // * unmergeable? If `true`, uses exponential back-off internally.
  // ! WARNING: leaving this as `true` might waste Actions minutes and $$$ in
  // ! private repositories. Watch your usage numbers!
  // canRetryAutomerge: true,
  //
  // * Npm audit will fail upon encountering problems of at least the specified
  // * severity.
  // npmAuditFailLevel: 'high',
  //
  // * Attempt to upload project coverage data to codecov if `true`.
  // canUploadCoverage: true,
  //
  // * The maximum amount of time in seconds any "retry"-type operation can
  // * continue retrying. This includes all exponential backoff steps.
  // ! A 5 minute limit is hardcoded into pipeline workflows, so values above
  // ! ~250 might lead to undesirable VM hard stops.
  // retryCeilingSeconds: 180,
  //
  // * How many days GitHub should keep uploaded artifacts around.
  // ! 90 days is GitHub's default, but this should be lowered to 1 day for
  // ! private repos where artifact storage costs $$$.
  // artifactRetentionDays: 90
};
