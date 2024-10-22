# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [4.0.13][3] (2024-10-22)

#### 🪄 Fixes

- **src:** add support for next\@15.0.0 release ([edfe781][4])

# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [4.0.12][5] (2024-10-17)

#### ⚙️ Build System

- Prepare compatibility layer for next\@15 ([a73f21e][6])

#### 🔥 Reverted

- _"ci(github): add explicit install of `react@19.0.0-rc-cd22717c-20241013` for now"_ ([8a982da][7])

### [4.0.11][8] (2024-09-18)

#### 🪄 Fixes

- **src:** stop Next.js from attempting to statically generate routes under test ([a461e81][9]) <sup>closes [#1076][10]</sup>

### [4.0.10][11] (2024-09-18)

#### 🪄 Fixes

- **src:** pass empty `apiContext` to work around `multiZoneDraftMode` check ([c061b91][12])

### [4.0.9][13] (2024-09-13)

#### 🪄 Fixes

- **src:** prevent ipv6-related failures due to assuming "localhost" resolvability ([99118a6][14]) <sup>closes [#1068][15]</sup>

#### ⚙️ Build System

- **externals:** update is-next-compat to work with Octokit's new esm exports ([50d2976][16])
- **husky:** update husky scripts ([88948b6][17])
- **package:** downgrade @octokit/rest to 20 ([fa4b2af][18])
- Remove spellchecker dependency ([b0701a2][19])

### [4.0.8][20] (2024-06-10)

#### ⚙️ Build System

- Revert conventional-changelog-cli update ([9967120][21])
- Update documentation generator ([43eec53][22])

### [4.0.7][23] (2024-04-17)

#### ⚙️ Build System

- **babel:** update core-js to 3.37 ([b6b5164][24])
- **readme:** add section on jsdom support ([a48555f][25])

### [4.0.6][26] (2024-04-12)

#### 🪄 Fixes

- **src:** extend backwards compatibility to msw\@1; remove optional msw peer dependency ([347d7ef][27])

### [4.0.5][28] (2024-03-03)

#### 🪄 Fixes

- **src:** replace request spread with explicit options ([633a046][29]) <sup>closes [#1011][30], [#983][31]</sup>

### [4.0.4][32] (2024-03-02)

#### 🪄 Fixes

- **src:** allow relative url strings passed via url shorthand for App Router ([01b86b6][33]) <sup>closes [#1000][34]</sup>
- **src:** prevent recursive redirection with undici/whatwg fetch ([22bb716][35]) <sup>closes [#993][36]</sup>
- **src:** replace `AppRouteUserlandModule` with looser type ([502e666][37]) <sup>closes [#1006][38], [#1005][39]</sup>

### [4.0.3][40] (2024-01-18)

#### 🪄 Fixes

- **src:** ensure ephemeral test servers only listen on localhost ([d7774b3][41])
- **src:** forcefully close all connections after closing test server (fixes [#962][42]) ([d03ca21][43])

### [4.0.2][44] (2024-01-16)

#### 🪄 Fixes

- **src:** add missing metadata not revealed by type information ([90ff665][45])
- **src:** force normalization of request URLs passed to app handler ([8400a19][46])

### [4.0.1][47] (2024-01-16)

#### 🪄 Fixes

- **src:** pass Next.js more accurate app route metadata ([09389fe][48])

## [4.0.0][49] (2024-01-15)

### 💥 Breaking Changes 💥

- **Request URLs (e.g. `req.url`) will always be**
  `"ntarh://testApiHandler"`.

  This is instead of the old localhost string with the random port number, which
  is an implementation detail that should not have been exposed to end developers.

- **The `handler` option of `testApiHandler` (i.e.**
  `testApiHandler({ handler })`) has been renamed to `pagesHandler`. It is
  otherwise functionally equivalent.

  Those migrating from NTARH@<4, the process should be as simple as renaming
  `handler` to `pagesHandler` in your tests and getting on with your life.

- `NtarhParameters` has been superseded by `NtarhInit`,
  `NtarhInitAppRouter`, and `NtarhInitPagesRouter`.

- `requestPatcher`, `reponsePatcher`, and `paramsPatcher` options
  of `testApiHandler({ ... })` can now be asynchronous and return Promises.
  `paramsPatcher` can additionally return a brand new `params` object that will
  overwrite the old one rather than merely augmenting it.

- `requestPatcher`, `reponsePatcher`, and `paramsPatcher` options
  of `testApiHandler({ ... })` no longer support parenthetical shorthand notation.
  For example, the following will cause a type error:
  `testApiHandler({ paramsPatcher: (params) => (params.id = "some-id") })`.

- `testApiHandler({ ... })` now accepts the `appHandler` option.
  When this option is provided, the function signatures of the following options
  shift to support standard `Request`/`Response` parameters and return types where
  appropriate: `requestPatcher`, `responsePatcher`, and `paramsPatcher`. See the
  docs, or intellisense, for more details.

- Minimum supported Node.js version is now 18.18.2

- Node-fetch has been replaced by Node's native fetch
  function. There may be subtle API changes between the two.

- The `pagesHandler` option of `testApiHandler` (i.e.
  `testApiHandler({ pagesHandler })`) will **not** accept edge runtime routes. To
  test your edge runtime routes, use the `appHandler` option instead.

- This version of NTARH is now actively tracking a second Next.js
  internal export, one that is not guaranteed to be available before
  `next@14.0.4`. Therefore, versions of Next.js older than 14.0.4 **explicitly
  unsupported** when using the `appHandler` option. On the other hand,
  `pagesHandler` will always work regardless of Next.js version until Vercel
  eventually removes the Pages Router functionality entirely.

#### ✨ Features

- Land initial App Router support ([e2d8865][50]) <sup>closes [#938][51], [#773][52]</sup>
- Retire use of node-fetch ([5574831][53]) <sup>closes [#946][54]</sup>
- **src:** warn when invoking testApiHandler with invalid property combos ([db599ac][55])

#### 🪄 Fixes

- Loosen type checking for `NextApiHandler`s ([fdfec8c][56])
- **src:** deeply summon res.json() return value into our realm ([59f54a5][57])
- **src:** ensure all results of calling ::json on Requests and Responses are summoned into our realm ([5c5f9a4][58])
- **src:** ensure AsyncLocalStorage is available globally (might fix [#875][59]) ([43680d9][60])
- **src:** ensure global fetch is restored after testApiHandler terminates ([75d4e1f][61])
- **src:** forcefully coerce request.body into a ReadableStream ([f715331][62])
- **src:** hoist globalThis.AsyncLocalStorage initialization to be as soon as possible ([85bb8fa][63])
- **src:** normalize pagesHandler into NextApiHandler (esm<->cjs interop) ([0133e11][64])
- Use more accurate return type for app router patchers ([62f1d0b][65])

#### ⚙️ Build System

- **husky:** ensure hooks do not run on rebase ([913cbd0][66])
- **package:** bump minimum supported node versions to maintained ([702cb44][67])
- **package:** remove outdated properties ([dc23723][68])

#### 🧙🏿 Refactored

- **src:** ensure request url is consistent across router types ([d72ae87][69])

## [3.2.0][70] (2024-01-04)

#### ✨ Features

- Update headers for msw\@2 compatibility ([93b8a3c][71]) <sup>closes [#916][72]</sup>

### [3.1.10][73] (2023-11-04)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([ca1da40][74]) <sup>closes [#887][75]</sup>

#### ⚙️ Build System

- Add core-js polyfills and have mercy on aging node versions ([a9d136b][76])
- Modernize tooling ([db0223e][77])
- Upgrade typescript-babel toolchain to nodenext ([e457064][78]) <sup>closes [#908][79]</sup>

#### 🔥 Reverted

- _"docs(readme): update badge links"_ ([be90d57][80])

### [3.1.8][81] (2023-01-03)

#### ⚙️ Build System

- **readme:** update maintainence badge and audit dependencies ([2a4ae05][82])

### [3.1.7][83] (2022-07-27)

#### ⚙️ Build System

- **package:** update dependencies ([4af52f4][84])

### [3.1.6][85] (2022-06-30)

#### 🪄 Fixes

- Ensure non-object "headers" fetch argument is not mangled when mixing in default headers ([6e94142][86])

### [3.1.5][87] (2022-06-26)

#### 🪄 Fixes

- Fix MSW bypass override instructions and unit test ([405f84d][88])

### [3.1.4][89] (2022-06-26)

#### ⚙️ Build System

- **readme:** update MSW bypass override instructions under "test" entry in README ([b05e112][90])

### [3.1.3][91] (2022-05-21)

#### ⚙️ Build System

- **package:** update dev-dependencies ([36a2c44][92])

### [3.1.2][93] (2022-03-23)

#### ⚙️ Build System

- **package:** update dependencies ([065b445][94])

### [3.1.1][95] (2022-02-18)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([484d702][96]) <sup>closes [#487][97]</sup>

#### 🔥 Reverted

- _"refactor: update npm scripts, linting"_ ([77ad96d][98])

## [3.1.0][99] (2022-02-11)

#### ✨ Features

- Automatically add the x-msw-bypass ([21b4b92][100])

#### ⚙️ Build System

- **deps:** bump next from 12.0.8 to 12.0.10 ([2a2f0b2][101])
- **readme:** explain MSW compat default behavior ([0ee4ce5][102])

### [3.0.3][103] (2022-02-05)

#### ⚙️ Build System

- **package:** bump node-fetch to 2.6.7 ([1e8cd85][104])

### [3.0.2][105] (2022-01-03)

#### ⚙️ Build System

- **readme:** update shields.io maintenance badge to 2022 ([84f74f5][106])

### [3.0.1][107] (2021-12-27)

#### ⚙️ Build System

- **package:** retire use of sort-package-json fork ([a925da2][108])

## [3.0.0][109] (2021-12-17)

### 💥 Breaking Changes 💥

- `fetch` now comes from node-fetch directly instead of isomorphic-unfetch

- Exported `TestParameters` type has been renamed to `NtarhParameters`

#### ✨ Features

- **package:** remove debug dependency (moved into dev-deps) ([d3c60cb][110])
- **src:** improved error handling; add support for new `rejectOnHandlerError` option ([68d30da][111])
- **src:** move test-listen functionality into NTARH; remove dependency ([15c899a][112])
- **src:** replace isomorphic-unfetch with node-fetch ([5a1a2ee][113])

#### 🧙🏿 Refactored

- **src:** update types ([73f44b7][114])

### [2.3.4][115] (2021-11-16)

#### 🪄 Fixes

- **src:** lazy-load contents of the "cookies" field ([854704b][116])

#### ⚙️ Build System

- Re-enable treeshaking in webpack ([9302bcc][117])

### [2.3.3][118] (2021-11-10)

#### ⚙️ Build System

- Differentiate between esm and bundler distributables ([597c249][119])

### [2.3.2][120] (2021-11-07)

#### 🪄 Fixes

- **src:** es module compatibility; no longer attempts to require() in mjs files ([32eafab][121])
- **src:** report parsed es module import failures properly ([cd98aab][122])

### [2.3.1][123] (2021-11-06)

#### ⚙️ Build System

- Re-enable ESM (for bundlers) integration tests ([91f08d4][124])

## [2.3.0][125] (2021-11-05)

#### ✨ Features

- Automatically parse "set-cookie" headers; available in response.cookies ([cd3cd95][126]) <sup>closes [#373][127]</sup>

#### 🪄 Fixes

- **src:** ensure exceptions do not prevent Jest from exiting ([8746e5f][128])
- **src:** ensure webpack does not break dynamic require on compile ([ae778d1][129]) <sup>closes [#378][130]</sup>
- Vastly improved error handling for those using node@<15 and/or npm@<7 ([c216caa][131])

#### ⚙️ Build System

- Add back nullish coalescing operator babel transform for older node versions ([5fbb6d2][132])
- **package:** backport npm script fixes ([346e8de][133])
- **src:** fix TS bundle errors on node\@12 and node\@14 ([812e6f2][134])

#### 🔥 Reverted

- _"chore(github): enable debug mode"_ ([5034aba][135])

### [2.2.1][136] (2021-08-29)

#### ⚙️ Build System

- **license:** switch to MIT license ([de9ee17][137])

## [2.2.0][138] (2021-08-22)

#### ✨ Features

- **types:** expanded typescript support; `testApiHandler` weakly typed by default ([419d5fe][139])

### [2.1.3][140] (2021-08-22)

#### 🪄 Fixes

- **src:** ensure dependency resolution failure does not cause test runner to hang ([7916f00][141])

### [2.1.2][142] (2021-08-14)

#### 🪄 Fixes

- **src:** memoize resolver import ([74241ee][143])

#### ⚙️ Build System

- **package:** improve build-docs npm script ([33b6a34][144])
- **src:** add descriptions to TypeScript types ([1c3425c][145])

### [2.1.1][146] (2021-08-13)

#### 🪄 Fixes

- **readme:** update install instructions; fix apollo example ([fd787ca][147])

#### ⚙️ Build System

- **webpack.config:** second fix for faulty env management ([87ed12b][148])

## [2.1.0][149] (2021-08-13)

#### ✨ Features

- **src:** enable backwards compatibility all the way back to next\@9 ([c51cf02][150]) <sup>closes [#295][151]</sup>

#### ⚙️ Build System

- **webpack.config:** do not ignore warnings ([2b14d84][152])
- **webpack.config:** fix faulty env management ([f477260][153])

#### 🔥 Reverted

- _"chore: update dependencies"_ ([f61fd8c][154]) <sup>closes [#296][155]</sup>

### [2.0.2][156] (2021-07-29)

#### ⚙️ Build System

- **external-scripts:** use latest mongodb native driver ([fd53fef][157])
- **webpack.config.js:** more robust build process ([e5c6a99][158])

### [2.0.1][159] (2021-06-27)

#### ⚙️ Build System

- Update dependencies and publish fixed apollo example ([ef32668][160])

## [2.0.0][161] (2021-06-27)

### 💥 Breaking Changes 💥

- This version (and the version before this version) no longer works with next@<10

#### ✨ Features

- Add `url` and `paramsPatcher` ([ee31fa8][162])

#### ⚙️ Build System

- **package.json:** update dependencies ([2f1125c][163])
- **package.json:** update dependencies ([7583209][164])
- **package.json:** update next peer dependency to >=10.0.x ([bc5e72d][165])
- Switch to @xunnamius/conventional-changelog-projector shared config ([bc7eb3d][166])
- Update dependencies ([20ca255][167])

### [1.2.24][168] (2021-05-08)

#### 🪄 Fixes

- **index.ts:** next 10.2.0 compat ([af177c5][169])

#### ⚙️ Build System

- **.github/workflows:** disable old pipeline; begin transition to new pipeline ([364549e][170])
- **.github/workflows:** overhaul pipeline workflows ([4db5d04][171])
- **.github:** split BTD workflow into two separate workflows (security) ([99ad127][172])
- **contributing.md:** split pipeline architecture information off into workflow README.md ([6d52302][173])
- **package.json:** ensure hidden dirs' markdown files are seen by remark (linted and formatted) ([1f7fad4][174])
- **package.json:** update dependencies ([d328a86][175])
- **readme.md:** fix broken links ([6e7173f][176])
- **readme.md:** improvements ([23cb780][177])
- **readme.md:** include architecture description as workflow README.md ([1f25e5f][178])

### [1.2.23][179] (2021-03-14)

#### ⚙️ Build System

- Better documentation ([0040582][180])

### [1.2.22][181] (2021-03-12)

#### ⚙️ Build System

- Update dependencies and fix find-package-json usage ([df9ede3][182])

### [1.2.21][183] (2021-03-12)

#### ⚙️ Build System

- **build-test-deploy.yml:** actions version updates ([29aa25a][184])
- **build-test-deploy.yml:** rollback some pipeline version updates ([8065757][185])
- **package.json:** fix typedoc-markdown-plugin patch ([dd3e7fa][186]) <sup>closes [#126][187]</sup>

### [1.2.20][188] (2021-02-22)

#### ⚙️ Build System

- **package-lock.json:** update deps ([5a2d98f][189])

### [1.2.19][190] (2021-02-22)

#### 🪄 Fixes

- **.changelogrc.js:** fix dark magic ([b4157eb][191])
- **is-next-compat.ts:** never use console.log ([81533c8][192])
- **is-next-compat.ts:** use template string instead of literal ([3a4f0f1][193])
- **unit-index.test.ts:** 100% test coverage ([72189e8][194])

#### ⚙️ Build System

- **.eslintrc.js:** account for node 12 ([cad0fb2][195])
- **.github:** update workflows and templates ([54e51eb][196])
- Backport new webpack config ([b268534][197])
- **integration-external.test.ts:** ensure proper cwd is used for executing externals ([31c1d5b][198])
- **is-next-compat.ts:** use execa instead of shelljs under the hood ([9d12004][199])
- **package.json:** remove shelljs, update other deps ([11e192a][200])
- **package.json:** update dependencies ([9e1705b][201])
- Rename env-expect to expect-env ([035e98b][202])
- **setup.ts:** fix several lib-pkg tools ([44d1967][203])
- Spellcheck-commit and .changelogrc no longer use shelljs ([dd72fd1][204])
- **test:** update with new lib-pkg tools ([004a657][205])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][206])

#### 🔥 Reverted

- _"debug(build-test-deploy.yml): disable debug mode"_ ([6cefa7a][207])

### [1.2.18][208] (2021-02-11)

#### ⚙️ Build System

- **package.json:** update to proper forked dependencies ([042291d][209])

### [1.2.17][210] (2021-02-10)

#### ⚙️ Build System

- **webpack.config.js:** normalize webpack configuration across repos ([65f48a3][211])
- **webpack.config.js:** remove ES6 syntax from JS file ([5ed6dbd][212])

### [1.2.16][213] (2021-02-10)

#### ⚙️ Build System

- **package.json:** update dependencies ([aeef7a9][214])

### [1.2.15][215] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** simplify all examples with more modern syntax; remove @ergodark/types ([964bc47][216])

### [1.2.14][217] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][218])

### [1.2.13][219] (2021-02-05)

#### 🪄 Fixes

- **config:** use transform-rename-import when building externals ([d224f5e][220])
- **index.ts:** use NextApiHandler type (thanks [@janhesters][221]) ([473ff50][222])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][223])
- **is-next-compat.ts:** better handling of generics ([d7bc091][224])
- Next no longer misclassified as CJS ([9ebac01][225])

#### ⚙️ Build System

- **build-test-deploy.yml:** drop support for node 10 ([6adde15][226])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][227])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][228])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][229])
- Drop support for node 10 ([71e9103][230])
- Only silence sjx if not DEBUG ([f01ce40][231])
- **package.json:** improved build-dist ([a3526f2][232])
- **package.json:** nicer destructured vals in docs ([661e62d][233])
- **package.json:** remove extraneous module ([1f2ad6a][234])
- **package.json:** update dependencies ([c64f761][235])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][236])
- **post-release-check.yml:** more resilient post-release check ([856435f][237])
- Properly mocked unit tests for externals ([b3273df][238])
- **test:** improved testing infrastructure ([fffe02e][239])
- **types:** more precise unique-filename type ([a60793c][240])

### [1.2.12][241] (2021-01-23)

#### ⚙️ Build System

- Remove erroneous module import ([6eb2a34][242])

### [1.2.11][243] (2021-01-23)

#### ⚙️ Build System

- Backport/normalize across packages ([e589c1d][244])

### [1.2.10][245] (2021-01-22)

#### ⚙️ Build System

- Update debug statement syntax ([52a2276][246])

### [1.2.9][247] (2021-01-21)

#### ⚙️ Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation ([12e5bbe][248])

### [1.2.8][249] (2021-01-13)

#### 🪄 Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][250])

### [1.2.7][251] (2021-01-12)

#### ⚙️ Build System

- Rebuild lockfile ([94cfa38][252])
- Update babel-plugin-transform-mjs-imports ([62089c7][253])

### [1.2.6][254] (2021-01-06)

#### ⚙️ Build System

- **package.json:** prune old deps ([2cf1d29][255])

### [1.2.5][256] (2021-01-06)

#### ⚙️ Build System

- **.github/workflows/post-release-check.yml:** add new post-release-check ([a307efc][257])
- **.github:** add is-next-compat workflow ([1823c05][258])

### [1.2.4][259] (2021-01-06)

#### ⚙️ Build System

- **readme.md:** add quick start example ([4e5e12c][260])

### [1.2.3][261] (2021-01-05)

#### ⚙️ Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools ([a111c87][262])

### [1.2.2][263] (2021-01-05)

#### ⚙️ Build System

- **readme.md:** cosmetic ([98b65c6][264])

### [1.2.1][265] (2021-01-05)

#### ⚙️ Build System

- **package.json:** update dependencies, prune unused dependencies ([6ef6cbe][266])

## [1.2.0][267] (2021-01-05)

#### ✨ Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD ([b9d2bf0][268])

#### ⚙️ Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][269])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly ([e0e1fd9][270])

### [1.1.3][271] (2020-12-06)

#### ⚙️ Build System

- **package.json:** audit and update deps ([c82695a][272])
- **package.json:** manually bump version ([813b21a][273])

### [1.1.2][274] (2020-11-26)

#### 🪄 Fixes

- **readme:** update install language ([b68c721][275])

### [1.1.1][276] (2020-11-26)

#### 🪄 Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][277])
- **externals:** rewrite test workflow ([d604dfc][278])

## [1.1.0][279] (2020-11-25)

#### 🪄 Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][280])
- **externals:** updated remaining dependency references to peerDependency references ([ccf54fb][281])

### [1.0.10][282] (2020-10-24)

### [1.0.9][283] (2020-10-23)

### [1.0.8][284] (2020-10-20)

### [1.0.7][285] (2020-10-19)

### [1.0.6][286] (2020-10-17)

### [1.0.5][287] (2020-10-13)

### [1.0.4][288] (2020-10-12)

### [1.0.3][289] (2020-10-12)

### [1.0.2][290] (2020-10-07)

### [1.0.1][291] (2020-10-07)

## 1.0.0 (2020-10-07)

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.12...v4.0.13
[4]: https://github.com/Xunnamius/next-test-api-route-handler/commit/edfe781e766cd174892cd394431eb307c134c3c5
[5]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.11...v4.0.12
[6]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a73f21ef6648ccc0f1b63bc76937623e35a3263d
[7]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8a982da44137943d669214a08544effa156e1ef6
[8]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.10...v4.0.11
[9]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a461e8108624c221c70702d1068092a640a5bae5
[10]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1076
[11]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.9...v4.0.10
[12]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c061b91493c31cd74d076e05a78a7dc594737ed3
[13]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.8...v4.0.9
[14]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99118a624cdebc2ed5783c184021e30f36aff6ad
[15]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1068
[16]: https://github.com/Xunnamius/next-test-api-route-handler/commit/50d297642f1ed571d66cd42857afd8651690e3f3
[17]: https://github.com/Xunnamius/next-test-api-route-handler/commit/88948b6f08ba0099dd22c1c3786c6e2c08ef9936
[18]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fa4b2afe931a4300ef7f8314cd264a9ee9c94bd5
[19]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b0701a2628bae2108ea1d9fed7e5e16f95eabeca
[20]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.7...v4.0.8
[21]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99671200663cfc4ccc1270f5b068f12abe16c03b
[22]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43eec5385cb48f619257324a2fe1b54d29748ff1
[23]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.6...v4.0.7
[24]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b6b5164dfa0b94d68f8cd955b175a62becd003a0
[25]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a48555f127b9420527a53d27ac8367246d4474ad
[26]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.5...v4.0.6
[27]: https://github.com/Xunnamius/next-test-api-route-handler/commit/347d7ef86ee6e4ca40c29793fbe112498a3d4b49
[28]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.4...v4.0.5
[29]: https://github.com/Xunnamius/next-test-api-route-handler/commit/633a0464435baec9e4ba6c91ed65909a9edaf298
[30]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1011
[31]: https://github.com/Xunnamius/next-test-api-route-handler/issues/983
[32]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.3...v4.0.4
[33]: https://github.com/Xunnamius/next-test-api-route-handler/commit/01b86b61a75ed315d57d1c087aa4a269a355d601
[34]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1000
[35]: https://github.com/Xunnamius/next-test-api-route-handler/commit/22bb71636c8a46e97d3a287d3534ae91ae4ad514
[36]: https://github.com/Xunnamius/next-test-api-route-handler/issues/993
[37]: https://github.com/Xunnamius/next-test-api-route-handler/commit/502e666158811993e875a64a8d4f924cdee83647
[38]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1006
[39]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1005
[40]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.2...v4.0.3
[41]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7774b30210969be5c5acaafe0330cc9c1541c40
[42]: https://github.com/Xunnamius/next-test-api-route-handler/issues/962
[43]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d03ca21d9634a1c7a56bbe110b32adb56e6c1068
[44]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.1...v4.0.2
[45]: https://github.com/Xunnamius/next-test-api-route-handler/commit/90ff6656c8583b1766b6e6aa041c01e6a0bdca62
[46]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8400a194cf3a824209a8175f48bdd4f0e4c43f8c
[47]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.0...v4.0.1
[48]: https://github.com/Xunnamius/next-test-api-route-handler/commit/09389fe314bfe1048493b979bf79c65a6cdc27e5
[49]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.2.0...v4.0.0
[50]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e2d8865b3b91f735e98d6c0a0c1e1c88d41e8802
[51]: https://github.com/Xunnamius/next-test-api-route-handler/issues/938
[52]: https://github.com/Xunnamius/next-test-api-route-handler/issues/773
[53]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5574831366a1678c12cb315bf4928dac99408b28
[54]: https://github.com/Xunnamius/next-test-api-route-handler/issues/946
[55]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db599aceb97e9b9d36a9461c34084346287b097d
[56]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fdfec8cbdc465df160a169bfdee972054d514eeb
[57]: https://github.com/Xunnamius/next-test-api-route-handler/commit/59f54a5aabc4356767e3ba2b4c0b551cd61e9891
[58]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5c5f9a48118896c43c03d19e3b12539c7a250714
[59]: https://github.com/Xunnamius/next-test-api-route-handler/issues/875
[60]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43680d926fe803817507b4b9394fa5810752cf1f
[61]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75d4e1f4d1bcc92d9680bb0d74cf26667012265a
[62]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f715331be1b66cb5807785d74aeb47b692492302
[63]: https://github.com/Xunnamius/next-test-api-route-handler/commit/85bb8fa5e60e2019e072367063a25b745d675ed9
[64]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0133e113145dc0c3836be3a73336ab2c024b66e7
[65]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62f1d0b2c5ca0146b903d233b73b659a54b7f16e
[66]: https://github.com/Xunnamius/next-test-api-route-handler/commit/913cbd0f0487c9c98146855413fb91e16bb4a7b0
[67]: https://github.com/Xunnamius/next-test-api-route-handler/commit/702cb444cc5e5c15b2d2b1000f27fca8368678e7
[68]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dc237233338af416993b0ec683a844abb6fab02b
[69]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d72ae876557d5f2e71da99a2d285c12bbe77319b
[70]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.10...v3.2.0
[71]: https://github.com/Xunnamius/next-test-api-route-handler/commit/93b8a3c92eb14a5b2d1006c315e26a3c3547a1c3
[72]: https://github.com/Xunnamius/next-test-api-route-handler/issues/916
[73]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.9...v3.1.10
[74]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ca1da40c8f14b9c4a39f198787f526759cd7fa8f
[75]: https://github.com/Xunnamius/next-test-api-route-handler/issues/887
[76]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a9d136b2ada5dcac26a8509fd4590a2dec805a56
[77]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db0223ea0c74edab17489595c1c858eb035dd418
[78]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e457064ddbc7e3f7b1d96c7f27b5b74479303f2f
[79]: https://github.com/Xunnamius/next-test-api-route-handler/issues/908
[80]: https://github.com/Xunnamius/next-test-api-route-handler/commit/be90d573a3a6db09aa35e62bf228a70439f39e73
[81]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.7...v3.1.8
[82]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a4ae05a6d163902daff9021b375db5f362149d7
[83]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.6...v3.1.7
[84]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4af52f43dcba1f6f57887fb977b1430f8009d872
[85]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.5...v3.1.6
[86]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e94142b83d4d6bed7812bca2bd4226a6b67c49a
[87]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.4...v3.1.5
[88]: https://github.com/Xunnamius/next-test-api-route-handler/commit/405f84dabe68b72e11919066cc53dbc69ad4807d
[89]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.3...v3.1.4
[90]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b05e112c11ead6b03c33a1a0bf1dc4fca4d29db5
[91]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.2...v3.1.3
[92]: https://github.com/Xunnamius/next-test-api-route-handler/commit/36a2c44e4b3f6f4f6d4ae9f8a566a42609ee362c
[93]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.1...v3.1.2
[94]: https://github.com/Xunnamius/next-test-api-route-handler/commit/065b4455016812575e1714cc680e57184b49cf5d
[95]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.0...v3.1.1
[96]: https://github.com/Xunnamius/next-test-api-route-handler/commit/484d7023539d95b8930d1665b4b613042b21fe9f
[97]: https://github.com/Xunnamius/next-test-api-route-handler/issues/487
[98]: https://github.com/Xunnamius/next-test-api-route-handler/commit/77ad96dc4a1e3c79f9f75b6827f74f501cce8f5d
[99]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.3...v3.1.0
[100]: https://github.com/Xunnamius/next-test-api-route-handler/commit/21b4b928a40b685a99df34ad20845c97615ee1c8
[101]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a2f0b28b07f8a176a5333551b5788033f90274a
[102]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0ee4ce58b1c7a8b4ea2096c01142097f427b2a00
[103]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.2...v3.0.3
[104]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1e8cd8573cdcfa3489526244c40f373a71d92b40
[105]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.1...v3.0.2
[106]: https://github.com/Xunnamius/next-test-api-route-handler/commit/84f74f55027cd4e67b7e7929f668d4de387dc3c3
[107]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.0...v3.0.1
[108]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a925da287a02b6c36b588b6804e7b0b628364b25
[109]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.4...v3.0.0
[110]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3c60cbd506eb22a4bb23554b06668076e687ad9
[111]: https://github.com/Xunnamius/next-test-api-route-handler/commit/68d30dac2210e4f976afbf5c59378d6b314d4ec3
[112]: https://github.com/Xunnamius/next-test-api-route-handler/commit/15c899a98423c612571886115308e68e20633a1b
[113]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a1a2ee806f4cfd5d199d54dbd82f9f945da1694
[114]: https://github.com/Xunnamius/next-test-api-route-handler/commit/73f44b78c2ee92b443adf99e248c03b985b80891
[115]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.3...v2.3.4
[116]: https://github.com/Xunnamius/next-test-api-route-handler/commit/854704ba9a7f374753e1a51f4fe00db761d7718f
[117]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9302bcc882e9cd4080526f5192186b5259e08726
[118]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.2...v2.3.3
[119]: https://github.com/Xunnamius/next-test-api-route-handler/commit/597c2497a137c86696aba9b750b60f43d728495f
[120]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.1...v2.3.2
[121]: https://github.com/Xunnamius/next-test-api-route-handler/commit/32eafabd592856a7ef286d7d0157e38a8275695d
[122]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd98aab7eea7bdd4b988402b57ce5e93572a7850
[123]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.0...v2.3.1
[124]: https://github.com/Xunnamius/next-test-api-route-handler/commit/91f08d426081afc1009e50d7b9ee6a0a2259268b
[125]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.1...v2.3.0
[126]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd3cd95adb536b05a3cfe8bd0b12329c9acad166
[127]: https://github.com/Xunnamius/next-test-api-route-handler/issues/373
[128]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8746e5fb6b337131303ad0c011c864d5152a864d
[129]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ae778d18f1c01e36070f0612067ec9f00f14a665
[130]: https://github.com/Xunnamius/next-test-api-route-handler/issues/378
[131]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c216caa659a0fcf807ff6b1a0c11c2b331e27d3c
[132]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5fbb6d20cab097250cb8c62d0c5edb6fe80f0bfc
[133]: https://github.com/Xunnamius/next-test-api-route-handler/commit/346e8de1390ba46e9dc8faccc0977c5f50a9dc32
[134]: https://github.com/Xunnamius/next-test-api-route-handler/commit/812e6f262726e328a57cdb0833fb8bfbbcce6708
[135]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5034aba01f30bfb7787247054d12d7dbb90469e6
[136]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.0...v2.2.1
[137]: https://github.com/Xunnamius/next-test-api-route-handler/commit/de9ee177491855eb0ac095f9a1a3e5cfad820420
[138]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.3...v2.2.0
[139]: https://github.com/Xunnamius/next-test-api-route-handler/commit/419d5fe805928605b85fe0e5c64c80eb5a1d798d
[140]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.2...v2.1.3
[141]: https://github.com/Xunnamius/next-test-api-route-handler/commit/7916f0026b59e6325b59395f61b142056c6c8220
[142]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.1...v2.1.2
[143]: https://github.com/Xunnamius/next-test-api-route-handler/commit/74241eeee173a6cf8f987608946c3d8691a67c27
[144]: https://github.com/Xunnamius/next-test-api-route-handler/commit/33b6a34a126909a354a7c3f5d523b0fa47acb960
[145]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c3425caf7d80793a2c1e88ff8fbd29ada8adf2d
[146]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.0...v2.1.1
[147]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd787ca116c3a84f9393f22bf7e898db0a22f5e1
[148]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87ed12b68e930342649c65a76455396879658d48
[149]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.2...v2.1.0
[150]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c51cf0222e17066c03cd80e1c76c5e9f49cacc2e
[151]: https://github.com/Xunnamius/next-test-api-route-handler/issues/295
[152]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2b14d8499f4845d0e2d20fd2098f509f5edc16f9
[153]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f4772607ebb8641ea4e0d6ac2fd152f76dff3f7c
[154]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f61fd8c5ea52265a7ff15252d720d135890880f2
[155]: https://github.com/Xunnamius/next-test-api-route-handler/issues/296
[156]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.1...v2.0.2
[157]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd53fefc6d5c2ff67ed2669b18e28b7ef7005c12
[158]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e5c6a994d4b553369ae42b6be0ae1932346ebbd6
[159]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.0...v2.0.1
[160]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ef32668428df303c4e536aae5793ed14eee0ade5
[161]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.24...v2.0.0
[162]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ee31fa8cefdc2b8b8197d3889fb8aac27467b374
[163]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2f1125cfb481e94af4248cf5b5dfce729cc4d662
[164]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75832099f4c4d0e329aca469ac16c8a25100c26d
[165]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc5e72d9d40f1991315ac0657a4b212331dc065f
[166]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc7eb3db18aa70345a1c11d96436b374a15c3b7f
[167]: https://github.com/Xunnamius/next-test-api-route-handler/commit/20ca255e01d0c2e7824707e19f41ca5a8de0140e
[168]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.23...v1.2.24
[169]: https://github.com/Xunnamius/next-test-api-route-handler/commit/af177c5035c22ab923dd62f6dc82702373f740d4
[170]: https://github.com/Xunnamius/next-test-api-route-handler/commit/364549e2845965954af62fdfa6c1dfa0d6f91f2f
[171]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4db5d04d6a7117fe8e2113d2fafc6150a81f611c
[172]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99ad1276e7e69218719ee2b27173e4ffcb7337f6
[173]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6d523027b8d650ae0a2d121c349e6a4c48af6792
[174]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f7fad4d512f1839d96c6264f2d4abb1c5ed11e7
[175]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d328a86317c60206bda565ba2e315113dadd0c9b
[176]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e7173fca4cbe778419eeff92ddbf7c03c2b00d5
[177]: https://github.com/Xunnamius/next-test-api-route-handler/commit/23cb7804d5f0e775b75eaefb4588beb179dcdcdf
[178]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f25e5fb8b2797621d316e18b01ee503fb4d1263
[179]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.22...v1.2.23
[180]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0040582d2f89e9a14c2335dc85cd5f9201bff644
[181]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.21...v1.2.22
[182]: https://github.com/Xunnamius/next-test-api-route-handler/commit/df9ede3ddde3a2df6a42224ab3302e599bd61516
[183]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.20...v1.2.21
[184]: https://github.com/Xunnamius/next-test-api-route-handler/commit/29aa25a9e2572be5b418fbee9d2d8aba2056583e
[185]: https://github.com/Xunnamius/next-test-api-route-handler/commit/806575792fe9e1522bd6bce0eb10f1bd3407da64
[186]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd3e7faadf148b23994f443a2247cc1316639e7d
[187]: https://github.com/Xunnamius/next-test-api-route-handler/issues/126
[188]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.19...v1.2.20
[189]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
[190]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.18...v1.2.19
[191]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b4157eba128f6a787531fdabf2bebf78851a0d9a
[192]: https://github.com/Xunnamius/next-test-api-route-handler/commit/81533c8953adde75499cd11b552bca5f970addca
[193]: https://github.com/Xunnamius/next-test-api-route-handler/commit/3a4f0f150779a226ee3c9f45fde201391fa1bec0
[194]: https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[195]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cad0fb2b6153434d3be41f394f1fa636cc930435
[196]: https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[197]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[198]: https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[199]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9d12004ad5adfc5d4d6992bdb67c52168829967e
[200]: https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[201]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[202]: https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[203]: https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[204]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd72fd1859fd74df3af0d47a1747d8c404abc3a7
[205]: https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[206]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[207]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6cefa7ae41832e61ef6df75409be61141f7d1687
[208]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.17...v1.2.18
[209]: https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[210]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.16...v1.2.17
[211]: https://github.com/Xunnamius/next-test-api-route-handler/commit/65f48a3d97184bb8a1be4fd27e86be0d7cd6bb00
[212]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5ed6dbd1cdcb15745f4979f1a716d9bce9a93afb
[213]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.15...v1.2.16
[214]: https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[215]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.14...v1.2.15
[216]: https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[217]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.13...v1.2.14
[218]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[219]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.12...v1.2.13
[220]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d224f5eff5a786b96614b2c3f826eba610027da0
[221]: https://github.com/janhesters
[222]: https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[223]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[224]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7bc091fe8f8e85b70987cfa4c663c7c8fd018c8
[225]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[226]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[227]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[228]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[229]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[230]: https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[231]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[232]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[233]: https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[234]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[235]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[236]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[237]: https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[238]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[239]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[240]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a60793c620fe926308f8c99c61076da81aebe2fa
[241]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[242]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[243]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[244]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[245]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[246]: https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[247]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[248]: https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[249]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[250]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[251]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[252]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[253]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[254]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[255]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[256]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[257]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[258]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[259]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[260]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[261]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[262]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[263]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[264]: https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[265]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[266]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[267]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[268]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[269]: https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[270]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[271]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[272]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[273]: https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[274]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[275]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[276]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[277]: https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[278]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[279]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[280]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[281]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[282]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.9...v1.0.10
[283]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.8...v1.0.9
[284]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.7...v1.0.8
[285]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.6...v1.0.7
[286]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.5...v1.0.6
[287]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.4...v1.0.5
[288]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.3...v1.0.4
[289]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.2...v1.0.3
[290]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.1...1.0.2
[291]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.0...1.0.1
