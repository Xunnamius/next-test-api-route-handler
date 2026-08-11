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

### 🏗️ Patch next-test-api-route-handler[@5.0.6][9] (2026-08-11)

#### 🪄 Fixes

- Update to use latest dependencies exports ([aa99a54][10])
- Update userland types for latest next.js version ([d596cdb][11])

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.18 to 0.11.0 ([1677e73][12])
- **deps:** bump cookie from 1.1.1 to 2.0.1 ([d4b9d43][13])
- **deps:** bump core-js from 3.49.0 to 3.50.0 ([59b13d2][14])
  <br />

### 🏗️ Patch next-test-api-route-handler[@5.0.5][15] (2026-05-03)

#### ⚙️ Build System

- **deps:** bump handlebars from 4.7.8 to 4.7.9 ([d01e616][16])
- **deps:** bump mongodb from 7.1.0 to 7.1.1 ([a5426bd][17])
- **deps:** bump picomatch ([9edbe1e][18])
- Remove unnecessary core-js dependency (javascript is growing!) ([5d434cf][19])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.4][20] (2026-03-22)

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.12 to 0.10.18 ([e0d2b1f][21])
- **deps:** bump cookie from 1.0.2 to 1.1.1 ([b82bd64][22])
- **deps:** bump core-js from 3.45.1 to 3.49.0 ([feb1004][23])
- **deps:** bump minimatch ([9776164][24])
- **deps:** bump next from 15.5.4 to 16.2.1 ([bdeeb98][25])
- **deps:** bump tar and npm ([05891f5][26])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.3][27] (2025-09-04)

#### ⚡️ Optimizations

- Use Node's ReadableStream.from instead of ponyfill ([6f32402][28])

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.2][29] (2025-08-22)

#### 🪄 Fixes

- **src:** polyfill `react.createContext` to support "react-server" condition ([d3aea1e][30]) <sup>see [#1151][31]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@5.0.1][32] (2025-08-21)

#### 🪄 Fixes

- **src:** address minor incompatibility with next\@15.5 ([290654c][33])

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.10 to 0.10.12 ([fc0de21][34])
- **deps:** bump core-js from 3.44.0 to 3.45.0 ([018776a][35])
- **deps:** bump core-js from 3.45.0 to 3.45.1 ([f017121][36])

<br />

## next-test-api-route-handler[@4.0.0][37] (2024-01-15)

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

- Land initial App Router support ([e2d8865][38]) <sup>see [#938][39], [#773][40]</sup>
- Retire use of node-fetch ([5574831][41]) <sup>see [#946][42]</sup>
- **src:** warn when invoking testApiHandler with invalid property combos ([db599ac][43])

### 🪄 Fixes

- Loosen type checking for `NextApiHandler`s ([fdfec8c][44])
- **src:** deeply summon res.json() return value into our realm ([59f54a5][45])
- **src:** ensure all results of calling ::json on Requests and Responses are summoned into our realm ([5c5f9a4][46])
- **src:** ensure AsyncLocalStorage is available globally (might fix [#875][47]) ([43680d9][48])
- **src:** ensure global fetch is restored after testApiHandler terminates ([75d4e1f][49])
- **src:** forcefully coerce request.body into a ReadableStream ([f715331][50])
- **src:** hoist globalThis.AsyncLocalStorage initialization to be as soon as possible ([85bb8fa][51])
- **src:** normalize pagesHandler into NextApiHandler (esm<->cjs interop) ([0133e11][52])
- Use more accurate return type for app router patchers ([62f1d0b][53])

### ⚙️ Build System

- **husky:** ensure hooks do not run on rebase ([913cbd0][54])
- **package:** bump minimum supported node versions to maintained ([702cb44][55])
- **package:** remove outdated properties ([dc23723][56])

### 🧙🏿 Refactored

- **src:** ensure request url is consistent across router types ([d72ae87][57])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.16][58] (2025-03-27)

#### 🪄 Fixes

- **src:** opportunistically polyfill missing react exports ([410a62f][59]) <sup>see [#1167][60]</sup>

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.10.1 to 0.10.3 ([bfcebd9][61])
- **deps:** bump @whatwg-node/server from 0.9.70 to 0.9.71 ([9c19de4][62])
- **deps:** bump @whatwg-node/server from 0.9.71 to 0.10.1 ([c6496fa][63])
- **deps:** bump core-js from 3.40.0 to 3.41.0 ([274e800][64])
- **test:** add latest `next@12`, `next@13`, and `next@14` versions to test matrix ([5ee3def][65])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.15][66] (2025-02-27)

#### 🪄 Fixes

- **src:** address incompatibility with next\@15.2 ([69525da][67]) <sup>see [#1129][68]</sup>

#### ⚙️ Build System

- **deps:** bump @whatwg-node/server from 0.9.66 to 0.9.70 ([1c11e5d][69])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.14][70] (2024-10-22)

#### 🪄 Fixes

- **package:** revert breaking change in engines.node ([cde5496][71]) <sup>see [#1115][72]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.13][73] (2024-10-22)

#### 🪄 Fixes

- **src:** add support for next\@15.0.0 release ([edfe781][74])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.12][75] (2024-10-17)

#### ⚙️ Build System

- Prepare compatibility layer for next\@15 ([a73f21e][76])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.11][77] (2024-09-18)

#### 🪄 Fixes

- **src:** stop Next.js from attempting to statically generate routes under test ([a461e81][78]) <sup>see [#1076][79]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.10][80] (2024-09-18)

#### 🪄 Fixes

- **src:** pass empty `apiContext` to work around `multiZoneDraftMode` check ([c061b91][81])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.9][82] (2024-09-13)

#### 🪄 Fixes

- **src:** prevent ipv6-related failures due to assuming "localhost" resolvability ([99118a6][83]) <sup>see [#1068][84]</sup>

#### ⚙️ Build System

- **husky:** update husky scripts ([88948b6][85])
- **package:** downgrade @octokit/rest to 20 ([fa4b2af][86])
- Remove spellchecker dependency ([b0701a2][87])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.8][88] (2024-06-10)

#### ⚙️ Build System

- Revert conventional-changelog-cli update ([9967120][89])
- Update documentation generator ([43eec53][90])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.7][91] (2024-04-17)

#### ⚙️ Build System

- **readme:** add section on jsdom support ([a48555f][92])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.6][93] (2024-04-12)

#### 🪄 Fixes

- **src:** extend backwards compatibility to msw\@1; remove optional msw peer dependency ([347d7ef][94])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.5][95] (2024-03-03)

#### 🪄 Fixes

- **src:** replace request spread with explicit options ([633a046][96]) <sup>see [#1011][97], [#983][98]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.4][99] (2024-03-02)

#### 🪄 Fixes

- **src:** allow relative url strings passed via url shorthand for App Router ([01b86b6][100]) <sup>see [#1000][101]</sup>
- **src:** prevent recursive redirection with undici/whatwg fetch ([22bb716][102]) <sup>see [#993][103]</sup>
- **src:** replace `AppRouteUserlandModule` with looser type ([502e666][104]) <sup>see [#1006][105], [#1005][106]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.3][107] (2024-01-18)

#### 🪄 Fixes

- **src:** ensure ephemeral test servers only listen on localhost ([d7774b3][108])
- **src:** forcefully close all connections after closing test server (fixes [#962][109]) ([d03ca21][110])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.2][111] (2024-01-16)

#### 🪄 Fixes

- **src:** add missing metadata not revealed by type information ([90ff665][112])
- **src:** force normalization of request URLs passed to app handler ([8400a19][113])

<br />

### 🏗️ Patch next-test-api-route-handler[@4.0.1][114] (2024-01-16)

#### 🪄 Fixes

- **src:** pass Next.js more accurate app route metadata ([09389fe][115])

<br />

## next-test-api-route-handler[@3.2.0][116] (2024-01-04)

### ✨ Features

- Update headers for msw\@2 compatibility ([93b8a3c][117]) <sup>see [#916][118]</sup>

<br />

## next-test-api-route-handler[@3.1.0][119] (2022-02-11)

### ✨ Features

- Automatically add the x-msw-bypass ([21b4b92][120])

### ⚙️ Build System

- **deps:** bump next from 12.0.8 to 12.0.10 ([2a2f0b2][121])
- **readme:** explain MSW compat default behavior ([0ee4ce5][122])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.10][123] (2023-11-04)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([ca1da40][124]) <sup>see [#887][125]</sup>

#### ⚙️ Build System

- Add core-js polyfills and have mercy on aging node versions ([a9d136b][126])
- Modernize tooling ([db0223e][127])
- Upgrade typescript-babel toolchain to nodenext ([e457064][128]) <sup>see [#908][129]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.8][130] (2023-01-03)

#### ⚙️ Build System

- **readme:** update maintainence badge and audit dependencies ([2a4ae05][131])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.7][132] (2022-07-27)

#### ⚙️ Build System

- **package:** update dependencies ([4af52f4][133])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.6][134] (2022-06-30)

#### 🪄 Fixes

- Ensure non-object "headers" fetch argument is not mangled when mixing in default headers ([6e94142][135])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.5][136] (2022-06-26)

#### 🪄 Fixes

- Fix MSW bypass override instructions and unit test ([405f84d][137])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.4][138] (2022-06-26)

#### ⚙️ Build System

- **readme:** update MSW bypass override instructions under "test" entry in README ([b05e112][139])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.3][140] (2022-05-21)

#### ⚙️ Build System

- **package:** update dev-dependencies ([36a2c44][141])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.2][142] (2022-03-23)

#### ⚙️ Build System

- **package:** update dependencies ([065b445][143])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.1.1][144] (2022-02-18)

#### 🪄 Fixes

- Ensure compat with next\@12.1.0 ([484d702][145]) <sup>see [#487][146]</sup>

<br />

## next-test-api-route-handler[@3.0.0][147] (2021-12-17)

### 💥 BREAKING CHANGES 💥

- `fetch` now comes from node-fetch directly instead of isomorphic-unfetch

- Exported `TestParameters` type has been renamed to `NtarhParameters`

### ✨ Features

- **package:** remove debug dependency (moved into dev-deps) ([d3c60cb][148])
- **src:** improved error handling; add support for new `rejectOnHandlerError` option ([68d30da][149])
- **src:** move test-listen functionality into NTARH; remove dependency ([15c899a][150])
- **src:** replace isomorphic-unfetch with node-fetch ([5a1a2ee][151])

### 🧙🏿 Refactored

- **src:** update types ([73f44b7][152])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.3][153] (2022-02-05)

#### ⚙️ Build System

- **package:** bump node-fetch to 2.6.7 ([1e8cd85][154])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.2][155] (2022-01-03)

#### ⚙️ Build System

- **readme:** update shields.io maintenance badge to 2022 ([84f74f5][156])

<br />

### 🏗️ Patch next-test-api-route-handler[@3.0.1][157] (2021-12-27)

#### ⚙️ Build System

- **package:** retire use of sort-package-json fork ([a925da2][158])

<br />

## next-test-api-route-handler[@2.3.0][159] (2021-11-05)

### ✨ Features

- Automatically parse "set-cookie" headers; available in response.cookies ([cd3cd95][160]) <sup>see [#373][161]</sup>

### 🪄 Fixes

- **src:** ensure exceptions do not prevent Jest from exiting ([8746e5f][162])
- **src:** ensure webpack does not break dynamic require on compile ([ae778d1][163]) <sup>see [#378][164]</sup>
- Vastly improved error handling for those using node@<15 and/or npm@<7 ([c216caa][165])

### ⚙️ Build System

- Add back nullish coalescing operator babel transform for older node versions ([5fbb6d2][166])
- **package:** backport npm script fixes ([346e8de][167])
- **src:** fix TS bundle errors on node\@12 and node\@14 ([812e6f2][168])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.4][169] (2021-11-16)

#### 🪄 Fixes

- **src:** lazy-load contents of the "cookies" field ([854704b][170])

#### ⚙️ Build System

- Re-enable treeshaking in webpack ([9302bcc][171])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.3][172] (2021-11-10)

#### ⚙️ Build System

- Differentiate between esm and bundler distributables ([597c249][173])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.2][174] (2021-11-07)

#### 🪄 Fixes

- **src:** es module compatibility; no longer attempts to require() in mjs files ([32eafab][175])
- **src:** report parsed es module import failures properly ([cd98aab][176])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.3.1][177] (2021-11-06)

#### ⚙️ Build System

- Re-enable ESM (for bundlers) integration tests ([91f08d4][178])

<br />

## next-test-api-route-handler[@2.2.0][179] (2021-08-22)

### ✨ Features

- **types:** expanded typescript support; `testApiHandler` weakly typed by default ([419d5fe][180])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.2.1][181] (2021-08-29)

#### ⚙️ Build System

- **license:** switch to MIT license ([de9ee17][182])

<br />

## next-test-api-route-handler[@2.1.0][183] (2021-08-13)

### ✨ Features

- **src:** enable backwards compatibility all the way back to next\@9 ([c51cf02][184]) <sup>see [#295][185]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.3][186] (2021-08-22)

#### 🪄 Fixes

- **src:** ensure dependency resolution failure does not cause test runner to hang ([7916f00][187])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.2][188] (2021-08-14)

#### 🪄 Fixes

- **src:** memoize resolver import ([74241ee][189])

#### ⚙️ Build System

- **package:** improve build-docs npm script ([33b6a34][190])
- **src:** add descriptions to TypeScript types ([1c3425c][191])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.1.1][192] (2021-08-13)

#### 🪄 Fixes

- **readme:** update install instructions; fix apollo example ([fd787ca][193])

<br />

## next-test-api-route-handler[@2.0.0][194] (2021-06-27)

### 💥 BREAKING CHANGES 💥

- This version (and the version before this version) no longer works with next@<10

### ✨ Features

- Add `url` and `paramsPatcher` ([ee31fa8][195])

### ⚙️ Build System

- **package.json:** update dependencies ([2f1125c][196])
- **package.json:** update dependencies ([7583209][197])
- **package.json:** update next peer dependency to >=10.0.x ([bc5e72d][198])
- Switch to @xunnamius/conventional-changelog-projector shared config ([bc7eb3d][199])
- Update dependencies ([20ca255][200])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.0.2][201] (2021-07-29)

#### ⚙️ Build System

- **external-scripts:** use latest mongodb native driver ([fd53fef][202])

<br />

### 🏗️ Patch next-test-api-route-handler[@2.0.1][203] (2021-06-27)

#### ⚙️ Build System

- Update dependencies and publish fixed apollo example ([ef32668][204])

<br />

## next-test-api-route-handler[@1.2.0][205] (2021-01-05)

### ✨ Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD ([b9d2bf0][206])

### ⚙️ Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][207])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly ([e0e1fd9][208])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.24][209] (2021-05-08)

#### 🪄 Fixes

- **index.ts:** next 10.2.0 compat ([af177c5][210])

#### ⚙️ Build System

- **.github/workflows:** disable old pipeline; begin transition to new pipeline ([364549e][211])
- **.github/workflows:** overhaul pipeline workflows ([4db5d04][212])
- **.github:** split BTD workflow into two separate workflows (security) ([99ad127][213])
- **contributing.md:** split pipeline architecture information off into workflow README.md ([6d52302][214])
- **package.json:** ensure hidden dirs' markdown files are seen by remark (linted and formatted) ([1f7fad4][215])
- **package.json:** update dependencies ([d328a86][216])
- **readme.md:** fix broken links ([6e7173f][217])
- **readme.md:** improvements ([23cb780][218])
- **readme.md:** include architecture description as workflow README.md ([1f25e5f][219])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.23][220] (2021-03-14)

#### ⚙️ Build System

- Better documentation ([0040582][221])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.22][222] (2021-03-12)

#### ⚙️ Build System

- Update dependencies and fix find-package-json usage ([df9ede3][223])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.21][224] (2021-03-12)

#### ⚙️ Build System

- **build-test-deploy.yml:** actions version updates ([29aa25a][225])
- **build-test-deploy.yml:** rollback some pipeline version updates ([8065757][226])
- **package.json:** fix typedoc-markdown-plugin patch ([dd3e7fa][227]) <sup>see [#126][228]</sup>

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.20][229] (2021-02-22)

#### ⚙️ Build System

- **package-lock.json:** update deps ([5a2d98f][230])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.19][231] (2021-02-22)

#### 🪄 Fixes

- **unit-index.test.ts:** 100% test coverage ([72189e8][232])

#### ⚙️ Build System

- **.github:** update workflows and templates ([54e51eb][233])
- Backport new webpack config ([b268534][234])
- **integration-external.test.ts:** ensure proper cwd is used for executing externals ([31c1d5b][235])
- **package.json:** remove shelljs, update other deps ([11e192a][236])
- **package.json:** update dependencies ([9e1705b][237])
- Rename env-expect to expect-env ([035e98b][238])
- **setup.ts:** fix several lib-pkg tools ([44d1967][239])
- **test:** update with new lib-pkg tools ([004a657][240])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][241])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.18][242] (2021-02-11)

#### ⚙️ Build System

- **package.json:** update to proper forked dependencies ([042291d][243])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.17][244] (2021-02-10)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.16][245] (2021-02-10)

#### ⚙️ Build System

- **package.json:** update dependencies ([aeef7a9][246])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.15][247] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** simplify all examples with more modern syntax; remove @ergodark/types ([964bc47][248])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.14][249] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][250])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.13][251] (2021-02-05)

#### 🪄 Fixes

- **index.ts:** use NextApiHandler type (thanks [@janhesters][252]) ([473ff50][253])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][254])
- Next no longer misclassified as CJS ([9ebac01][255])

#### ⚙️ Build System

- **build-test-deploy.yml:** drop support for node 10 ([6adde15][256])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][257])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][258])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][259])
- Drop support for node 10 ([71e9103][260])
- Only silence sjx if not DEBUG ([f01ce40][261])
- **package.json:** improved build-dist ([a3526f2][262])
- **package.json:** nicer destructured vals in docs ([661e62d][263])
- **package.json:** remove extraneous module ([1f2ad6a][264])
- **package.json:** update dependencies ([c64f761][265])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][266])
- **post-release-check.yml:** more resilient post-release check ([856435f][267])
- Properly mocked unit tests for externals ([b3273df][268])
- **test:** improved testing infrastructure ([fffe02e][269])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.12][270] (2021-01-23)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.11][271] (2021-01-23)

#### ⚙️ Build System

- Backport/normalize across packages ([e589c1d][272])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.10][273] (2021-01-22)

#### ⚙️ Build System

- Update debug statement syntax ([52a2276][274])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.9][275] (2021-01-21)

#### ⚙️ Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation ([12e5bbe][276])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.8][277] (2021-01-13)

#### 🪄 Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][278])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.7][279] (2021-01-12)

#### ⚙️ Build System

- Rebuild lockfile ([94cfa38][280])
- Update babel-plugin-transform-mjs-imports ([62089c7][281])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.6][282] (2021-01-06)

#### ⚙️ Build System

- **package.json:** prune old deps ([2cf1d29][283])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.5][284] (2021-01-06)

#### ⚙️ Build System

- **.github/workflows/post-release-check.yml:** add new post-release-check ([a307efc][285])
- **.github:** add is-next-compat workflow ([1823c05][286])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.4][287] (2021-01-06)

#### ⚙️ Build System

- **readme.md:** add quick start example ([4e5e12c][288])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.3][289] (2021-01-05)

#### ⚙️ Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools ([a111c87][290])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.2][291] (2021-01-05)

#### ⚙️ Build System

- **readme.md:** cosmetic ([98b65c6][292])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.2.1][293] (2021-01-05)

#### ⚙️ Build System

- **package.json:** update dependencies, prune unused dependencies ([6ef6cbe][294])

<br />

## next-test-api-route-handler[@1.1.0][295] (2020-11-25)

### 🪄 Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][296])
- **externals:** updated remaining dependency references to peerDependency references ([ccf54fb][297])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.1.3][298] (2020-12-06)

#### ⚙️ Build System

- **package.json:** audit and update deps ([c82695a][299])
- **package.json:** manually bump version ([813b21a][300])

<br />

### 🏗️ Patch next-test-api-route-handler[@1.1.2][301] (2020-11-26)

#### 🪄 Fixes

- **externals:** rewrite test workflow ([d604dfc][302])
- **readme:** update install language ([b68c721][303])

<br />

## next-test-api-route-handler\@1.0.0 (2020-10-07)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.10][304] (2020-10-24)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.9][305] (2020-10-23)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.8][306] (2020-10-20)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.7][307] (2020-10-19)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.6][308] (2020-10-17)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.5][309] (2020-10-13)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.4][310] (2020-10-12)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.3][311] (2020-10-12)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.2][312] (2020-10-07)

<br />

### 🏗️ Patch next-test-api-route-handler[@1.0.1][313] (2020-10-07)

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.16...next-test-api-route-handler@5.0.0
[4]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2864e3a2c10a43eec470c473dcbdc6e9599cfee3
[5]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94415dccbeaff554c1ac8734c36e49b7de4ffa9e
[6]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f88a713945040eab7b72e59f4765987c41c9ae28
[7]: https://github.com/Xunnamius/next-test-api-route-handler/commit/10fac99869f61e5e6c801981496dc87a8c1fb847
[8]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d97e8ba446584652b13490265b04b6f71975e705
[9]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.5...next-test-api-route-handler@5.0.6
[10]: https://github.com/Xunnamius/next-test-api-route-handler/commit/aa99a54cf92b47986fbde6d5cdb2c3df204f3a75
[11]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d596cdbb34e8df5faabc2ed85effb8ba02d86fb1
[12]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1677e73efd1dd015e6cf237a6eab6f727b13f22f
[13]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d4b9d437fe8aa95e73d6acbcf27deba8a5e26cae
[14]: https://github.com/Xunnamius/next-test-api-route-handler/commit/59b13d2deef95929f2dc9b3c70775f3b5d3e1036
[15]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.4...next-test-api-route-handler@5.0.5
[16]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d01e6166d3b7d6de085f9956499118931f01365a
[17]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a5426bd85f636c4b705354ce8543dec0f644b6af
[18]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9edbe1e578fd8a488b17ca7c4436bf7be193927e
[19]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5d434cf87052de7aa75040c2b2f60b27369fecfb
[20]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.3...next-test-api-route-handler@5.0.4
[21]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0d2b1f36ebdbc417ec840512974dded4fb07c03
[22]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b82bd640a2b91ad79087716b03ad377cbaf7e545
[23]: https://github.com/Xunnamius/next-test-api-route-handler/commit/feb10048cdad0754836923288b8210416047b0f5
[24]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9776164ca33e33a443da9579ee302f274ae0c193
[25]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bdeeb98e77067f37ebbd8427b0f6b4b289c465f7
[26]: https://github.com/Xunnamius/next-test-api-route-handler/commit/05891f5cda5b69f83edd9c9796a0a8911ee83608
[27]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.2...next-test-api-route-handler@5.0.3
[28]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6f32402ae9a0d03c8e55403a585a6146addb1740
[29]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.1...next-test-api-route-handler@5.0.2
[30]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3aea1e849f05716bca6af40a508a37e49d90fe9
[31]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1151
[32]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@5.0.0...next-test-api-route-handler@5.0.1
[33]: https://github.com/Xunnamius/next-test-api-route-handler/commit/290654cbfbb4d0fac988116e4c05eb8a72795a23
[34]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fc0de2198153ad3cb9d63eac7e515299fbc09c7b
[35]: https://github.com/Xunnamius/next-test-api-route-handler/commit/018776a6ded3eecda3120b1b44f1b0a0f1f38579
[36]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f017121b33bb480c6d6287f671c70c1a8342da2f
[37]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.2.0...next-test-api-route-handler@4.0.0
[38]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e2d8865b3b91f735e98d6c0a0c1e1c88d41e8802
[39]: https://github.com/Xunnamius/next-test-api-route-handler/issues/938
[40]: https://github.com/Xunnamius/next-test-api-route-handler/issues/773
[41]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5574831366a1678c12cb315bf4928dac99408b28
[42]: https://github.com/Xunnamius/next-test-api-route-handler/issues/946
[43]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db599aceb97e9b9d36a9461c34084346287b097d
[44]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fdfec8cbdc465df160a169bfdee972054d514eeb
[45]: https://github.com/Xunnamius/next-test-api-route-handler/commit/59f54a5aabc4356767e3ba2b4c0b551cd61e9891
[46]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5c5f9a48118896c43c03d19e3b12539c7a250714
[47]: https://github.com/Xunnamius/next-test-api-route-handler/issues/875
[48]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43680d926fe803817507b4b9394fa5810752cf1f
[49]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75d4e1f4d1bcc92d9680bb0d74cf26667012265a
[50]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f715331be1b66cb5807785d74aeb47b692492302
[51]: https://github.com/Xunnamius/next-test-api-route-handler/commit/85bb8fa5e60e2019e072367063a25b745d675ed9
[52]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0133e113145dc0c3836be3a73336ab2c024b66e7
[53]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62f1d0b2c5ca0146b903d233b73b659a54b7f16e
[54]: https://github.com/Xunnamius/next-test-api-route-handler/commit/913cbd0f0487c9c98146855413fb91e16bb4a7b0
[55]: https://github.com/Xunnamius/next-test-api-route-handler/commit/702cb444cc5e5c15b2d2b1000f27fca8368678e7
[56]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dc237233338af416993b0ec683a844abb6fab02b
[57]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d72ae876557d5f2e71da99a2d285c12bbe77319b
[58]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.15...next-test-api-route-handler@4.0.16
[59]: https://github.com/Xunnamius/next-test-api-route-handler/commit/410a62f9f1d977dd75e64e367e88fe89a0ecf15e
[60]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1167
[61]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bfcebd99bae8de80ddd84cbc9597033d5de6cb56
[62]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9c19de4e1c5c7c5272d63cc9930cbb017064e6de
[63]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c6496fa203955945da1d90d10a974339b52af781
[64]: https://github.com/Xunnamius/next-test-api-route-handler/commit/274e800ab7f3f9cd1bbd018b7ed96cfae7437088
[65]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5ee3defe4f13e26469acd1ea747c123def42ac2c
[66]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.14...next-test-api-route-handler@4.0.15
[67]: https://github.com/Xunnamius/next-test-api-route-handler/commit/69525da38f038cb19af2214586157c0901741903
[68]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1129
[69]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c11e5d3a700d773185f478a049f984220b7d0f4
[70]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.13...next-test-api-route-handler@4.0.14
[71]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cde549623f5cfde6bd806926500759b1749c4c06
[72]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1115
[73]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.12...next-test-api-route-handler@4.0.13
[74]: https://github.com/Xunnamius/next-test-api-route-handler/commit/edfe781e766cd174892cd394431eb307c134c3c5
[75]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.11...next-test-api-route-handler@4.0.12
[76]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a73f21ef6648ccc0f1b63bc76937623e35a3263d
[77]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.10...next-test-api-route-handler@4.0.11
[78]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a461e8108624c221c70702d1068092a640a5bae5
[79]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1076
[80]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.9...next-test-api-route-handler@4.0.10
[81]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c061b91493c31cd74d076e05a78a7dc594737ed3
[82]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.8...next-test-api-route-handler@4.0.9
[83]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99118a624cdebc2ed5783c184021e30f36aff6ad
[84]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1068
[85]: https://github.com/Xunnamius/next-test-api-route-handler/commit/88948b6f08ba0099dd22c1c3786c6e2c08ef9936
[86]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fa4b2afe931a4300ef7f8314cd264a9ee9c94bd5
[87]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b0701a2628bae2108ea1d9fed7e5e16f95eabeca
[88]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.7...next-test-api-route-handler@4.0.8
[89]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99671200663cfc4ccc1270f5b068f12abe16c03b
[90]: https://github.com/Xunnamius/next-test-api-route-handler/commit/43eec5385cb48f619257324a2fe1b54d29748ff1
[91]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.6...next-test-api-route-handler@4.0.7
[92]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a48555f127b9420527a53d27ac8367246d4474ad
[93]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.5...next-test-api-route-handler@4.0.6
[94]: https://github.com/Xunnamius/next-test-api-route-handler/commit/347d7ef86ee6e4ca40c29793fbe112498a3d4b49
[95]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.4...next-test-api-route-handler@4.0.5
[96]: https://github.com/Xunnamius/next-test-api-route-handler/commit/633a0464435baec9e4ba6c91ed65909a9edaf298
[97]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1011
[98]: https://github.com/Xunnamius/next-test-api-route-handler/issues/983
[99]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.3...next-test-api-route-handler@4.0.4
[100]: https://github.com/Xunnamius/next-test-api-route-handler/commit/01b86b61a75ed315d57d1c087aa4a269a355d601
[101]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1000
[102]: https://github.com/Xunnamius/next-test-api-route-handler/commit/22bb71636c8a46e97d3a287d3534ae91ae4ad514
[103]: https://github.com/Xunnamius/next-test-api-route-handler/issues/993
[104]: https://github.com/Xunnamius/next-test-api-route-handler/commit/502e666158811993e875a64a8d4f924cdee83647
[105]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1006
[106]: https://github.com/Xunnamius/next-test-api-route-handler/issues/1005
[107]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.2...next-test-api-route-handler@4.0.3
[108]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d7774b30210969be5c5acaafe0330cc9c1541c40
[109]: https://github.com/Xunnamius/next-test-api-route-handler/issues/962
[110]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d03ca21d9634a1c7a56bbe110b32adb56e6c1068
[111]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.1...next-test-api-route-handler@4.0.2
[112]: https://github.com/Xunnamius/next-test-api-route-handler/commit/90ff6656c8583b1766b6e6aa041c01e6a0bdca62
[113]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8400a194cf3a824209a8175f48bdd4f0e4c43f8c
[114]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@4.0.0...next-test-api-route-handler@4.0.1
[115]: https://github.com/Xunnamius/next-test-api-route-handler/commit/09389fe314bfe1048493b979bf79c65a6cdc27e5
[116]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.10...next-test-api-route-handler@3.2.0
[117]: https://github.com/Xunnamius/next-test-api-route-handler/commit/93b8a3c92eb14a5b2d1006c315e26a3c3547a1c3
[118]: https://github.com/Xunnamius/next-test-api-route-handler/issues/916
[119]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.3...next-test-api-route-handler@3.1.0
[120]: https://github.com/Xunnamius/next-test-api-route-handler/commit/21b4b928a40b685a99df34ad20845c97615ee1c8
[121]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a2f0b28b07f8a176a5333551b5788033f90274a
[122]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0ee4ce58b1c7a8b4ea2096c01142097f427b2a00
[123]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.9...next-test-api-route-handler@3.1.10
[124]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ca1da40c8f14b9c4a39f198787f526759cd7fa8f
[125]: https://github.com/Xunnamius/next-test-api-route-handler/issues/887
[126]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a9d136b2ada5dcac26a8509fd4590a2dec805a56
[127]: https://github.com/Xunnamius/next-test-api-route-handler/commit/db0223ea0c74edab17489595c1c858eb035dd418
[128]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e457064ddbc7e3f7b1d96c7f27b5b74479303f2f
[129]: https://github.com/Xunnamius/next-test-api-route-handler/issues/908
[130]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.7...next-test-api-route-handler@3.1.8
[131]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2a4ae05a6d163902daff9021b375db5f362149d7
[132]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.6...next-test-api-route-handler@3.1.7
[133]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4af52f43dcba1f6f57887fb977b1430f8009d872
[134]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.5...next-test-api-route-handler@3.1.6
[135]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e94142b83d4d6bed7812bca2bd4226a6b67c49a
[136]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.4...next-test-api-route-handler@3.1.5
[137]: https://github.com/Xunnamius/next-test-api-route-handler/commit/405f84dabe68b72e11919066cc53dbc69ad4807d
[138]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.3...next-test-api-route-handler@3.1.4
[139]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b05e112c11ead6b03c33a1a0bf1dc4fca4d29db5
[140]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.2...next-test-api-route-handler@3.1.3
[141]: https://github.com/Xunnamius/next-test-api-route-handler/commit/36a2c44e4b3f6f4f6d4ae9f8a566a42609ee362c
[142]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.1...next-test-api-route-handler@3.1.2
[143]: https://github.com/Xunnamius/next-test-api-route-handler/commit/065b4455016812575e1714cc680e57184b49cf5d
[144]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.1.0...next-test-api-route-handler@3.1.1
[145]: https://github.com/Xunnamius/next-test-api-route-handler/commit/484d7023539d95b8930d1665b4b613042b21fe9f
[146]: https://github.com/Xunnamius/next-test-api-route-handler/issues/487
[147]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.4...next-test-api-route-handler@3.0.0
[148]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d3c60cbd506eb22a4bb23554b06668076e687ad9
[149]: https://github.com/Xunnamius/next-test-api-route-handler/commit/68d30dac2210e4f976afbf5c59378d6b314d4ec3
[150]: https://github.com/Xunnamius/next-test-api-route-handler/commit/15c899a98423c612571886115308e68e20633a1b
[151]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a1a2ee806f4cfd5d199d54dbd82f9f945da1694
[152]: https://github.com/Xunnamius/next-test-api-route-handler/commit/73f44b78c2ee92b443adf99e248c03b985b80891
[153]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.2...next-test-api-route-handler@3.0.3
[154]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1e8cd8573cdcfa3489526244c40f373a71d92b40
[155]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.1...next-test-api-route-handler@3.0.2
[156]: https://github.com/Xunnamius/next-test-api-route-handler/commit/84f74f55027cd4e67b7e7929f668d4de387dc3c3
[157]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@3.0.0...next-test-api-route-handler@3.0.1
[158]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a925da287a02b6c36b588b6804e7b0b628364b25
[159]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.2.1...next-test-api-route-handler@2.3.0
[160]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd3cd95adb536b05a3cfe8bd0b12329c9acad166
[161]: https://github.com/Xunnamius/next-test-api-route-handler/issues/373
[162]: https://github.com/Xunnamius/next-test-api-route-handler/commit/8746e5fb6b337131303ad0c011c864d5152a864d
[163]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ae778d18f1c01e36070f0612067ec9f00f14a665
[164]: https://github.com/Xunnamius/next-test-api-route-handler/issues/378
[165]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c216caa659a0fcf807ff6b1a0c11c2b331e27d3c
[166]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5fbb6d20cab097250cb8c62d0c5edb6fe80f0bfc
[167]: https://github.com/Xunnamius/next-test-api-route-handler/commit/346e8de1390ba46e9dc8faccc0977c5f50a9dc32
[168]: https://github.com/Xunnamius/next-test-api-route-handler/commit/812e6f262726e328a57cdb0833fb8bfbbcce6708
[169]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.3...next-test-api-route-handler@2.3.4
[170]: https://github.com/Xunnamius/next-test-api-route-handler/commit/854704ba9a7f374753e1a51f4fe00db761d7718f
[171]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9302bcc882e9cd4080526f5192186b5259e08726
[172]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.2...next-test-api-route-handler@2.3.3
[173]: https://github.com/Xunnamius/next-test-api-route-handler/commit/597c2497a137c86696aba9b750b60f43d728495f
[174]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.1...next-test-api-route-handler@2.3.2
[175]: https://github.com/Xunnamius/next-test-api-route-handler/commit/32eafabd592856a7ef286d7d0157e38a8275695d
[176]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cd98aab7eea7bdd4b988402b57ce5e93572a7850
[177]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.3.0...next-test-api-route-handler@2.3.1
[178]: https://github.com/Xunnamius/next-test-api-route-handler/commit/91f08d426081afc1009e50d7b9ee6a0a2259268b
[179]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.3...next-test-api-route-handler@2.2.0
[180]: https://github.com/Xunnamius/next-test-api-route-handler/commit/419d5fe805928605b85fe0e5c64c80eb5a1d798d
[181]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.2.0...next-test-api-route-handler@2.2.1
[182]: https://github.com/Xunnamius/next-test-api-route-handler/commit/de9ee177491855eb0ac095f9a1a3e5cfad820420
[183]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.2...next-test-api-route-handler@2.1.0
[184]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c51cf0222e17066c03cd80e1c76c5e9f49cacc2e
[185]: https://github.com/Xunnamius/next-test-api-route-handler/issues/295
[186]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.2...next-test-api-route-handler@2.1.3
[187]: https://github.com/Xunnamius/next-test-api-route-handler/commit/7916f0026b59e6325b59395f61b142056c6c8220
[188]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.1...next-test-api-route-handler@2.1.2
[189]: https://github.com/Xunnamius/next-test-api-route-handler/commit/74241eeee173a6cf8f987608946c3d8691a67c27
[190]: https://github.com/Xunnamius/next-test-api-route-handler/commit/33b6a34a126909a354a7c3f5d523b0fa47acb960
[191]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1c3425caf7d80793a2c1e88ff8fbd29ada8adf2d
[192]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.1.0...next-test-api-route-handler@2.1.1
[193]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd787ca116c3a84f9393f22bf7e898db0a22f5e1
[194]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.24...next-test-api-route-handler@2.0.0
[195]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ee31fa8cefdc2b8b8197d3889fb8aac27467b374
[196]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2f1125cfb481e94af4248cf5b5dfce729cc4d662
[197]: https://github.com/Xunnamius/next-test-api-route-handler/commit/75832099f4c4d0e329aca469ac16c8a25100c26d
[198]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc5e72d9d40f1991315ac0657a4b212331dc065f
[199]: https://github.com/Xunnamius/next-test-api-route-handler/commit/bc7eb3db18aa70345a1c11d96436b374a15c3b7f
[200]: https://github.com/Xunnamius/next-test-api-route-handler/commit/20ca255e01d0c2e7824707e19f41ca5a8de0140e
[201]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.1...next-test-api-route-handler@2.0.2
[202]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fd53fefc6d5c2ff67ed2669b18e28b7ef7005c12
[203]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@2.0.0...next-test-api-route-handler@2.0.1
[204]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ef32668428df303c4e536aae5793ed14eee0ade5
[205]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.3...next-test-api-route-handler@1.2.0
[206]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[207]: https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[208]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[209]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.23...next-test-api-route-handler@1.2.24
[210]: https://github.com/Xunnamius/next-test-api-route-handler/commit/af177c5035c22ab923dd62f6dc82702373f740d4
[211]: https://github.com/Xunnamius/next-test-api-route-handler/commit/364549e2845965954af62fdfa6c1dfa0d6f91f2f
[212]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4db5d04d6a7117fe8e2113d2fafc6150a81f611c
[213]: https://github.com/Xunnamius/next-test-api-route-handler/commit/99ad1276e7e69218719ee2b27173e4ffcb7337f6
[214]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6d523027b8d650ae0a2d121c349e6a4c48af6792
[215]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f7fad4d512f1839d96c6264f2d4abb1c5ed11e7
[216]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d328a86317c60206bda565ba2e315113dadd0c9b
[217]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6e7173fca4cbe778419eeff92ddbf7c03c2b00d5
[218]: https://github.com/Xunnamius/next-test-api-route-handler/commit/23cb7804d5f0e775b75eaefb4588beb179dcdcdf
[219]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f25e5fb8b2797621d316e18b01ee503fb4d1263
[220]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.22...next-test-api-route-handler@1.2.23
[221]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0040582d2f89e9a14c2335dc85cd5f9201bff644
[222]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.21...next-test-api-route-handler@1.2.22
[223]: https://github.com/Xunnamius/next-test-api-route-handler/commit/df9ede3ddde3a2df6a42224ab3302e599bd61516
[224]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.20...next-test-api-route-handler@1.2.21
[225]: https://github.com/Xunnamius/next-test-api-route-handler/commit/29aa25a9e2572be5b418fbee9d2d8aba2056583e
[226]: https://github.com/Xunnamius/next-test-api-route-handler/commit/806575792fe9e1522bd6bce0eb10f1bd3407da64
[227]: https://github.com/Xunnamius/next-test-api-route-handler/commit/dd3e7faadf148b23994f443a2247cc1316639e7d
[228]: https://github.com/Xunnamius/next-test-api-route-handler/issues/126
[229]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.19...next-test-api-route-handler@1.2.20
[230]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
[231]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.18...next-test-api-route-handler@1.2.19
[232]: https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[233]: https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[234]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[235]: https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[236]: https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[237]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[238]: https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[239]: https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[240]: https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[241]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[242]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.17...next-test-api-route-handler@1.2.18
[243]: https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[244]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.16...next-test-api-route-handler@1.2.17
[245]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.15...next-test-api-route-handler@1.2.16
[246]: https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[247]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.14...next-test-api-route-handler@1.2.15
[248]: https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[249]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.13...next-test-api-route-handler@1.2.14
[250]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[251]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.12...next-test-api-route-handler@1.2.13
[252]: https://github.com/janhesters
[253]: https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[254]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[255]: https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[256]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[257]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[258]: https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[259]: https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[260]: https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[261]: https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[262]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[263]: https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[264]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[265]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[266]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[267]: https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[268]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[269]: https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[270]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.11...next-test-api-route-handler@1.2.12
[271]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.10...next-test-api-route-handler@1.2.11
[272]: https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[273]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.9...next-test-api-route-handler@1.2.10
[274]: https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[275]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.8...next-test-api-route-handler@1.2.9
[276]: https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[277]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.7...next-test-api-route-handler@1.2.8
[278]: https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[279]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.6...next-test-api-route-handler@1.2.7
[280]: https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[281]: https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[282]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.5...next-test-api-route-handler@1.2.6
[283]: https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[284]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.4...next-test-api-route-handler@1.2.5
[285]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[286]: https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[287]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.3...next-test-api-route-handler@1.2.4
[288]: https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[289]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.2...next-test-api-route-handler@1.2.3
[290]: https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[291]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.1...next-test-api-route-handler@1.2.2
[292]: https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[293]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.2.0...next-test-api-route-handler@1.2.1
[294]: https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[295]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.10...next-test-api-route-handler@1.1.0
[296]: https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[297]: https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[298]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.2...next-test-api-route-handler@1.1.3
[299]: https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[300]: https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[301]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.1.1...next-test-api-route-handler@1.1.2
[302]: https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[303]: https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[304]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.9...next-test-api-route-handler@1.0.10
[305]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.8...next-test-api-route-handler@1.0.9
[306]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.7...next-test-api-route-handler@1.0.8
[307]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.6...next-test-api-route-handler@1.0.7
[308]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.5...next-test-api-route-handler@1.0.6
[309]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.4...next-test-api-route-handler@1.0.5
[310]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.3...next-test-api-route-handler@1.0.4
[311]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.2...next-test-api-route-handler@1.0.3
[312]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.1...next-test-api-route-handler@1.0.2
[313]: https://github.com/Xunnamius/next-test-api-route-handler/compare/next-test-api-route-handler@1.0.0...next-test-api-route-handler@1.0.1
