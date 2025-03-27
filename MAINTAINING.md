# Maintaining

This is documentation for maintainers of this project.

## Code of Conduct

Please [review][1], understand, and be an example of it. Violations of the code
of conduct are taken seriously, even (especially) for maintainers.

## Issues

We want to support and build the community. We do that best by helping people
learn to solve their own problems. We have an issue template and hopefully most
folks follow it. If it's not clear what the issue is, invite them to create a
minimal reproduction of what they're trying to accomplish or the bug they think
they've found.

Once it's determined that a code change is necessary, point people to
[makeapullrequest.com][2] and invite them to make a pull request. If they're the
one who needs the feature, they're the one who can build it. If they need some
hand holding and you have time to lend a hand, please do so. It's an investment
into another human being, and an investment into a potential maintainer.

Remember that this is open source, so the code is not yours, it's ours. If
someone needs a change in the codebase, you don't have to make it happen
yourself. Commit as much time to the project as you want/need to. Nobody can ask
any more of you than that.

## Pull Requests

As a maintainer, you're fine to make your branches on the main repo or on your
own fork. Either way is fine.

When we receive a pull request, a GitHub Actions build is kicked off
automatically (see [`.github/workflows`][3]). We usually avoid merging anything
that fails our Actions workflows.

Please review PRs and focus on the code rather than the individual. You never
know when this is someone's first ever PR and we want their experience to be as
positive as possible, so be uplifting and constructive.

When you merge the pull request, you should do so via either the [rebase and
merge][4] or [squash and merge][5] features. This keeps our git history clean.

If commit messages need to be adjusted, maintainers should force push new
commits with adjusted messages to the PR branch before merging it in.

> [!CAUTION]
>
> **Always favor rebase over squash for large and/or complex contributions**
> since squashing commits may damage the [generated][6] [CHANGELOG.md][7],
> hinder [bisection][8], yield [non-atomic commits][9], and could even result in
> [the wrong version][10] being [released][11].

## Releases

Our releases are automatic. They happen whenever certain commits are pushed to a
relevant branch. That means a new release is generated only when there are
useful changes to justify it. See [the release rules][12] for a list of commit
types that trigger releases.

To generate a new release, a GitHub Actions build gets kicked off and, if it's
successful, [xrelease][11] is used to automatically publish a new release to npm
and GitHub along with an updated changelog. xrelease determines whether a
release is necessary, and what the new version number will be, by analyzing git
commit messages. With this in mind, **it is imperative you brush up on [the
commit message convention][13] which drives our releases.**

> [!IMPORTANT]
>
> **UNDER NO CIRCUMSTANCES** should any of your commit messages contain the
> strings `BREAKING:`, `BREAKING CHANGE:`, or `BREAKING CHANGES:` unless the
> goal is to release a new major version.

### Manual Releases

This project employs an automated CI/CD release pipeline. However, sometimes
things get messed up (e.g. CI workflow / GitHub Actions breaks) and we need to
trigger a release ourselves. When this happens, xrelease can be triggered
locally.

> [!CAUTION]
>
> Note that any manual releases generated outside of the CI/CD pipeline will be
> published [_without established provenance_][14]! It is for that reason that,
> outside of truly exceptional events, manual releases should be avoided at all
> costs.

#### Preparing Repository for Release

Before proceeding with a manual release, first ensure all dependencies are
installed and all necessary secrets are available.

> [!TIP]
>
> You only need to run the following commands if you have not run `npm install`
> at least once.

> [!IMPORTANT]
>
> These command should only be run at the project root level and not in any
> individual package root.

```bash
# 1. Install dependencies and add your auth tokens to the .env file.
#
# ! DO NOT COMMIT THE .env FILE !
cp .env.default .env
npm ci
```

#### Manual Release Method 1: Semi-Automated

To release all packages in a repository:

```bash
# Do a dry run first if you're not absolutely sure all is as it should be:
npx run release:topological -- --options --dry-run
# Then do the actual topological release:
npx run release:topological
```

To release a specific package (without regard for topology):

```bash
# Do a dry run first if you're not absolutely sure all is as it should be:
npx -w specific-package-name-here run release -- --dry-run
# Then do the actual topological release:
npx -w specific-package-name-here run release
```

#### Manual Release Method 2: By Hand

> [!WARNING]
>
> Note that, in a monorepo/hybridrepo, relying on these commands to manually cut
> a release may result in a non-functional package being released if said
> package depends on other packages in the project that have unreleased changes.
>
> Symbiote's "project topology" command solves this problem and should be
> preferred over building packages individually.

There are two ways to execute the release procedure of a particular package by
hand. The first is by leveraging the release script:

```bash
# Do a symbiote dry run first:
npm run release -- --dry-run
# Then do the actual symbiote-based release:
npm run release
```

> [!NOTE]
>
> See `npx symbiote release --help` for more options.

The second way is by running the following npm scripts in the specified order:

> [!WARNING]
>
> If one of these steps fails, you should address the failure before running the
> next step.

> [!TIP]
>
> These commands should be run with the root of the individual package you're
> trying to release as the current working directory. Using `npm -w` also works.

```bash
# 2. OPTIONAL: Reset the working tree to a clean state. The build command
# usually does this for you, making this step unnecessary.
#npm run clean -- --force

# 3. Format this package's files.
npm run format

# 4. Lint every file in the package and any files imported by those files.
npm run lint:package

# 5. Build this package's distributables.
npm run build

# 6. Build this package's documentation (AFTER format for correct line numbers).
npm run build:docs

# 7. Run all of this package's tests and the tests of any package imported by
# source files in this package, then generate coverage data.
npm run test:package:all

# 8. Trigger xrelease locally to publish a new release of this package. This
# requires having valid tokens for NPM, GitHub, and Codecov each with the
# appropriate permissions.
#
# Do a dry run first:
npm run release -- --skip-tasks manual --dry-run
# Then review CHANGELOG.md and, after making sure the next release includes the
# commits you're expecting, do the actual release:
npm run release -- --skip-tasks manual
```

## Deprecation and End of Life

Sometimes, for a variety of reasons, the maintenance window on a project may
close for good. It happens. And when it does, there is a need to make clear to
all current and future users that the project and its assets (repository,
published packages, etc) are to be considered deprecated and that no further
maintenance is intended.

With somber focus, the following steps should be taken:

> [!TIP]
>
> If you're using [symbiote][15], all of this can be done automatically:
>
> ```bash
> npx symbiote project renovate --deprecate
> ```

> These steps were inspired by [Richard Litt's checklist][16].

### Deprecate the Remote (GitHub) repository

> [!IMPORTANT]
>
> If the deprecated project is using [symbiote][15]/[xpipeline][17], at least
> one of the commits created as a result of following these instructions must be
> of the [`build` type][18] so that a final "deprecated" version with updated
> deprecation documentation is released. If operating on a monorepo, said commit
> must touch every deprecated package.

<br />

- [ ] **Update Metadata**.

GitHub repositories have metadata settings that can be configured via the [gear
icon][19]. Once the modal is revealed, the following settings should be updated:

- `⛔️ [DEPRECATED]` should be prepended to the description.

- If the website is pointing to NPM, the input box should be emptied.

- All three checkboxes under "Include in the home page" (i.e. "Releases,"
  "Packages," and "Deployments) should be unchecked.

Be sure to save the changes by pressing "Save changes"!

<br />

- [ ] **Update `README.md`**.

The project root `README.md` file and any README files at `packages/*/README.md`
(if applicable) should be updated as follows:

- The level one heading at the top of the file should be updated to "# ⛔️
  DEPRECATED/UNMAINTAINED" (no quotes).

- All badges except badge-blm should be removed; badge-unmaintained should be
  added.

- Under the updated level one heading, a [caution alert][20] should be included
  that details the reason why this project is being deprecated. Any
  alternatives, forks, see-also's, and/or future projects should be linked here.

What follows is an example outcome of the above steps:

```markdown
<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![!!UNMAINTAINED!!][badge-unmaintained]][link-unmaintained]

<!-- badges-end -->

# ⛔️ DEPRECATED/UNMAINTAINED

> [!CAUTION]
>
> This project has been superseded (and all of its useful bits subsumed) by
> [something-else](https://github.com/something/else).

...

[badge-blm]: https://xunn.at/badge-blm 'Join the movement!'
[link-blm]: https://xunn.at/donate-blm
[badge-unmaintained]:
  https://xunn.at/badge-unmaintained
  'Unfortunately, this project is unmaintained (forks welcome!)'
[link-unmaintained]: https://xunn.at/link-unmaintained
```

<br />

- [ ] **Update `package.json` (if applicable)**.

If the project has a `package.json` file at its root and/or at
`packages/*/package.json` (if applicable), they should be updated as follows:

- The [`description` string][21] should be prefixed with `⛔️ [DEPRECATED]`.

- The strings `"deprecated", "obsolete", "archived"` should be added to the
  [`keywords` array][22] if this file defines a published package.

### Deprecate the Published Packages

- [ ] **Update `package.json` (if applicable)**.

[See above][23].

- [ ] **Publish Final Version**.

Any updates to [source repository][23] assets (including `package.json` files
and adding deprecation language to `README.md` files) should be published as a
single patch release in a polyrepo, or one release per package in a monorepo.

- [ ] **Issue Package-Wide Deprecation Command**.

Use [`npm deprecate`][24] to [officially deprecate][25] each package after their
final patch releases are published.

### Deprecate the Local Repository

Consider moving the repository to a place where it is accessible but otherwise
out of the way, e.g. `/repos/.deprecated/<deprecated-repo-here>`.

## A Huge Thank You

Thank you so much for helping to maintain this project!

[1]: ./.github/CODE_OF_CONDUCT.md
[2]: http://makeapullrequest.com
[3]: ./.github/workflows
[4]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#rebase-and-merge-your-commits
[5]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits
[6]: https://github.com/Xunnamius/xchangelog
[7]: https://www.conventionalcommits.org/en/v1.0.0
[8]:
  https://www.metaltoad.com/blog/beginners-guide-git-bisect-process-elimination
[9]: https://dev.to/paulinevos/atomic-commits-will-help-you-git-legit-35i7
[10]: https://github.com/semantic-release/commit-analyzer
[11]: https://github.com/Xunnamius/xrelease
[12]:
  https://github.com/Xunnamius/symbiote/blob/151f64052b9160fca6dd519ea6e6787a95160544/src/assets/transformers/_release.config.cjs.ts#L147-L157
[13]:
  https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/ed32559941719a130bb0327f886d6a32a8cbc2ba/convention.md
[14]:
  https://docs.npmjs.com/generating-provenance-statements#provenance-limitations
[15]: https://github.com/Xunnamius/symbiote
[16]:
  https://github.com/RichardLitt/knowledge/blob/master/github/how-to-deprecate-a-repository-on-github.md
[17]: https://github.com/Xunnamius/pipeline
[18]:
  https://github.com/Xunnamius/symbiote/blob/151f64052b9160fca6dd519ea6e6787a95160544/src/assets/transformers/_conventional.config.cjs.ts#L264-L277
[19]: https://github.com/orgs/community/discussions/54372
[20]: https://github.com/orgs/community/discussions/16925
[21]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#description-1
[22]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#keywords
[23]: #deprecate-the-remote-github-repository
[24]: https://docs.npmjs.com/cli/v8/commands/npm-deprecate
[25]:
  https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions
