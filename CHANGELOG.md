# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [4.0.4][3] (2024-03-02)

#### 🪄 Fixes

- **src:** allow relative url strings passed via url shorthand for App Router ([01b86b6][4]) <sup>closes [#1000][5]</sup>
- **src:** prevent recursive redirection with undici/whatwg fetch ([22bb716][6]) <sup>closes [#993][7]</sup>
- **src:** replace `AppRouteUserlandModule` with looser type ([502e666][8]) <sup>closes [#1006][9], [#1005][10]</sup>

# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [4.0.3][11] (2024-1-18)

#### 🪄 Fixes

- **src:** ensure ephemeral test servers only listen on localhost ([d7774b3][12])
- **src:** forcefully close all connections after closing test server (fixes [#962][13]) ([d03ca21][14])

### [4.0.2][15] (2024-1-16)

#### 🪄 Fixes

- **src:** add missing metadata not revealed by type information ([90ff665][16])
- **src:** force normalization of request URLs passed to app handler ([8400a19][17])

### [4.0.1][18] (2024-1-16)

#### 🪄 Fixes

- **src:** pass Next.js more accurate app route metadata ([09389fe][19])

## [4.0.0][20] (2024-1-15)

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

- Land initial App Router support ([e2d8865][21]) <sup>closes [#938][22], [#773][23]</sup>
- Retire use of node-fetch ([5574831][24]) <sup>closes [#946][25]</sup>
- **src:** warn when invoking testApiHandler with invalid property combos ([db599ac][26])

#### 🪄 Fixes

- Loosen type checking for `NextApiHandler`s ([fdfec8c][27])
- **src:** deeply summon res.json() return value into our realm ([59f54a5][28])
- **src:** ensure all results of calling ::json on Requests and Responses are summoned into our realm ([5c5f9a4][29])
- **src:** ensure AsyncLocalStorage is available globally (might fix [#875][30]) ([43680d9][31])
- **src:** ensure global fetch is restored after testApiHandler terminates ([75d4e1f][32])
- **src:** forcefully coerce request.body into a ReadableStream ([f715331][33])
- **src:** hoist globalThis.AsyncLocalStorage initialization to be as soon as possible ([85bb8fa][34])
- **src:** normalize pagesHandler into NextApiHandler (esm<->cjs interop) ([0133e11][35])
- Use more accurate return type for app router patchers ([62f1d0b][36])

#### ⚙️ Build System

- **husky:** ensure hooks do not run on rebase ([913cbd0][37])
- **package:** bump minimum supported node versions to maintained ([702cb44][38])
- **package:** remove outdated properties ([dc23723][39])

#### 🧙🏿 Refactored

- **src:** ensure request url is consistent across router types ([d72ae87][40])

## [3.2.0][41] (2024-1-4)

#### ✨ Features

- Update headers for msw\@2 compatibility ([93b8a3c][42]) <sup>closes [#916][43]</sup>

### [3.1.10][44] (2023-11-4)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([ca1da40][45]) <sup>closes [#887][46]</sup>

#### ⚙️ Build System

- Add core-js polyfills and have mercy on aging node versions ([a9d136b][47])
- Modernize tooling ([db0223e][48])
- Upgrade typescript-babel toolchain to nodenext ([e457064][49]) <sup>closes [#908][50]</sup>

#### 🔥 Reverted

- _"docs(readme): update badge links"_ ([be90d57][51])

### [3.1.8][52] (2023-1-3)

#### ⚙️ Build System

- **readme:** update maintainence badge and audit dependencies ([2a4ae05][53])

### [3.1.7][54] (2022-7-27)

#### ⚙️ Build System

- **package:** update dependencies ([4af52f4][55])

### [3.1.6][56] (2022-6-30)

#### 🪄 Fixes

- Ensure non-object "headers" fetch argument is not mangled when mixing in default headers ([6e94142][57])

### [3.1.5][58] (2022-6-26)

#### 🪄 Fixes

- Fix MSW bypass override instructions and unit test ([405f84d][59])

### [3.1.4][60] (2022-6-26)

#### ⚙️ Build System

- **readme:** update MSW bypass override instructions under "test" entry in README ([b05e112][61])

### [3.1.3][62] (2022-5-21)

#### ⚙️ Build System

- **package:** update dev-dependencies ([36a2c44][63])

### [3.1.2][64] (2022-3-23)

#### ⚙️ Build System

- **package:** update dependencies ([065b445][65])

### [3.1.1][66] (2022-2-18)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([484d702][67]) <sup>closes [#487][68]</sup>

#### 🔥 Reverted

- _"refactor: update npm scripts, linting"_ ([77ad96d][69])

## [3.1.0][70] (2022-2-11)

#### ✨ Features

- Automatically add the x-msw-bypass ([21b4b92][71])

#### ⚙️ Build System

- **deps:** bump next from 12.0.8 to 12.0.10 ([2a2f0b2][72])
- **readme:** explain MSW compat default behavior ([0ee4ce5][73])

### [3.0.3][74] (2022-2-5)

#### ⚙️ Build System

- **package:** bump node-fetch to 2.6.7 ([1e8cd85][75])

### [3.0.2][76] (2022-1-3)

#### ⚙️ Build System

- **readme:** update shields.io maintenance badge to 2022 ([84f74f5][77])

### [3.0.1][78] (2021-12-27)

#### ⚙️ Build System

- **package:** retire use of sort-package-json fork ([a925da2][79])

## [3.0.0][80] (2021-12-17)

### 💥 Breaking Changes 💥

- `fetch` now comes from node-fetch directly instead of isomorphic-unfetch

- Exported `TestParameters` type has been renamed to `NtarhParameters`

#### ✨ Features

- **package:** remove debug dependency (moved into dev-deps) ([d3c60cb][81])
- **src:** improved error handling; add support for new `rejectOnHandlerError` option ([68d30da][82])
- **src:** move test-listen functionality into NTARH; remove dependency ([15c899a][83])
- **src:** replace isomorphic-unfetch with node-fetch ([5a1a2ee][84])

#### 🧙🏿 Refactored

- **src:** update types ([73f44b7][85])

### [2.3.4][86] (2021-11-16)

#### 🪄 Fixes

- **src:** lazy-load contents of the "cookies" field ([854704b][87])

#### ⚙️ Build System

- Re-enable treeshaking in webpack ([9302bcc][88])

### [2.3.3][89] (2021-11-10)

#### ⚙️ Build System

- Differentiate between esm and bundler distributables ([597c249][90])

### [2.3.2][91] (2021-11-7)

#### 🪄 Fixes

- **src:** es module compatibility; no longer attempts to require() in mjs files ([32eafab][92])
- **src:** report parsed es module import failures properly ([cd98aab][93])

### [2.3.1][94] (2021-11-6)

#### ⚙️ Build System

- Re-enable ESM (for bundlers) integration tests ([91f08d4][95])

## [2.3.0][96] (2021-11-5)

#### ✨ Features

- Automatically parse "set-cookie" headers; available in response.cookies ([cd3cd95][97]) <sup>closes [#373][98]</sup>

#### 🪄 Fixes

- **src:** ensure exceptions do not prevent Jest from exiting ([8746e5f][99])
- **src:** ensure webpack does not break dynamic require on compile ([ae778d1][100]) <sup>closes [#378][101]</sup>
- Vastly improved error handling for those using node@<15 and/or npm@<7 ([c216caa][102])

#### ⚙️ Build System

- Add back nullish coalescing operator babel transform for older node versions ([5fbb6d2][103])
- **package:** backport npm script fixes ([346e8de][104])
- **src:** fix TS bundle errors on node\@12 and node\@14 ([812e6f2][105])

#### 🔥 Reverted

- _"chore(github): enable debug mode"_ ([5034aba][106])

### [2.2.1][107] (2021-8-29)

#### ⚙️ Build System

- **license:** switch to MIT license ([de9ee17][108])

## [2.2.0][109] (2021-8-22)

#### ✨ Features

- **types:** expanded typescript support; `testApiHandler` weakly typed by default ([419d5fe][110])

### [2.1.3][111] (2021-8-22)

#### 🪄 Fixes

- **src:** ensure dependency resolution failure does not cause test runner to hang ([7916f00][112])

### [2.1.2][113] (2021-8-14)

#### 🪄 Fixes

- **src:** memoize resolver import ([74241ee][114])

#### ⚙️ Build System

- **package:** improve build-docs npm script ([33b6a34][115])
- **src:** add descriptions to TypeScript types ([1c3425c][116])

### [2.1.1][117] (2021-8-13)

#### 🪄 Fixes

- **readme:** update install instructions; fix apollo example ([fd787ca][118])

#### ⚙️ Build System

- **webpack.config:** second fix for faulty env management ([87ed12b][119])

## [2.1.0][120] (2021-8-13)

#### ✨ Features

- **src:** enable backwards compatibility all the way back to next\@9 ([c51cf02][121]) <sup>closes [#295][122]</sup>

#### ⚙️ Build System

- **webpack.config:** do not ignore warnings ([2b14d84][123])
- **webpack.config:** fix faulty env management ([f477260][124])

#### 🔥 Reverted

- _"chore: update dependencies"_ ([f61fd8c][125]) <sup>closes [#296][126]</sup>

### [2.0.2][127] (2021-7-29)

#### ⚙️ Build System

- **external-scripts:** use latest mongodb native driver ([fd53fef][128])
- **webpack.config.js:** more robust build process ([e5c6a99][129])

### [2.0.1][130] (2021-6-27)

#### ⚙️ Build System

- Update dependencies and publish fixed apollo example ([ef32668][131])

## [2.0.0][132] (2021-6-27)

### 💥 Breaking Changes 💥

- This version (and the version before this version) no longer works with next@<10

#### ✨ Features

- Add `url` and `paramsPatcher` ([ee31fa8][133])

#### ⚙️ Build System

- **package.json:** update dependencies ([2f1125c][134])
- **package.json:** update dependencies ([7583209][135])
- **package.json:** update next peer dependency to >=10.0.x ([bc5e72d][136])
- Switch to @xunnamius/conventional-changelog-projector shared config ([bc7eb3d][137])
- Update dependencies ([20ca255][138])

### [1.2.24][139] (2021-5-8)

#### 🪄 Fixes

- **index.ts:** next 10.2.0 compat ([af177c5][140])

#### ⚙️ Build System

- **.github/workflows:** disable old pipeline; begin transition to new pipeline ([364549e][141])
- **.github/workflows:** overhaul pipeline workflows ([4db5d04][142])
- **.github:** split BTD workflow into two separate workflows (security) ([99ad127][143])
- **contributing.md:** split pipeline architecture information off into workflow README.md ([6d52302][144])
- **package.json:** ensure hidden dirs' markdown files are seen by remark (linted and formatted) ([1f7fad4][145])
- **package.json:** update dependencies ([d328a86][146])
- **readme.md:** fix broken links ([6e7173f][147])
- **readme.md:** improvements ([23cb780][148])
- **readme.md:** include architecture description as workflow README.md ([1f25e5f][149])

### [1.2.23][150] (2021-3-14)

#### ⚙️ Build System

- Better documentation ([0040582][151])

### [1.2.22][152] (2021-3-12)

#### ⚙️ Build System

- Update dependencies and fix find-package-json usage ([df9ede3][153])

### [1.2.21][154] (2021-3-12)

#### ⚙️ Build System

- **build-test-deploy.yml:** actions version updates ([29aa25a][155])
- **build-test-deploy.yml:** rollback some pipeline version updates ([8065757][156])
- **package.json:** fix typedoc-markdown-plugin patch ([dd3e7fa][157]) <sup>closes [#126][158]</sup>

### [1.2.20][159] (2021-2-22)

#### ⚙️ Build System

- **package-lock.json:** update deps ([5a2d98f][160])

### [1.2.19][161] (2021-2-22)

#### 🪄 Fixes

- **.changelogrc.js:** fix dark magic ([b4157eb][162])
- **is-next-compat.ts:** never use console.log ([81533c8][163])
- **is-next-compat.ts:** use template string instead of literal ([3a4f0f1][164])
- **unit-index.test.ts:** 100% test coverage ([72189e8][165])

#### ⚙️ Build System

- **.eslintrc.js:** account for node 12 ([cad0fb2][166])
- **.github:** update workflows and templates ([54e51eb][167])
- Backport new webpack config ([b268534][168])
- **integration-external.test.ts:** ensure proper cwd is used for executing externals ([31c1d5b][169])
- **is-next-compat.ts:** use execa instead of shelljs under the hood ([9d12004][170])
- **package.json:** remove shelljs, update other deps ([11e192a][171])
- **package.json:** update dependencies ([9e1705b][172])
- Rename env-expect to expect-env ([035e98b][173])
- **setup.ts:** fix several lib-pkg tools ([44d1967][174])
- Spellcheck-commit and .changelogrc no longer use shelljs ([dd72fd1][175])
- **test:** update with new lib-pkg tools ([004a657][176])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][177])

#### 🔥 Reverted

- _"debug(build-test-deploy.yml): disable debug mode"_ ([6cefa7a][178])

### [1.2.18][179] (2021-2-11)

#### ⚙️ Build System

- **package.json:** update to proper forked dependencies ([042291d][180])

### [1.2.17][181] (2021-2-10)

#### ⚙️ Build System

- **webpack.config.js:** normalize webpack configuration across repos ([65f48a3][182])
- **webpack.config.js:** remove ES6 syntax from JS file ([5ed6dbd][183])

### [1.2.16][184] (2021-2-10)

#### ⚙️ Build System

- **package.json:** update dependencies ([aeef7a9][185])

### [1.2.15][186] (2021-2-8)

#### 🪄 Fixes

- **readme.md:** simplify all examples with more modern syntax; remove @ergodark/types ([964bc47][187])

### [1.2.14][188] (2021-2-8)

#### 🪄 Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][189])

### [1.2.13][190] (2021-2-5)

#### 🪄 Fixes

- **config:** use transform-rename-import when building externals ([d224f5e][191])
- **index.ts:** use NextApiHandler type (thanks [@janhesters][192]) ([473ff50][193])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][194])
- **is-next-compat.ts:** better handling of generics ([d7bc091][195])
- Next no longer misclassified as CJS ([9ebac01][196])

#### ⚙️ Build System

- **build-test-deploy.yml:** drop support for node 10 ([6adde15][197])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][198])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][199])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][200])
- Drop support for node 10 ([71e9103][201])
- Only silence sjx if not DEBUG ([f01ce40][202])
- **package.json:** improved build-dist ([a3526f2][203])
- **package.json:** nicer destructured vals in docs ([661e62d][204])
- **package.json:** remove extraneous module ([1f2ad6a][205])
- **package.json:** update dependencies ([c64f761][206])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][207])
- **post-release-check.yml:** more resilient post-release check ([856435f][208])
- Properly mocked unit tests for externals ([b3273df][209])
- **test:** improved testing infrastructure ([fffe02e][210])
- **types:** more precise unique-filename type ([a60793c][211])

### [1.2.12][212] (2021-1-23)

#### ⚙️ Build System

- Remove erroneous module import ([6eb2a34][213])

### [1.2.11][214] (2021-1-23)

#### ⚙️ Build System

- Backport/normalize across packages ([e589c1d][215])

### [1.2.10][216] (2021-1-22)

#### ⚙️ Build System

- Update debug statement syntax ([52a2276][217])

### [1.2.9][218] (2021-1-21)

#### ⚙️ Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation ([12e5bbe][219])

### [1.2.8][220] (2021-1-13)

#### 🪄 Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][221])

### [1.2.7][222] (2021-1-12)

#### ⚙️ Build System

- Rebuild lockfile ([94cfa38][223])
- Update babel-plugin-transform-mjs-imports ([62089c7][224])

### [1.2.6][225] (2021-1-6)

#### ⚙️ Build System

- **package.json:** prune old deps ([2cf1d29][226])

### [1.2.5][227] (2021-1-6)

#### ⚙️ Build System

- **.github/workflows/post-release-check.yml:** add new post-release-check ([a307efc][228])
- **.github:** add is-next-compat workflow ([1823c05][229])

### [1.2.4][230] (2021-1-6)

#### ⚙️ Build System

- **readme.md:** add quick start example ([4e5e12c][231])

### [1.2.3][232] (2021-1-5)

#### ⚙️ Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools ([a111c87][233])

### [1.2.2][234] (2021-1-5)

#### ⚙️ Build System

- **readme.md:** cosmetic ([98b65c6][235])

### [1.2.1][236] (2021-1-5)

#### ⚙️ Build System

- **package.json:** update dependencies, prune unused dependencies ([6ef6cbe][237])

## [1.2.0][238] (2021-1-5)

#### ✨ Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD ([b9d2bf0][239])

#### ⚙️ Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][240])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly ([e0e1fd9][241])

### [1.1.3][242] (2020-12-6)

#### ⚙️ Build System

- **package.json:** audit and update deps ([c82695a][243])
- **package.json:** manually bump version ([813b21a][244])

### [1.1.2][245] (2020-11-26)

#### 🪄 Fixes

- **readme:** update install language ([b68c721][246])

### [1.1.1][247] (2020-11-26)

#### 🪄 Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][248])
- **externals:** rewrite test workflow ([d604dfc][249])

## [1.1.0][250] (2020-11-25)

#### 🪄 Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][251])
- **externals:** updated remaining dependency references to peerDependency references ([ccf54fb][252])

### [1.0.10][253] (2020-10-24)

### [1.0.9][254] (2020-10-23)

### [1.0.8][255] (2020-10-20)

### [1.0.7][256] (2020-10-19)

### [1.0.6][257] (2020-10-17)

### [1.0.5][258] (2020-10-13)

### [1.0.4][259] (2020-10-12)

### [1.0.3][260] (2020-10-12)

### [1.0.2][261] (2020-10-7)

### [1.0.1][262] (2020-10-7)

## 1.0.0 (2020-10-7)

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.3...v4.0.4
[4]: https://github.com/Xunnamius/next-test-api-route-handler/commit/01b86b61a75ed315d57d1c087aa4a269a355d601
[5]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1000
[6]: https://github.com/Xunnamius/next-test-api-route-handler/commit/22bb71636c8a46e97d3a287d3534ae91ae4ad514
[7]: https://github.com/Xunnamius/next-test-api-route-handler/issues/993
[8]: https://github.com/Xunnamius/next-test-api-route-handler/commit/502e666158811993e875a64a8d4f924cdee83647
[9]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1006
[10]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1005
[11]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.2...v4.0.3
[12]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7774b30210969be5c5acaafe0330cc9c1541c40
[13]: https://github.com/Xunnamius/next-test-api-route-handler/issues/962
[14]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d03ca21d9634a1c7a56bbe110b32adb56e6c1068
[15]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.1...v4.0.2
[16]: https://github.com/Xunnamius/next-test-api-route-handler/commit/90ff6656c8583b1766b6e6aa041c01e6a0bdca62
[17]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8400a194cf3a824209a8175f48bdd4f0e4c43f8c
[18]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v4.0.0...v4.0.1
[19]: https://github.com/Xunnamius/next-test-api-route-handler/commit/09389fe314bfe1048493b979bf79c65a6cdc27e5
[20]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.2.0...v4.0.0
[21]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e2d8865b3b91f735e98d6c0a0c1e1c88d41e8802
[22]: https://github.com/Xunnamius/next-test-api-route-handler/issues/938
[23]: https://github.com/Xunnamius/next-test-api-route-handler/issues/773
[24]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5574831366a1678c12cb315bf4928dac99408b28
[25]: https://github.com/Xunnamius/next-test-api-route-handler/issues/946
[26]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db599aceb97e9b9d36a9461c34084346287b097d
[27]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fdfec8cbdc465df160a169bfdee972054d514eeb
[28]: https://github.com/Xunnamius/next-test-api-route-handler/commit/59f54a5aabc4356767e3ba2b4c0b551cd61e9891
[29]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5c5f9a48118896c43c03d19e3b12539c7a250714
[30]: https://github.com/Xunnamius/next-test-api-route-handler/issues/875
[31]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43680d926fe803817507b4b9394fa5810752cf1f
[32]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75d4e1f4d1bcc92d9680bb0d74cf26667012265a
[33]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f715331be1b66cb5807785d74aeb47b692492302
[34]: https://github.com/Xunnamius/next-test-api-route-handler/commit/85bb8fa5e60e2019e072367063a25b745d675ed9
[35]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0133e113145dc0c3836be3a73336ab2c024b66e7
[36]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62f1d0b2c5ca0146b903d233b73b659a54b7f16e
[37]: https://github.com/Xunnamius/next-test-api-route-handler/commit/913cbd0f0487c9c98146855413fb91e16bb4a7b0
[38]: https://github.com/Xunnamius/next-test-api-route-handler/commit/702cb444cc5e5c15b2d2b1000f27fca8368678e7
[39]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dc237233338af416993b0ec683a844abb6fab02b
[40]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d72ae876557d5f2e71da99a2d285c12bbe77319b
[41]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.10...v3.2.0
[42]: https://github.com/Xunnamius/next-test-api-route-handler/commit/93b8a3c92eb14a5b2d1006c315e26a3c3547a1c3
[43]: https://github.com/Xunnamius/next-test-api-route-handler/issues/916
[44]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.9...v3.1.10
[45]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ca1da40c8f14b9c4a39f198787f526759cd7fa8f
[46]: https://github.com/Xunnamius/next-test-api-route-handler/issues/887
[47]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a9d136b2ada5dcac26a8509fd4590a2dec805a56
[48]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db0223ea0c74edab17489595c1c858eb035dd418
[49]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e457064ddbc7e3f7b1d96c7f27b5b74479303f2f
[50]: https://github.com/Xunnamius/next-test-api-route-handler/issues/908
[51]: https://github.com/Xunnamius/next-test-api-route-handler/commit/be90d573a3a6db09aa35e62bf228a70439f39e73
[52]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.7...v3.1.8
[53]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a4ae05a6d163902daff9021b375db5f362149d7
[54]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.6...v3.1.7
[55]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4af52f43dcba1f6f57887fb977b1430f8009d872
[56]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.5...v3.1.6
[57]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e94142b83d4d6bed7812bca2bd4226a6b67c49a
[58]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.4...v3.1.5
[59]: https://github.com/Xunnamius/next-test-api-route-handler/commit/405f84dabe68b72e11919066cc53dbc69ad4807d
[60]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.3...v3.1.4
[61]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b05e112c11ead6b03c33a1a0bf1dc4fca4d29db5
[62]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.2...v3.1.3
[63]: https://github.com/Xunnamius/next-test-api-route-handler/commit/36a2c44e4b3f6f4f6d4ae9f8a566a42609ee362c
[64]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.1...v3.1.2
[65]: https://github.com/Xunnamius/next-test-api-route-handler/commit/065b4455016812575e1714cc680e57184b49cf5d
[66]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.1.0...v3.1.1
[67]: https://github.com/Xunnamius/next-test-api-route-handler/commit/484d7023539d95b8930d1665b4b613042b21fe9f
[68]: https://github.com/Xunnamius/next-test-api-route-handler/issues/487
[69]: https://github.com/Xunnamius/next-test-api-route-handler/commit/77ad96dc4a1e3c79f9f75b6827f74f501cce8f5d
[70]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.3...v3.1.0
[71]: https://github.com/Xunnamius/next-test-api-route-handler/commit/21b4b928a40b685a99df34ad20845c97615ee1c8
[72]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a2f0b28b07f8a176a5333551b5788033f90274a
[73]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0ee4ce58b1c7a8b4ea2096c01142097f427b2a00
[74]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.2...v3.0.3
[75]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1e8cd8573cdcfa3489526244c40f373a71d92b40
[76]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.1...v3.0.2
[77]: https://github.com/Xunnamius/next-test-api-route-handler/commit/84f74f55027cd4e67b7e7929f668d4de387dc3c3
[78]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v3.0.0...v3.0.1
[79]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a925da287a02b6c36b588b6804e7b0b628364b25
[80]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.4...v3.0.0
[81]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3c60cbd506eb22a4bb23554b06668076e687ad9
[82]: https://github.com/Xunnamius/next-test-api-route-handler/commit/68d30dac2210e4f976afbf5c59378d6b314d4ec3
[83]: https://github.com/Xunnamius/next-test-api-route-handler/commit/15c899a98423c612571886115308e68e20633a1b
[84]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a1a2ee806f4cfd5d199d54dbd82f9f945da1694
[85]: https://github.com/Xunnamius/next-test-api-route-handler/commit/73f44b78c2ee92b443adf99e248c03b985b80891
[86]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.3...v2.3.4
[87]: https://github.com/Xunnamius/next-test-api-route-handler/commit/854704ba9a7f374753e1a51f4fe00db761d7718f
[88]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9302bcc882e9cd4080526f5192186b5259e08726
[89]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.2...v2.3.3
[90]: https://github.com/Xunnamius/next-test-api-route-handler/commit/597c2497a137c86696aba9b750b60f43d728495f
[91]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.1...v2.3.2
[92]: https://github.com/Xunnamius/next-test-api-route-handler/commit/32eafabd592856a7ef286d7d0157e38a8275695d
[93]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd98aab7eea7bdd4b988402b57ce5e93572a7850
[94]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.0...v2.3.1
[95]: https://github.com/Xunnamius/next-test-api-route-handler/commit/91f08d426081afc1009e50d7b9ee6a0a2259268b
[96]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.1...v2.3.0
[97]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd3cd95adb536b05a3cfe8bd0b12329c9acad166
[98]: https://github.com/Xunnamius/next-test-api-route-handler/issues/373
[99]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8746e5fb6b337131303ad0c011c864d5152a864d
[100]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ae778d18f1c01e36070f0612067ec9f00f14a665
[101]: https://github.com/Xunnamius/next-test-api-route-handler/issues/378
[102]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c216caa659a0fcf807ff6b1a0c11c2b331e27d3c
[103]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5fbb6d20cab097250cb8c62d0c5edb6fe80f0bfc
[104]: https://github.com/Xunnamius/next-test-api-route-handler/commit/346e8de1390ba46e9dc8faccc0977c5f50a9dc32
[105]: https://github.com/Xunnamius/next-test-api-route-handler/commit/812e6f262726e328a57cdb0833fb8bfbbcce6708
[106]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5034aba01f30bfb7787247054d12d7dbb90469e6
[107]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.0...v2.2.1
[108]: https://github.com/Xunnamius/next-test-api-route-handler/commit/de9ee177491855eb0ac095f9a1a3e5cfad820420
[109]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.3...v2.2.0
[110]: https://github.com/Xunnamius/next-test-api-route-handler/commit/419d5fe805928605b85fe0e5c64c80eb5a1d798d
[111]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.2...v2.1.3
[112]: https://github.com/Xunnamius/next-test-api-route-handler/commit/7916f0026b59e6325b59395f61b142056c6c8220
[113]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.1...v2.1.2
[114]: https://github.com/Xunnamius/next-test-api-route-handler/commit/74241eeee173a6cf8f987608946c3d8691a67c27
[115]: https://github.com/Xunnamius/next-test-api-route-handler/commit/33b6a34a126909a354a7c3f5d523b0fa47acb960
[116]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c3425caf7d80793a2c1e88ff8fbd29ada8adf2d
[117]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.0...v2.1.1
[118]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd787ca116c3a84f9393f22bf7e898db0a22f5e1
[119]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87ed12b68e930342649c65a76455396879658d48
[120]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.2...v2.1.0
[121]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c51cf0222e17066c03cd80e1c76c5e9f49cacc2e
[122]: https://github.com/Xunnamius/next-test-api-route-handler/issues/295
[123]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2b14d8499f4845d0e2d20fd2098f509f5edc16f9
[124]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f4772607ebb8641ea4e0d6ac2fd152f76dff3f7c
[125]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f61fd8c5ea52265a7ff15252d720d135890880f2
[126]: https://github.com/Xunnamius/next-test-api-route-handler/issues/296
[127]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.1...v2.0.2
[128]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd53fefc6d5c2ff67ed2669b18e28b7ef7005c12
[129]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e5c6a994d4b553369ae42b6be0ae1932346ebbd6
[130]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.0...v2.0.1
[131]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ef32668428df303c4e536aae5793ed14eee0ade5
[132]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.24...v2.0.0
[133]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ee31fa8cefdc2b8b8197d3889fb8aac27467b374
[134]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2f1125cfb481e94af4248cf5b5dfce729cc4d662
[135]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75832099f4c4d0e329aca469ac16c8a25100c26d
[136]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc5e72d9d40f1991315ac0657a4b212331dc065f
[137]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc7eb3db18aa70345a1c11d96436b374a15c3b7f
[138]: https://github.com/Xunnamius/next-test-api-route-handler/commit/20ca255e01d0c2e7824707e19f41ca5a8de0140e
[139]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.23...v1.2.24
[140]: https://github.com/Xunnamius/next-test-api-route-handler/commit/af177c5035c22ab923dd62f6dc82702373f740d4
[141]: https://github.com/Xunnamius/next-test-api-route-handler/commit/364549e2845965954af62fdfa6c1dfa0d6f91f2f
[142]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4db5d04d6a7117fe8e2113d2fafc6150a81f611c
[143]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99ad1276e7e69218719ee2b27173e4ffcb7337f6
[144]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6d523027b8d650ae0a2d121c349e6a4c48af6792
[145]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f7fad4d512f1839d96c6264f2d4abb1c5ed11e7
[146]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d328a86317c60206bda565ba2e315113dadd0c9b
[147]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e7173fca4cbe778419eeff92ddbf7c03c2b00d5
[148]: https://github.com/Xunnamius/next-test-api-route-handler/commit/23cb7804d5f0e775b75eaefb4588beb179dcdcdf
[149]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f25e5fb8b2797621d316e18b01ee503fb4d1263
[150]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.22...v1.2.23
[151]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0040582d2f89e9a14c2335dc85cd5f9201bff644
[152]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.21...v1.2.22
[153]: https://github.com/Xunnamius/next-test-api-route-handler/commit/df9ede3ddde3a2df6a42224ab3302e599bd61516
[154]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.20...v1.2.21
[155]: https://github.com/Xunnamius/next-test-api-route-handler/commit/29aa25a9e2572be5b418fbee9d2d8aba2056583e
[156]: https://github.com/Xunnamius/next-test-api-route-handler/commit/806575792fe9e1522bd6bce0eb10f1bd3407da64
[157]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd3e7faadf148b23994f443a2247cc1316639e7d
[158]: https://github.com/Xunnamius/next-test-api-route-handler/issues/126
[159]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.19...v1.2.20
[160]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
[161]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.18...v1.2.19
[162]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b4157eba128f6a787531fdabf2bebf78851a0d9a
[163]: https://github.com/Xunnamius/next-test-api-route-handler/commit/81533c8953adde75499cd11b552bca5f970addca
[164]: https://github.com/Xunnamius/next-test-api-route-handler/commit/3a4f0f150779a226ee3c9f45fde201391fa1bec0
[165]: https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[166]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cad0fb2b6153434d3be41f394f1fa636cc930435
[167]: https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[168]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[169]: https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[170]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9d12004ad5adfc5d4d6992bdb67c52168829967e
[171]: https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[172]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[173]: https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[174]: https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[175]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd72fd1859fd74df3af0d47a1747d8c404abc3a7
[176]: https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[177]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[178]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6cefa7ae41832e61ef6df75409be61141f7d1687
[179]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.17...v1.2.18
[180]: https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[181]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.16...v1.2.17
[182]: https://github.com/Xunnamius/next-test-api-route-handler/commit/65f48a3d97184bb8a1be4fd27e86be0d7cd6bb00
[183]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5ed6dbd1cdcb15745f4979f1a716d9bce9a93afb
[184]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.15...v1.2.16
[185]: https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[186]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.14...v1.2.15
[187]: https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[188]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.13...v1.2.14
[189]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[190]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.12...v1.2.13
[191]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d224f5eff5a786b96614b2c3f826eba610027da0
[192]: https://github.com/janhesters
[193]: https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[194]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[195]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7bc091fe8f8e85b70987cfa4c663c7c8fd018c8
[196]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[197]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[198]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[199]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[200]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[201]: https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[202]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[203]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[204]: https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[205]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[206]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[207]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[208]: https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[209]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[210]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[211]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a60793c620fe926308f8c99c61076da81aebe2fa
[212]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[213]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[214]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[215]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[216]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[217]: https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[218]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[219]: https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[220]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[221]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[222]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[223]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[224]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[225]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[226]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[227]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[228]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[229]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[230]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[231]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[232]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[233]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[234]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[235]: https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[236]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[237]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[238]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[239]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[240]: https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[241]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[242]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[243]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[244]: https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[245]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[246]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[247]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[248]: https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[249]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[250]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[251]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[252]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[253]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.9...v1.0.10
[254]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.8...v1.0.9
[255]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.7...v1.0.8
[256]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.6...v1.0.7
[257]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.5...v1.0.6
[258]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.4...v1.0.5
[259]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.3...v1.0.4
[260]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.2...v1.0.3
[261]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.1...1.0.2
[262]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.0...1.0.1
