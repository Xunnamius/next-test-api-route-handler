# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

<br />

## next-test-api-route-handler[@5.0.0][3] (2025-07-19)

### 💥 BREAKING CHANGES 💥

- Minimum supported node version is now 20.18.0

### 🪄 Fixes

- **src:** prepare for next\@canary to be released ([2864e3a][4])

### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.3 to 0.10.10 ([94415dc][5])
- **deps:** bump core-js from 3.41.0 to 3.42.0 ([f88a713][6])
- **deps:** bump core-js from 3.42.0 to 3.44.0 ([10fac99][7])
- **package:** drop support for node\@18 ([d97e8ba][8])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.4][9] (2026-03-22)

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.12 to 0.10.18 ([e0d2b1f][10])
- **deps:** bump cookie from 1.0.2 to 1.1.1 ([b82bd64][11])
- **deps:** bump core-js from 3.45.1 to 3.49.0 ([feb1004][12])
- **deps:** bump minimatch ([a494d0b][13])
- **deps:** bump minimatch ([9776164][14])
- **deps:** bump next from 15.5.4 to 16.2.1 ([6999a86][15])
- **deps:** bump next from 15.5.4 to 16.2.1 ([bdeeb98][16])
- **deps:** bump tar and npm ([f2a0685][17])
- **deps:** bump tar and npm ([05891f5][18])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.3][19] (2025-09-04)

#### ⚡️ Optimizations

- Use Node's ReadableStream.from instead of ponyfill ([6f32402][20])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.2][21] (2025-08-22)

#### 🪄 Fixes

- **src:** polyfill `react.createContext` to support "react-server" condition ([d3aea1e][22]) <sup>see [#1151][23]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.1][24] (2025-08-21)

#### 🪄 Fixes

- **src:** address minor incompatibility with next\@15.5 ([290654c][25])

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.10 to 0.10.12 ([fc0de21][26])
- **deps:** bump core-js from 3.44.0 to 3.45.0 ([018776a][27])
- **deps:** bump core-js from 3.45.0 to 3.45.1 ([f017121][28])

<br />

## next-test-api-route-handler[@4.0.0][29] (2024-01-15)

### 💥 BREAKING CHANGES 💥

- **Request URLs (e.g. `req.url`) will always be `"ntarh://testApiHandler"`.**

  This is instead of the old localhost string with the random port number, which is an implementation detail that should not have been exposed to end developers.

- **The `handler` option of `testApiHandler` (i.e. `testApiHandler({ handler })`) has been renamed to `pagesHandler`. It is otherwise functionally equivalent.**

  Those migrating from NTARH@<4, the process should be as simple as renaming `handler` to `pagesHandler` in your tests and getting on with your life.

- `NtarhParameters` has been superseded by `NtarhInit`, `NtarhInitAppRouter`, and `NtarhInitPagesRouter`.

- `requestPatcher`, `reponsePatcher`, and `paramsPatcher` options of `testApiHandler({ ... })` can now be asynchronous and return Promises. `paramsPatcher` can additionally return a brand new `params` object that will overwrite the old one rather than merely augmenting it.

- `requestPatcher`, `reponsePatcher`, and `paramsPatcher` options of `testApiHandler({ ... })` no longer support parenthetical shorthand notation. For example, the following will cause a type error: `testApiHandler({ paramsPatcher: (params) => (params.id = "some-id") })`.

- `testApiHandler({ ... })` now accepts the `appHandler` option. When this option is provided, the function signatures of the following options shift to support standard `Request`/`Response` parameters and return types where appropriate: `requestPatcher`, `responsePatcher`, and `paramsPatcher`. See the docs, or intellisense, for more details.

- Minimum supported Node.js version is now 18.18.2

- Node-fetch has been replaced by Node's native fetch function. There may be subtle API changes between the two.

- The `pagesHandler` option of `testApiHandler` (i.e. `testApiHandler({ pagesHandler })`) will \*\*not\*\* accept edge runtime routes. To test your edge runtime routes, use the `appHandler` option instead.

- This version of NTARH is now actively tracking a second Next.js internal export, one that is not guaranteed to be available before `next@14.0.4`. Therefore, versions of Next.js older than 14.0.4 \*\*explicitly unsupported\*\* when using the `appHandler` option. On the other hand, `pagesHandler` will always work regardless of Next.js version until Vercel eventually removes the Pages Router functionality entirely.

### ✨ Features

- Land initial App Router support ([e2d8865][30]) <sup>see [#938][31], [#773][32]</sup>
- Retire use of node-fetch ([5574831][33]) <sup>see [#946][34]</sup>
- **src:** warn when invoking testApiHandler with invalid property combos ([db599ac][35])

### 🪄 Fixes

- Loosen type checking for `NextApiHandler`s ([fdfec8c][36])
- **src:** deeply summon res.json() return value into our realm ([59f54a5][37])
- **src:** ensure all results of calling ::json on Requests and Responses are summoned into our realm ([5c5f9a4][38])
- **src:** ensure AsyncLocalStorage is available globally (might fix [#875][39]) ([43680d9][40])
- **src:** ensure global fetch is restored after testApiHandler terminates ([75d4e1f][41])
- **src:** forcefully coerce request.body into a ReadableStream ([f715331][42])
- **src:** hoist globalThis.AsyncLocalStorage initialization to be as soon as possible ([85bb8fa][43])
- **src:** normalize pagesHandler into NextApiHandler (esm<->cjs interop) ([0133e11][44])
- Use more accurate return type for app router patchers ([62f1d0b][45])

### ⚙️ Build System

- **husky:** ensure hooks do not run on rebase ([913cbd0][46])
- **package:** bump minimum supported node versions to maintained ([702cb44][47])
- **package:** remove outdated properties ([dc23723][48])

### 🧙🏿 Refactored

- **src:** ensure request url is consistent across router types ([d72ae87][49])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.16][50] (2025-03-27)

#### 🪄 Fixes

- **src:** opportunistically polyfill missing react exports ([410a62f][51]) <sup>see [#1167][52]</sup>

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.1 to 0.10.3 ([bfcebd9][53])
- **deps:** bump @whatwg-node/server from 0.9.70 to 0.9.71 ([9c19de4][54])
- **deps:** bump @whatwg-node/server from 0.9.71 to 0.10.1 ([c6496fa][55])
- **deps:** bump core-js from 3.40.0 to 3.41.0 ([274e800][56])
- **test:** add latest `next@12`, `next@13`, and `next@14` versions to test matrix ([5ee3def][57])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.15][58] (2025-02-27)

#### 🪄 Fixes

- **src:** address incompatibility with next\@15.2 ([69525da][59]) <sup>see [#1129][60]</sup>

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.9.66 to 0.9.70 ([1c11e5d][61])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.14][62] (2024-10-22)

#### 🪄 Fixes

- **package:** revert breaking change in engines.node ([cde5496][63]) <sup>see [#1115][64]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.13][65] (2024-10-22)

#### 🪄 Fixes

- **src:** add support for next\@15.0.0 release ([edfe781][66])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.12][67] (2024-10-17)

#### ⚙️ Build System

- Prepare compatibility layer for next\@15 ([a73f21e][68])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.11][69] (2024-09-18)

#### 🪄 Fixes

- **src:** stop Next.js from attempting to statically generate routes under test ([a461e81][70]) <sup>see [#1076][71]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.10][72] (2024-09-18)

#### 🪄 Fixes

- **src:** pass empty `apiContext` to work around `multiZoneDraftMode` check ([c061b91][73])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.9][74] (2024-09-13)

#### 🪄 Fixes

- **src:** prevent ipv6-related failures due to assuming "localhost" resolvability ([99118a6][75]) <sup>see [#1068][76]</sup>

#### ⚙️ Build System

- **husky:** update husky scripts ([88948b6][77])
- **package:** downgrade @octokit/rest to 20 ([fa4b2af][78])
- Remove spellchecker dependency ([b0701a2][79])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.8][80] (2024-06-10)

#### ⚙️ Build System

- Revert conventional-changelog-cli update ([9967120][81])
- Update documentation generator ([43eec53][82])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.7][83] (2024-04-17)

#### ⚙️ Build System

- **readme:** add section on jsdom support ([a48555f][84])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.6][85] (2024-04-12)

#### 🪄 Fixes

- **src:** extend backwards compatibility to msw\@1; remove optional msw peer dependency ([347d7ef][86])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.5][87] (2024-03-03)

#### 🪄 Fixes

- **src:** replace request spread with explicit options ([633a046][88]) <sup>see [#1011][89], [#983][90]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.4][91] (2024-03-02)

#### 🪄 Fixes

- **src:** allow relative url strings passed via url shorthand for App Router ([01b86b6][92]) <sup>see [#1000][93]</sup>
- **src:** prevent recursive redirection with undici/whatwg fetch ([22bb716][94]) <sup>see [#993][95]</sup>
- **src:** replace `AppRouteUserlandModule` with looser type ([502e666][96]) <sup>see [#1006][97], [#1005][98]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.3][99] (2024-01-18)

#### 🪄 Fixes

- **src:** ensure ephemeral test servers only listen on localhost ([d7774b3][100])
- **src:** forcefully close all connections after closing test server (fixes [#962][101]) ([d03ca21][102])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.2][103] (2024-01-16)

#### 🪄 Fixes

- **src:** add missing metadata not revealed by type information ([90ff665][104])
- **src:** force normalization of request URLs passed to app handler ([8400a19][105])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.1][106] (2024-01-16)

#### 🪄 Fixes

- **src:** pass Next.js more accurate app route metadata ([09389fe][107])

<br />

## next-test-api-route-handler[@3.2.0][108] (2024-01-04)

### ✨ Features

- Update headers for msw\@2 compatibility ([93b8a3c][109]) <sup>see [#916][110]</sup>

<br />

## next-test-api-route-handler[@3.1.0][111] (2022-02-11)

### ✨ Features

- Automatically add the x-msw-bypass ([21b4b92][112])

### ⚙️ Build System

- **deps:** bump next from 12.0.8 to 12.0.10 ([2a2f0b2][113])
- **readme:** explain MSW compat default behavior ([0ee4ce5][114])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.10][115] (2023-11-04)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([ca1da40][116]) <sup>see [#887][117]</sup>

#### ⚙️ Build System

- Add core-js polyfills and have mercy on aging node versions ([a9d136b][118])
- Modernize tooling ([db0223e][119])
- Upgrade typescript-babel toolchain to nodenext ([e457064][120]) <sup>see [#908][121]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.8][122] (2023-01-03)

#### ⚙️ Build System

- **readme:** update maintainence badge and audit dependencies ([2a4ae05][123])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.7][124] (2022-07-27)

#### ⚙️ Build System

- **package:** update dependencies ([4af52f4][125])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.6][126] (2022-06-30)

#### 🪄 Fixes

- Ensure non-object "headers" fetch argument is not mangled when mixing in default headers ([6e94142][127])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.5][128] (2022-06-26)

#### 🪄 Fixes

- Fix MSW bypass override instructions and unit test ([405f84d][129])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.4][130] (2022-06-26)

#### ⚙️ Build System

- **readme:** update MSW bypass override instructions under "test" entry in README ([b05e112][131])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.3][132] (2022-05-21)

#### ⚙️ Build System

- **package:** update dev-dependencies ([36a2c44][133])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.2][134] (2022-03-23)

#### ⚙️ Build System

- **package:** update dependencies ([065b445][135])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.1][136] (2022-02-18)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([484d702][137]) <sup>see [#487][138]</sup>

<br />

## next-test-api-route-handler[@3.0.0][139] (2021-12-17)

### 💥 BREAKING CHANGES 💥

- `fetch` now comes from node-fetch directly instead of isomorphic-unfetch

- Exported `TestParameters` type has been renamed to `NtarhParameters`

### ✨ Features

- **package:** remove debug dependency (moved into dev-deps) ([d3c60cb][140])
- **src:** improved error handling; add support for new `rejectOnHandlerError` option ([68d30da][141])
- **src:** move test-listen functionality into NTARH; remove dependency ([15c899a][142])
- **src:** replace isomorphic-unfetch with node-fetch ([5a1a2ee][143])

### 🧙🏿 Refactored

- **src:** update types ([73f44b7][144])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.3][145] (2022-02-05)

#### ⚙️ Build System

- **package:** bump node-fetch to 2.6.7 ([1e8cd85][146])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.2][147] (2022-01-03)

#### ⚙️ Build System

- **readme:** update shields.io maintenance badge to 2022 ([84f74f5][148])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.1][149] (2021-12-27)

#### ⚙️ Build System

- **package:** retire use of sort-package-json fork ([a925da2][150])

<br />

## next-test-api-route-handler[@2.3.0][151] (2021-11-05)

### ✨ Features

- Automatically parse "set-cookie" headers; available in response.cookies ([cd3cd95][152]) <sup>see [#373][153]</sup>

### 🪄 Fixes

- **src:** ensure exceptions do not prevent Jest from exiting ([8746e5f][154])
- **src:** ensure webpack does not break dynamic require on compile ([ae778d1][155]) <sup>see [#378][156]</sup>
- Vastly improved error handling for those using node@<15 and/or npm@<7 ([c216caa][157])

### ⚙️ Build System

- Add back nullish coalescing operator babel transform for older node versions ([5fbb6d2][158])
- **package:** backport npm script fixes ([346e8de][159])
- **src:** fix TS bundle errors on node\@12 and node\@14 ([812e6f2][160])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.4][161] (2021-11-16)

#### 🪄 Fixes

- **src:** lazy-load contents of the "cookies" field ([854704b][162])

#### ⚙️ Build System

- Re-enable treeshaking in webpack ([9302bcc][163])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.3][164] (2021-11-10)

#### ⚙️ Build System

- Differentiate between esm and bundler distributables ([597c249][165])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.2][166] (2021-11-07)

#### 🪄 Fixes

- **src:** es module compatibility; no longer attempts to require() in mjs files ([32eafab][167])
- **src:** report parsed es module import failures properly ([cd98aab][168])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.1][169] (2021-11-06)

#### ⚙️ Build System

- Re-enable ESM (for bundlers) integration tests ([91f08d4][170])

<br />

## next-test-api-route-handler[@2.2.0][171] (2021-08-22)

### ✨ Features

- **types:** expanded typescript support; `testApiHandler` weakly typed by default ([419d5fe][172])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.2.1][173] (2021-08-29)

#### ⚙️ Build System

- **license:** switch to MIT license ([de9ee17][174])

<br />

## next-test-api-route-handler[@2.1.0][175] (2021-08-13)

### ✨ Features

- **src:** enable backwards compatibility all the way back to next\@9 ([c51cf02][176]) <sup>see [#295][177]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.3][178] (2021-08-22)

#### 🪄 Fixes

- **src:** ensure dependency resolution failure does not cause test runner to hang ([7916f00][179])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.2][180] (2021-08-14)

#### 🪄 Fixes

- **src:** memoize resolver import ([74241ee][181])

#### ⚙️ Build System

- **package:** improve build-docs npm script ([33b6a34][182])
- **src:** add descriptions to TypeScript types ([1c3425c][183])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.1][184] (2021-08-13)

#### 🪄 Fixes

- **readme:** update install instructions; fix apollo example ([fd787ca][185])

<br />

## next-test-api-route-handler[@2.0.0][186] (2021-06-27)

### 💥 BREAKING CHANGES 💥

- This version (and the version before this version) no longer works with next@<10

### ✨ Features

- Add `url` and `paramsPatcher` ([ee31fa8][187])

### ⚙️ Build System

- **package.json:** update dependencies ([2f1125c][188])
- **package.json:** update dependencies ([7583209][189])
- **package.json:** update next peer dependency to >=10.0.x ([bc5e72d][190])
- Switch to @xunnamius/conventional-changelog-projector shared config ([bc7eb3d][191])
- Update dependencies ([20ca255][192])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.0.2][193] (2021-07-29)

#### ⚙️ Build System

- **external-scripts:** use latest mongodb native driver ([fd53fef][194])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.0.1][195] (2021-06-27)

#### ⚙️ Build System

- Update dependencies and publish fixed apollo example ([ef32668][196])

<br />

## next-test-api-route-handler[@1.2.0][197] (2021-01-05)

### ✨ Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD ([b9d2bf0][198])

### ⚙️ Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][199])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly ([e0e1fd9][200])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.24][201] (2021-05-08)

#### 🪄 Fixes

- **index.ts:** next 10.2.0 compat ([af177c5][202])

#### ⚙️ Build System

- **.github/workflows:** disable old pipeline; begin transition to new pipeline ([364549e][203])
- **.github/workflows:** overhaul pipeline workflows ([4db5d04][204])
- **.github:** split BTD workflow into two separate workflows (security) ([99ad127][205])
- **contributing.md:** split pipeline architecture information off into workflow README.md ([6d52302][206])
- **package.json:** ensure hidden dirs' markdown files are seen by remark (linted and formatted) ([1f7fad4][207])
- **package.json:** update dependencies ([d328a86][208])
- **readme.md:** fix broken links ([6e7173f][209])
- **readme.md:** improvements ([23cb780][210])
- **readme.md:** include architecture description as workflow README.md ([1f25e5f][211])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.23][212] (2021-03-14)

#### ⚙️ Build System

- Better documentation ([0040582][213])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.22][214] (2021-03-12)

#### ⚙️ Build System

- Update dependencies and fix find-package-json usage ([df9ede3][215])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.21][216] (2021-03-12)

#### ⚙️ Build System

- **build-test-deploy.yml:** actions version updates ([29aa25a][217])
- **build-test-deploy.yml:** rollback some pipeline version updates ([8065757][218])
- **package.json:** fix typedoc-markdown-plugin patch ([dd3e7fa][219]) <sup>see [#126][220]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.20][221] (2021-02-22)

#### ⚙️ Build System

- **package-lock.json:** update deps ([5a2d98f][222])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.19][223] (2021-02-22)

#### 🪄 Fixes

- **unit-index.test.ts:** 100% test coverage ([72189e8][224])

#### ⚙️ Build System

- **.github:** update workflows and templates ([54e51eb][225])
- Backport new webpack config ([b268534][226])
- **integration-external.test.ts:** ensure proper cwd is used for executing externals ([31c1d5b][227])
- **package.json:** remove shelljs, update other deps ([11e192a][228])
- **package.json:** update dependencies ([9e1705b][229])
- Rename env-expect to expect-env ([035e98b][230])
- **setup.ts:** fix several lib-pkg tools ([44d1967][231])
- **test:** update with new lib-pkg tools ([004a657][232])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][233])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.18][234] (2021-02-11)

#### ⚙️ Build System

- **package.json:** update to proper forked dependencies ([042291d][235])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.17][236] (2021-02-10)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.16][237] (2021-02-10)

#### ⚙️ Build System

- **package.json:** update dependencies ([aeef7a9][238])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.15][239] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** simplify all examples with more modern syntax; remove @ergodark/types ([964bc47][240])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.14][241] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][242])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.13][243] (2021-02-05)

#### 🪄 Fixes

- **index.ts:** use NextApiHandler type (thanks [@janhesters][244]) ([473ff50][245])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][246])
- Next no longer misclassified as CJS ([9ebac01][247])

#### ⚙️ Build System

- **build-test-deploy.yml:** drop support for node 10 ([6adde15][248])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][249])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][250])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][251])
- Drop support for node 10 ([71e9103][252])
- Only silence sjx if not DEBUG ([f01ce40][253])
- **package.json:** improved build-dist ([a3526f2][254])
- **package.json:** nicer destructured vals in docs ([661e62d][255])
- **package.json:** remove extraneous module ([1f2ad6a][256])
- **package.json:** update dependencies ([c64f761][257])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][258])
- **post-release-check.yml:** more resilient post-release check ([856435f][259])
- Properly mocked unit tests for externals ([b3273df][260])
- **test:** improved testing infrastructure ([fffe02e][261])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.12][262] (2021-01-23)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.11][263] (2021-01-23)

#### ⚙️ Build System

- Backport/normalize across packages ([e589c1d][264])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.10][265] (2021-01-22)

#### ⚙️ Build System

- Update debug statement syntax ([52a2276][266])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.9][267] (2021-01-21)

#### ⚙️ Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation ([12e5bbe][268])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.8][269] (2021-01-13)

#### 🪄 Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][270])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.7][271] (2021-01-12)

#### ⚙️ Build System

- Rebuild lockfile ([94cfa38][272])
- Update babel-plugin-transform-mjs-imports ([62089c7][273])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.6][274] (2021-01-06)

#### ⚙️ Build System

- **package.json:** prune old deps ([2cf1d29][275])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.5][276] (2021-01-06)

#### ⚙️ Build System

- **.github/workflows/post-release-check.yml:** add new post-release-check ([a307efc][277])
- **.github:** add is-next-compat workflow ([1823c05][278])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.4][279] (2021-01-06)

#### ⚙️ Build System

- **readme.md:** add quick start example ([4e5e12c][280])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.3][281] (2021-01-05)

#### ⚙️ Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools ([a111c87][282])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.2][283] (2021-01-05)

#### ⚙️ Build System

- **readme.md:** cosmetic ([98b65c6][284])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.1][285] (2021-01-05)

#### ⚙️ Build System

- **package.json:** update dependencies, prune unused dependencies ([6ef6cbe][286])

<br />

## next-test-api-route-handler[@1.1.0][287] (2020-11-25)

### 🪄 Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][288])
- **externals:** updated remaining dependency references to peerDependency references ([ccf54fb][289])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.1.3][290] (2020-12-06)

#### ⚙️ Build System

- **package.json:** audit and update deps ([c82695a][291])
- **package.json:** manually bump version ([813b21a][292])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.1.2][293] (2020-11-26)

#### 🪄 Fixes

- **externals:** rewrite test workflow ([d604dfc][294])
- **readme:** update install language ([b68c721][295])

<br />

## next-test-api-route-handler\@1.0.0 (2020-10-07)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.10][296] (2020-10-24)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.9][297] (2020-10-23)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.8][298] (2020-10-20)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.7][299] (2020-10-19)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.6][300] (2020-10-17)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.5][301] (2020-10-13)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.4][302] (2020-10-12)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.3][303] (2020-10-12)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.2][304] (2020-10-07)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.1][305] (2020-10-07)

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.16...next-test-api-route-handler@5.0.0
[4]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2864e3a2c10a43eec470c473dcbdc6e9599cfee3
[5]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94415dccbeaff554c1ac8734c36e49b7de4ffa9e
[6]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f88a713945040eab7b72e59f4765987c41c9ae28
[7]: https://github.com/Xunnamius/next-test-api-route-handler/commit/10fac99869f61e5e6c801981496dc87a8c1fb847
[8]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d97e8ba446584652b13490265b04b6f71975e705
[9]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.3...next-test-api-route-handler@5.0.4
[10]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0d2b1f36ebdbc417ec840512974dded4fb07c03
[11]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b82bd640a2b91ad79087716b03ad377cbaf7e545
[12]: https://github.com/Xunnamius/next-test-api-route-handler/commit/feb10048cdad0754836923288b8210416047b0f5
[13]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a494d0b1bbe484502c8b92729409af9789750547
[14]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9776164ca33e33a443da9579ee302f274ae0c193
[15]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6999a862af4653c09fab584ef420e34feef58b3f
[16]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bdeeb98e77067f37ebbd8427b0f6b4b289c465f7
[17]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f2a0685d0278fbc9cde950a06986a05eb91e5fbc
[18]: https://github.com/Xunnamius/next-test-api-route-handler/commit/05891f5cda5b69f83edd9c9796a0a8911ee83608
[19]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.2...next-test-api-route-handler@5.0.3
[20]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6f32402ae9a0d03c8e55403a585a6146addb1740
[21]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.1...next-test-api-route-handler@5.0.2
[22]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3aea1e849f05716bca6af40a508a37e49d90fe9
[23]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1151
[24]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.0...next-test-api-route-handler@5.0.1
[25]: https://github.com/Xunnamius/next-test-api-route-handler/commit/290654cbfbb4d0fac988116e4c05eb8a72795a23
[26]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fc0de2198153ad3cb9d63eac7e515299fbc09c7b
[27]: https://github.com/Xunnamius/next-test-api-route-handler/commit/018776a6ded3eecda3120b1b44f1b0a0f1f38579
[28]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f017121b33bb480c6d6287f671c70c1a8342da2f
[29]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.2.0...next-test-api-route-handler@4.0.0
[30]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e2d8865b3b91f735e98d6c0a0c1e1c88d41e8802
[31]: https://github.com/Xunnamius/next-test-api-route-handler/issues/938
[32]: https://github.com/Xunnamius/next-test-api-route-handler/issues/773
[33]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5574831366a1678c12cb315bf4928dac99408b28
[34]: https://github.com/Xunnamius/next-test-api-route-handler/issues/946
[35]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db599aceb97e9b9d36a9461c34084346287b097d
[36]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fdfec8cbdc465df160a169bfdee972054d514eeb
[37]: https://github.com/Xunnamius/next-test-api-route-handler/commit/59f54a5aabc4356767e3ba2b4c0b551cd61e9891
[38]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5c5f9a48118896c43c03d19e3b12539c7a250714
[39]: https://github.com/Xunnamius/next-test-api-route-handler/issues/875
[40]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43680d926fe803817507b4b9394fa5810752cf1f
[41]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75d4e1f4d1bcc92d9680bb0d74cf26667012265a
[42]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f715331be1b66cb5807785d74aeb47b692492302
[43]: https://github.com/Xunnamius/next-test-api-route-handler/commit/85bb8fa5e60e2019e072367063a25b745d675ed9
[44]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0133e113145dc0c3836be3a73336ab2c024b66e7
[45]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62f1d0b2c5ca0146b903d233b73b659a54b7f16e
[46]: https://github.com/Xunnamius/next-test-api-route-handler/commit/913cbd0f0487c9c98146855413fb91e16bb4a7b0
[47]: https://github.com/Xunnamius/next-test-api-route-handler/commit/702cb444cc5e5c15b2d2b1000f27fca8368678e7
[48]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dc237233338af416993b0ec683a844abb6fab02b
[49]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d72ae876557d5f2e71da99a2d285c12bbe77319b
[50]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.15...next-test-api-route-handler@4.0.16
[51]: https://github.com/Xunnamius/next-test-api-route-handler/commit/410a62f9f1d977dd75e64e367e88fe89a0ecf15e
[52]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1167
[53]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bfcebd99bae8de80ddd84cbc9597033d5de6cb56
[54]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9c19de4e1c5c7c5272d63cc9930cbb017064e6de
[55]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c6496fa203955945da1d90d10a974339b52af781
[56]: https://github.com/Xunnamius/next-test-api-route-handler/commit/274e800ab7f3f9cd1bbd018b7ed96cfae7437088
[57]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5ee3defe4f13e26469acd1ea747c123def42ac2c
[58]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.14...next-test-api-route-handler@4.0.15
[59]: https://github.com/Xunnamius/next-test-api-route-handler/commit/69525da38f038cb19af2214586157c0901741903
[60]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1129
[61]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c11e5d3a700d773185f478a049f984220b7d0f4
[62]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.13...next-test-api-route-handler@4.0.14
[63]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cde549623f5cfde6bd806926500759b1749c4c06
[64]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1115
[65]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.12...next-test-api-route-handler@4.0.13
[66]: https://github.com/Xunnamius/next-test-api-route-handler/commit/edfe781e766cd174892cd394431eb307c134c3c5
[67]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.11...next-test-api-route-handler@4.0.12
[68]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a73f21ef6648ccc0f1b63bc76937623e35a3263d
[69]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.10...next-test-api-route-handler@4.0.11
[70]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a461e8108624c221c70702d1068092a640a5bae5
[71]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1076
[72]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.9...next-test-api-route-handler@4.0.10
[73]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c061b91493c31cd74d076e05a78a7dc594737ed3
[74]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.8...next-test-api-route-handler@4.0.9
[75]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99118a624cdebc2ed5783c184021e30f36aff6ad
[76]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1068
[77]: https://github.com/Xunnamius/next-test-api-route-handler/commit/88948b6f08ba0099dd22c1c3786c6e2c08ef9936
[78]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fa4b2afe931a4300ef7f8314cd264a9ee9c94bd5
[79]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b0701a2628bae2108ea1d9fed7e5e16f95eabeca
[80]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.7...next-test-api-route-handler@4.0.8
[81]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99671200663cfc4ccc1270f5b068f12abe16c03b
[82]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43eec5385cb48f619257324a2fe1b54d29748ff1
[83]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.6...next-test-api-route-handler@4.0.7
[84]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a48555f127b9420527a53d27ac8367246d4474ad
[85]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.5...next-test-api-route-handler@4.0.6
[86]: https://github.com/Xunnamius/next-test-api-route-handler/commit/347d7ef86ee6e4ca40c29793fbe112498a3d4b49
[87]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.4...next-test-api-route-handler@4.0.5
[88]: https://github.com/Xunnamius/next-test-api-route-handler/commit/633a0464435baec9e4ba6c91ed65909a9edaf298
[89]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1011
[90]: https://github.com/Xunnamius/next-test-api-route-handler/issues/983
[91]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.3...next-test-api-route-handler@4.0.4
[92]: https://github.com/Xunnamius/next-test-api-route-handler/commit/01b86b61a75ed315d57d1c087aa4a269a355d601
[93]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1000
[94]: https://github.com/Xunnamius/next-test-api-route-handler/commit/22bb71636c8a46e97d3a287d3534ae91ae4ad514
[95]: https://github.com/Xunnamius/next-test-api-route-handler/issues/993
[96]: https://github.com/Xunnamius/next-test-api-route-handler/commit/502e666158811993e875a64a8d4f924cdee83647
[97]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1006
[98]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1005
[99]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.2...next-test-api-route-handler@4.0.3
[100]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7774b30210969be5c5acaafe0330cc9c1541c40
[101]: https://github.com/Xunnamius/next-test-api-route-handler/issues/962
[102]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d03ca21d9634a1c7a56bbe110b32adb56e6c1068
[103]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.1...next-test-api-route-handler@4.0.2
[104]: https://github.com/Xunnamius/next-test-api-route-handler/commit/90ff6656c8583b1766b6e6aa041c01e6a0bdca62
[105]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8400a194cf3a824209a8175f48bdd4f0e4c43f8c
[106]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.0...next-test-api-route-handler@4.0.1
[107]: https://github.com/Xunnamius/next-test-api-route-handler/commit/09389fe314bfe1048493b979bf79c65a6cdc27e5
[108]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.10...next-test-api-route-handler@3.2.0
[109]: https://github.com/Xunnamius/next-test-api-route-handler/commit/93b8a3c92eb14a5b2d1006c315e26a3c3547a1c3
[110]: https://github.com/Xunnamius/next-test-api-route-handler/issues/916
[111]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.3...next-test-api-route-handler@3.1.0
[112]: https://github.com/Xunnamius/next-test-api-route-handler/commit/21b4b928a40b685a99df34ad20845c97615ee1c8
[113]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a2f0b28b07f8a176a5333551b5788033f90274a
[114]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0ee4ce58b1c7a8b4ea2096c01142097f427b2a00
[115]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.9...next-test-api-route-handler@3.1.10
[116]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ca1da40c8f14b9c4a39f198787f526759cd7fa8f
[117]: https://github.com/Xunnamius/next-test-api-route-handler/issues/887
[118]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a9d136b2ada5dcac26a8509fd4590a2dec805a56
[119]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db0223ea0c74edab17489595c1c858eb035dd418
[120]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e457064ddbc7e3f7b1d96c7f27b5b74479303f2f
[121]: https://github.com/Xunnamius/next-test-api-route-handler/issues/908
[122]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.7...next-test-api-route-handler@3.1.8
[123]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a4ae05a6d163902daff9021b375db5f362149d7
[124]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.6...next-test-api-route-handler@3.1.7
[125]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4af52f43dcba1f6f57887fb977b1430f8009d872
[126]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.5...next-test-api-route-handler@3.1.6
[127]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e94142b83d4d6bed7812bca2bd4226a6b67c49a
[128]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.4...next-test-api-route-handler@3.1.5
[129]: https://github.com/Xunnamius/next-test-api-route-handler/commit/405f84dabe68b72e11919066cc53dbc69ad4807d
[130]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.3...next-test-api-route-handler@3.1.4
[131]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b05e112c11ead6b03c33a1a0bf1dc4fca4d29db5
[132]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.2...next-test-api-route-handler@3.1.3
[133]: https://github.com/Xunnamius/next-test-api-route-handler/commit/36a2c44e4b3f6f4f6d4ae9f8a566a42609ee362c
[134]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.1...next-test-api-route-handler@3.1.2
[135]: https://github.com/Xunnamius/next-test-api-route-handler/commit/065b4455016812575e1714cc680e57184b49cf5d
[136]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.0...next-test-api-route-handler@3.1.1
[137]: https://github.com/Xunnamius/next-test-api-route-handler/commit/484d7023539d95b8930d1665b4b613042b21fe9f
[138]: https://github.com/Xunnamius/next-test-api-route-handler/issues/487
[139]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.4...next-test-api-route-handler@3.0.0
[140]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3c60cbd506eb22a4bb23554b06668076e687ad9
[141]: https://github.com/Xunnamius/next-test-api-route-handler/commit/68d30dac2210e4f976afbf5c59378d6b314d4ec3
[142]: https://github.com/Xunnamius/next-test-api-route-handler/commit/15c899a98423c612571886115308e68e20633a1b
[143]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a1a2ee806f4cfd5d199d54dbd82f9f945da1694
[144]: https://github.com/Xunnamius/next-test-api-route-handler/commit/73f44b78c2ee92b443adf99e248c03b985b80891
[145]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.2...next-test-api-route-handler@3.0.3
[146]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1e8cd8573cdcfa3489526244c40f373a71d92b40
[147]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.1...next-test-api-route-handler@3.0.2
[148]: https://github.com/Xunnamius/next-test-api-route-handler/commit/84f74f55027cd4e67b7e7929f668d4de387dc3c3
[149]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.0...next-test-api-route-handler@3.0.1
[150]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a925da287a02b6c36b588b6804e7b0b628364b25
[151]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.2.1...next-test-api-route-handler@2.3.0
[152]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd3cd95adb536b05a3cfe8bd0b12329c9acad166
[153]: https://github.com/Xunnamius/next-test-api-route-handler/issues/373
[154]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8746e5fb6b337131303ad0c011c864d5152a864d
[155]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ae778d18f1c01e36070f0612067ec9f00f14a665
[156]: https://github.com/Xunnamius/next-test-api-route-handler/issues/378
[157]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c216caa659a0fcf807ff6b1a0c11c2b331e27d3c
[158]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5fbb6d20cab097250cb8c62d0c5edb6fe80f0bfc
[159]: https://github.com/Xunnamius/next-test-api-route-handler/commit/346e8de1390ba46e9dc8faccc0977c5f50a9dc32
[160]: https://github.com/Xunnamius/next-test-api-route-handler/commit/812e6f262726e328a57cdb0833fb8bfbbcce6708
[161]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.3...next-test-api-route-handler@2.3.4
[162]: https://github.com/Xunnamius/next-test-api-route-handler/commit/854704ba9a7f374753e1a51f4fe00db761d7718f
[163]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9302bcc882e9cd4080526f5192186b5259e08726
[164]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.2...next-test-api-route-handler@2.3.3
[165]: https://github.com/Xunnamius/next-test-api-route-handler/commit/597c2497a137c86696aba9b750b60f43d728495f
[166]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.1...next-test-api-route-handler@2.3.2
[167]: https://github.com/Xunnamius/next-test-api-route-handler/commit/32eafabd592856a7ef286d7d0157e38a8275695d
[168]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd98aab7eea7bdd4b988402b57ce5e93572a7850
[169]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.0...next-test-api-route-handler@2.3.1
[170]: https://github.com/Xunnamius/next-test-api-route-handler/commit/91f08d426081afc1009e50d7b9ee6a0a2259268b
[171]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.3...next-test-api-route-handler@2.2.0
[172]: https://github.com/Xunnamius/next-test-api-route-handler/commit/419d5fe805928605b85fe0e5c64c80eb5a1d798d
[173]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.2.0...next-test-api-route-handler@2.2.1
[174]: https://github.com/Xunnamius/next-test-api-route-handler/commit/de9ee177491855eb0ac095f9a1a3e5cfad820420
[175]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.2...next-test-api-route-handler@2.1.0
[176]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c51cf0222e17066c03cd80e1c76c5e9f49cacc2e
[177]: https://github.com/Xunnamius/next-test-api-route-handler/issues/295
[178]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.2...next-test-api-route-handler@2.1.3
[179]: https://github.com/Xunnamius/next-test-api-route-handler/commit/7916f0026b59e6325b59395f61b142056c6c8220
[180]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.1...next-test-api-route-handler@2.1.2
[181]: https://github.com/Xunnamius/next-test-api-route-handler/commit/74241eeee173a6cf8f987608946c3d8691a67c27
[182]: https://github.com/Xunnamius/next-test-api-route-handler/commit/33b6a34a126909a354a7c3f5d523b0fa47acb960
[183]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c3425caf7d80793a2c1e88ff8fbd29ada8adf2d
[184]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.0...next-test-api-route-handler@2.1.1
[185]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd787ca116c3a84f9393f22bf7e898db0a22f5e1
[186]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.24...next-test-api-route-handler@2.0.0
[187]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ee31fa8cefdc2b8b8197d3889fb8aac27467b374
[188]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2f1125cfb481e94af4248cf5b5dfce729cc4d662
[189]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75832099f4c4d0e329aca469ac16c8a25100c26d
[190]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc5e72d9d40f1991315ac0657a4b212331dc065f
[191]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc7eb3db18aa70345a1c11d96436b374a15c3b7f
[192]: https://github.com/Xunnamius/next-test-api-route-handler/commit/20ca255e01d0c2e7824707e19f41ca5a8de0140e
[193]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.1...next-test-api-route-handler@2.0.2
[194]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd53fefc6d5c2ff67ed2669b18e28b7ef7005c12
[195]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.0...next-test-api-route-handler@2.0.1
[196]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ef32668428df303c4e536aae5793ed14eee0ade5
[197]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.3...next-test-api-route-handler@1.2.0
[198]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[199]: https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[200]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[201]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.23...next-test-api-route-handler@1.2.24
[202]: https://github.com/Xunnamius/next-test-api-route-handler/commit/af177c5035c22ab923dd62f6dc82702373f740d4
[203]: https://github.com/Xunnamius/next-test-api-route-handler/commit/364549e2845965954af62fdfa6c1dfa0d6f91f2f
[204]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4db5d04d6a7117fe8e2113d2fafc6150a81f611c
[205]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99ad1276e7e69218719ee2b27173e4ffcb7337f6
[206]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6d523027b8d650ae0a2d121c349e6a4c48af6792
[207]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f7fad4d512f1839d96c6264f2d4abb1c5ed11e7
[208]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d328a86317c60206bda565ba2e315113dadd0c9b
[209]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e7173fca4cbe778419eeff92ddbf7c03c2b00d5
[210]: https://github.com/Xunnamius/next-test-api-route-handler/commit/23cb7804d5f0e775b75eaefb4588beb179dcdcdf
[211]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f25e5fb8b2797621d316e18b01ee503fb4d1263
[212]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.22...next-test-api-route-handler@1.2.23
[213]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0040582d2f89e9a14c2335dc85cd5f9201bff644
[214]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.21...next-test-api-route-handler@1.2.22
[215]: https://github.com/Xunnamius/next-test-api-route-handler/commit/df9ede3ddde3a2df6a42224ab3302e599bd61516
[216]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.20...next-test-api-route-handler@1.2.21
[217]: https://github.com/Xunnamius/next-test-api-route-handler/commit/29aa25a9e2572be5b418fbee9d2d8aba2056583e
[218]: https://github.com/Xunnamius/next-test-api-route-handler/commit/806575792fe9e1522bd6bce0eb10f1bd3407da64
[219]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd3e7faadf148b23994f443a2247cc1316639e7d
[220]: https://github.com/Xunnamius/next-test-api-route-handler/issues/126
[221]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.19...next-test-api-route-handler@1.2.20
[222]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
[223]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.18...next-test-api-route-handler@1.2.19
[224]: https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[225]: https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[226]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[227]: https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[228]: https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[229]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[230]: https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[231]: https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[232]: https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[233]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[234]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.17...next-test-api-route-handler@1.2.18
[235]: https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[236]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.16...next-test-api-route-handler@1.2.17
[237]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.15...next-test-api-route-handler@1.2.16
[238]: https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[239]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.14...next-test-api-route-handler@1.2.15
[240]: https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[241]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.13...next-test-api-route-handler@1.2.14
[242]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[243]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.12...next-test-api-route-handler@1.2.13
[244]: https://github.com/janhesters
[245]: https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[246]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[247]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[248]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[249]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[250]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[251]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[252]: https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[253]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[254]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[255]: https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[256]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[257]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[258]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[259]: https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[260]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[261]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[262]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.11...next-test-api-route-handler@1.2.12
[263]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.10...next-test-api-route-handler@1.2.11
[264]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[265]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.9...next-test-api-route-handler@1.2.10
[266]: https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[267]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.8...next-test-api-route-handler@1.2.9
[268]: https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[269]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.7...next-test-api-route-handler@1.2.8
[270]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[271]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.6...next-test-api-route-handler@1.2.7
[272]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[273]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[274]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.5...next-test-api-route-handler@1.2.6
[275]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[276]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.4...next-test-api-route-handler@1.2.5
[277]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[278]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[279]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.3...next-test-api-route-handler@1.2.4
[280]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[281]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.2...next-test-api-route-handler@1.2.3
[282]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[283]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.1...next-test-api-route-handler@1.2.2
[284]: https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[285]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.0...next-test-api-route-handler@1.2.1
[286]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[287]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.10...next-test-api-route-handler@1.1.0
[288]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[289]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[290]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.2...next-test-api-route-handler@1.1.3
[291]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[292]: https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[293]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.1...next-test-api-route-handler@1.1.2
[294]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[295]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[296]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.9...next-test-api-route-handler@1.0.10
[297]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.8...next-test-api-route-handler@1.0.9
[298]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.7...next-test-api-route-handler@1.0.8
[299]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.6...next-test-api-route-handler@1.0.7
[300]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.5...next-test-api-route-handler@1.0.6
[301]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.4...next-test-api-route-handler@1.0.5
[302]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.3...next-test-api-route-handler@1.0.4
[303]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.2...next-test-api-route-handler@1.0.3
[304]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.1...next-test-api-route-handler@1.0.2
[305]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.0...next-test-api-route-handler@1.0.1
