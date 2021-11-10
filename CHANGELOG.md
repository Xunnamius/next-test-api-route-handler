# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][173]; this project adheres
to [Semantic Versioning][174].

### [2.3.3][175] (2021-11-10)

#### ⚙️ Build system

- Differentiate between esm and bundler distributables ([597c249][176])

### [2.3.2][1] (2021-11-07)

#### 🪄 Fixes

- **src:** es module compatibility; no longer attempts to require() in mjs files
  ([32eafab][2])
- **src:** report parsed es module import failures properly ([cd98aab][3])

### [2.3.1][4] (2021-11-06)

#### ⚙️ Build system

- Re-enable ESM (for bundlers) integration tests ([91f08d4][5])

## [2.3.0][6] (2021-11-05)

#### ✨ Features

- Automatically parse "set-cookie" headers; available in response.cookies
  ([cd3cd95][7]) <sup>closes [#373][8]</sup>

#### 🪄 Fixes

- **src:** ensure exceptions do not prevent Jest from exiting ([8746e5f][9])
- **src:** ensure webpack does not break dynamic require on compile
  ([ae778d1][10]) <sup>closes [#378][11]</sup>
- Vastly improved error handling for those using node@<15 and/or npm@<7
  ([c216caa][12])

#### ⚙️ Build system

- Add back nullish coalescing operator babel transform for older node versions
  ([5fbb6d2][13])
- **package:** backport npm script fixes ([346e8de][14])
- **src:** fix TS bundle errors on node\@12 and node\@14 ([812e6f2][15])

#### 🔥 Reverted

- _"chore(github): enable debug mode"_ ([5034aba][16])

### [2.2.1][17] (2021-08-29)

#### ⚙️ Build system

- **license:** switch to MIT license ([de9ee17][18])

## [2.2.0][19] (2021-08-22)

#### ✨ Features

- **types:** expanded typescript support; `testApiHandler` weakly typed by
  default ([419d5fe][20])

### [2.1.3][21] (2021-08-22)

#### 🪄 Fixes

- **src:** ensure dependency resolution failure does not cause test runner to
  hang ([7916f00][22])

### [2.1.2][23] (2021-08-14)

#### 🪄 Fixes

- **src:** memoize resolver import ([74241ee][24])

#### ⚙️ Build system

- **package:** improve build-docs npm script ([33b6a34][25])
- **src:** add descriptions to TypeScript types ([1c3425c][26])

### [2.1.1][27] (2021-08-13)

#### 🪄 Fixes

- **readme:** update install instructions; fix apollo example ([fd787ca][28])

#### ⚙️ Build system

- **webpack.config:** second fix for faulty env management ([87ed12b][29])

## [2.1.0][30] (2021-08-13)

#### ✨ Features

- **src:** enable backwards compatibility all the way back to next\@9
  ([c51cf02][31]) <sup>closes [#295][32]</sup>

#### ⚙️ Build system

- **webpack.config:** do not ignore warnings ([2b14d84][33])
- **webpack.config:** fix faulty env management ([f477260][34])

#### 🔥 Reverted

- _"chore: update dependencies"_ ([f61fd8c][35]) <sup>closes [#296][36]</sup>

### [2.0.2][37] (2021-07-29)

#### ⚙️ Build system

- **external-scripts:** use latest mongodb native driver ([fd53fef][38])
- **webpack.config.js:** more robust build process ([e5c6a99][39])

### [2.0.1][40] (2021-06-27)

#### ⚙️ Build system

- Update dependencies and publish fixed apollo example ([ef32668][41])

## [2.0.0][42] (2021-06-27)

### 💥 BREAKING CHANGES 💥

- **_package.json_:** **this version (and the version before this version) no
  longer works with next@<10**

#### ✨ Features

- Add `url` and `paramsPatcher` ([ee31fa8][43])

#### ⚙️ Build system

- **package.json:** update dependencies ([2f1125c][44])
- **package.json:** update dependencies ([7583209][45])
- **package.json:** update next peer dependency to >=10.0.x ([bc5e72d][46])
- Switch to @xunnamius/conventional-changelog-projector shared config
  ([bc7eb3d][47])
- Update dependencies ([20ca255][48])

### [1.2.24][49] (2021-05-08)

#### 🪄 Fixes

- **index.ts:** next 10.2.0 compat ([af177c5][50])

#### ⚙️ Build system

- **.github/workflows:** disable old pipeline; begin transition to new pipeline
  ([364549e][51])
- **.github/workflows:** overhaul pipeline workflows ([4db5d04][52])
- **.github:** split BTD workflow into two separate workflows (security)
  ([99ad127][53])
- **contributing.md:** split pipeline architecture information off into workflow
  README.md ([6d52302][54])
- **package.json:** ensure hidden dirs' markdown files are seen by remark
  (linted and formatted) ([1f7fad4][55])
- **package.json:** update dependencies ([d328a86][56])
- **readme.md:** fix broken links ([6e7173f][57])
- **readme.md:** improvements ([23cb780][58])
- **readme.md:** include architecture description as workflow README.md
  ([1f25e5f][59])

### [1.2.23][60] (2021-03-14)

#### ⚙️ Build system

- Better documentation ([0040582][61])

### [1.2.22][62] (2021-03-12)

#### ⚙️ Build system

- Update dependencies and fix find-package-json usage ([df9ede3][63])

### [1.2.21][64] (2021-03-12)

#### ⚙️ Build system

- **build-test-deploy.yml:** actions version updates ([29aa25a][65])
- **build-test-deploy.yml:** rollback some pipeline version updates
  ([8065757][66])
- **package.json:** fix typedoc-markdown-plugin patch ([dd3e7fa][67])
  <sup>closes [#126][68]</sup>

### [1.2.20][69] (2021-02-22)

#### ⚙️ Build system

- **package-lock.json:** update deps ([5a2d98f][70])

### [1.2.19][71] (2021-02-22)

#### 🪄 Fixes

- **.changelogrc.js:** fix dark magic ([b4157eb][72])
- **is-next-compat.ts:** never use console.log ([81533c8][73])
- **is-next-compat.ts:** use template string instead of literal ([3a4f0f1][74])
- **unit-index.test.ts:** 100% test coverage ([72189e8][75])

#### ⚙️ Build system

- **.eslintrc.js:** account for node 12 ([cad0fb2][76])
- **.github:** update workflows and templates ([54e51eb][77])
- Backport new webpack config ([b268534][78])
- **integration-external.test.ts:** ensure proper cwd is used for executing
  externals ([31c1d5b][79])
- **is-next-compat.ts:** use execa instead of shelljs under the hood
  ([9d12004][80])
- **package.json:** remove shelljs, update other deps ([11e192a][81])
- **package.json:** update dependencies ([9e1705b][82])
- Rename env-expect to expect-env ([035e98b][83])
- **setup.ts:** fix several lib-pkg tools ([44d1967][84])
- Spellcheck-commit and .changelogrc no longer use shelljs ([dd72fd1][85])
- **test:** update with new lib-pkg tools ([004a657][86])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][87])

#### 🔥 Reverted

- _"debug(build-test-deploy.yml): disable debug mode"_ ([6cefa7a][88])

### [1.2.18][89] (2021-02-11)

#### ⚙️ Build system

- **package.json:** update to proper forked dependencies ([042291d][90])

### [1.2.17][91] (2021-02-10)

#### ⚙️ Build system

- **webpack.config.js:** normalize webpack configuration across repos
  ([65f48a3][92])
- **webpack.config.js:** remove ES6 syntax from JS file ([5ed6dbd][93])

### [1.2.16][94] (2021-02-10)

#### ⚙️ Build system

- **package.json:** update dependencies ([aeef7a9][95])

### [1.2.15][96] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** simplify all examples with more modern syntax; remove
  @ergodark/types ([964bc47][97])

### [1.2.14][98] (2021-02-08)

#### 🪄 Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][99])

### [1.2.13][100] (2021-02-05)

#### 🪄 Fixes

- **config:** use transform-rename-import when building externals
  ([d224f5e][101])
- **index.ts:** use NextApiHandler type (thanks [@janhesters][102])
  ([473ff50][103])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][104])
- **is-next-compat.ts:** better handling of generics ([d7bc091][105])
- Next no longer misclassified as CJS ([9ebac01][106])

#### ⚙️ Build system

- **build-test-deploy.yml:** drop support for node 10 ([6adde15][107])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][108])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][109])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][110])
- Drop support for node 10 ([71e9103][111])
- Only silence sjx if not DEBUG ([f01ce40][112])
- **package.json:** improved build-dist ([a3526f2][113])
- **package.json:** nicer destructured vals in docs ([661e62d][114])
- **package.json:** remove extraneous module ([1f2ad6a][115])
- **package.json:** update dependencies ([c64f761][116])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][117])
- **post-release-check.yml:** more resilient post-release check ([856435f][118])
- Properly mocked unit tests for externals ([b3273df][119])
- **test:** improved testing infrastructure ([fffe02e][120])
- **types:** more precise unique-filename type ([a60793c][121])

### [1.2.12][122] (2021-01-23)

#### ⚙️ Build system

- Remove erroneous module import ([6eb2a34][123])

### [1.2.11][124] (2021-01-23)

#### ⚙️ Build system

- Backport/normalize across packages ([e589c1d][125])

### [1.2.10][126] (2021-01-22)

#### ⚙️ Build system

- Update debug statement syntax ([52a2276][127])

### [1.2.9][128] (2021-01-21)

#### ⚙️ Build system

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation
  ([12e5bbe][129])

### [1.2.8][130] (2021-01-13)

#### 🪄 Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][131])

### [1.2.7][132] (2021-01-12)

#### ⚙️ Build system

- Rebuild lockfile ([94cfa38][133])
- Update babel-plugin-transform-mjs-imports ([62089c7][134])

### [1.2.6][135] (2021-01-06)

#### ⚙️ Build system

- **package.json:** prune old deps ([2cf1d29][136])

### [1.2.5][137] (2021-01-06)

#### ⚙️ Build system

- **.github/workflows/post-release-check.yml:** add new post-release-check
  ([a307efc][138])
- **.github:** add is-next-compat workflow ([1823c05][139])

### [1.2.4][140] (2021-01-06)

#### ⚙️ Build system

- **readme.md:** add quick start example ([4e5e12c][141])

### [1.2.3][142] (2021-01-05)

#### ⚙️ Build system

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools
  ([a111c87][143])

### [1.2.2][144] (2021-01-05)

#### ⚙️ Build system

- **readme.md:** cosmetic ([98b65c6][145])

### [1.2.1][146] (2021-01-05)

#### ⚙️ Build system

- **package.json:** update dependencies, prune unused dependencies
  ([6ef6cbe][147])

## [1.2.0][148] (2021-01-05)

#### ✨ Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD
  ([b9d2bf0][149])

#### ⚙️ Build system

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][150])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly
  ([e0e1fd9][151])

### [1.1.3][152] (2020-12-06)

#### ⚙️ Build system

- **package.json:** audit and update deps ([c82695a][153])
- **package.json:** manually bump version ([813b21a][154])

### [1.1.2][155] (2020-11-26)

#### 🪄 Fixes

- **readme:** update install language ([b68c721][156])

### [1.1.1][157] (2020-11-26)

#### 🪄 Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][158])
- **externals:** rewrite test workflow ([d604dfc][159])

## [1.1.0][160] (2020-11-25)

#### 🪄 Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][161])
- **externals:** updated remaining dependency references to peerDependency
  references ([ccf54fb][162])

### [1.0.10][163] (2020-10-24)

### [1.0.9][164] (2020-10-23)

### [1.0.8][165] (2020-10-20)

### [1.0.7][166] (2020-10-19)

### [1.0.6][167] (2020-10-17)

### [1.0.5][168] (2020-10-13)

### [1.0.4][169] (2020-10-12)

### [1.0.3][170] (2020-10-12)

### [1.0.2][171] (2020-10-07)

### [1.0.1][172] (2020-10-07)

## 1.0.0 (2020-10-07)

[1]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.1...v2.3.2
[2]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/32eafabd592856a7ef286d7d0157e38a8275695d
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cd98aab7eea7bdd4b988402b57ce5e93572a7850
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.0...v2.3.1
[5]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/91f08d426081afc1009e50d7b9ee6a0a2259268b
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.1...v2.3.0
[7]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cd3cd95adb536b05a3cfe8bd0b12329c9acad166
[8]: https://github.com/Xunnamius/next-test-api-route-handler/issues/373
[9]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/8746e5fb6b337131303ad0c011c864d5152a864d
[10]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ae778d18f1c01e36070f0612067ec9f00f14a665
[11]: https://github.com/Xunnamius/next-test-api-route-handler/issues/378
[12]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c216caa659a0fcf807ff6b1a0c11c2b331e27d3c
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5fbb6d20cab097250cb8c62d0c5edb6fe80f0bfc
[14]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/346e8de1390ba46e9dc8faccc0977c5f50a9dc32
[15]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/812e6f262726e328a57cdb0833fb8bfbbcce6708
[16]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5034aba01f30bfb7787247054d12d7dbb90469e6
[17]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.2.0...v2.2.1
[18]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/de9ee177491855eb0ac095f9a1a3e5cfad820420
[19]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.3...v2.2.0
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/419d5fe805928605b85fe0e5c64c80eb5a1d798d
[21]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.2...v2.1.3
[22]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/7916f0026b59e6325b59395f61b142056c6c8220
[23]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.1...v2.1.2
[24]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/74241eeee173a6cf8f987608946c3d8691a67c27
[25]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/33b6a34a126909a354a7c3f5d523b0fa47acb960
[26]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1c3425caf7d80793a2c1e88ff8fbd29ada8adf2d
[27]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.1.0...v2.1.1
[28]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/fd787ca116c3a84f9393f22bf7e898db0a22f5e1
[29]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/87ed12b68e930342649c65a76455396879658d48
[30]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.2...v2.1.0
[31]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c51cf0222e17066c03cd80e1c76c5e9f49cacc2e
[32]: https://github.com/Xunnamius/next-test-api-route-handler/issues/295
[33]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2b14d8499f4845d0e2d20fd2098f509f5edc16f9
[34]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f4772607ebb8641ea4e0d6ac2fd152f76dff3f7c
[35]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f61fd8c5ea52265a7ff15252d720d135890880f2
[36]: https://github.com/Xunnamius/next-test-api-route-handler/issues/296
[37]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.1...v2.0.2
[38]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/fd53fefc6d5c2ff67ed2669b18e28b7ef7005c12
[39]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e5c6a994d4b553369ae42b6be0ae1932346ebbd6
[40]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.0.0...v2.0.1
[41]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ef32668428df303c4e536aae5793ed14eee0ade5
[42]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.24...v2.0.0
[43]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ee31fa8cefdc2b8b8197d3889fb8aac27467b374
[44]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2f1125cfb481e94af4248cf5b5dfce729cc4d662
[45]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/75832099f4c4d0e329aca469ac16c8a25100c26d
[46]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/bc5e72d9d40f1991315ac0657a4b212331dc065f
[47]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/bc7eb3db18aa70345a1c11d96436b374a15c3b7f
[48]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/20ca255e01d0c2e7824707e19f41ca5a8de0140e
[49]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.23...v1.2.24
[50]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/af177c5035c22ab923dd62f6dc82702373f740d4
[51]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/364549e2845965954af62fdfa6c1dfa0d6f91f2f
[52]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4db5d04d6a7117fe8e2113d2fafc6150a81f611c
[53]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/99ad1276e7e69218719ee2b27173e4ffcb7337f6
[54]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6d523027b8d650ae0a2d121c349e6a4c48af6792
[55]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1f7fad4d512f1839d96c6264f2d4abb1c5ed11e7
[56]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d328a86317c60206bda565ba2e315113dadd0c9b
[57]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6e7173fca4cbe778419eeff92ddbf7c03c2b00d5
[58]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/23cb7804d5f0e775b75eaefb4588beb179dcdcdf
[59]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1f25e5fb8b2797621d316e18b01ee503fb4d1263
[60]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.22...v1.2.23
[61]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/0040582d2f89e9a14c2335dc85cd5f9201bff644
[62]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.21...v1.2.22
[63]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/df9ede3ddde3a2df6a42224ab3302e599bd61516
[64]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.20...v1.2.21
[65]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/29aa25a9e2572be5b418fbee9d2d8aba2056583e
[66]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/806575792fe9e1522bd6bce0eb10f1bd3407da64
[67]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/dd3e7faadf148b23994f443a2247cc1316639e7d
[68]: https://github.com/Xunnamius/next-test-api-route-handler/issues/126
[69]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.19...v1.2.20
[70]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
[71]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.18...v1.2.19
[72]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b4157eba128f6a787531fdabf2bebf78851a0d9a
[73]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/81533c8953adde75499cd11b552bca5f970addca
[74]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/3a4f0f150779a226ee3c9f45fde201391fa1bec0
[75]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[76]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cad0fb2b6153434d3be41f394f1fa636cc930435
[77]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[78]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[79]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[80]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9d12004ad5adfc5d4d6992bdb67c52168829967e
[81]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[82]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[83]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[84]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[85]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/dd72fd1859fd74df3af0d47a1747d8c404abc3a7
[86]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[87]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[88]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6cefa7ae41832e61ef6df75409be61141f7d1687
[89]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.17...v1.2.18
[90]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[91]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.16...v1.2.17
[92]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/65f48a3d97184bb8a1be4fd27e86be0d7cd6bb00
[93]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5ed6dbd1cdcb15745f4979f1a716d9bce9a93afb
[94]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.15...v1.2.16
[95]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[96]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.14...v1.2.15
[97]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[98]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.13...v1.2.14
[99]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[100]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.12...v1.2.13
[101]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d224f5eff5a786b96614b2c3f826eba610027da0
[102]: https://github.com/janhesters
[103]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[104]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[105]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d7bc091fe8f8e85b70987cfa4c663c7c8fd018c8
[106]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[107]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[108]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[109]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[110]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[111]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[112]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[113]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[114]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[115]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[116]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[117]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[118]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[119]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[120]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[121]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a60793c620fe926308f8c99c61076da81aebe2fa
[122]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[123]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[124]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[125]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[126]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[127]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[128]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[129]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[130]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[131]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[132]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[133]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[134]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[135]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[136]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[137]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[138]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[139]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[140]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[141]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[142]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[143]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[144]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[145]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[146]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[147]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[148]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[149]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[150]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[151]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[152]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[153]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[154]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[155]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[156]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[157]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[158]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[159]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[160]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[161]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[162]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[163]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.9...v1.0.10
[164]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.8...v1.0.9
[165]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.7...v1.0.8
[166]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.6...v1.0.7
[167]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.5...v1.0.6
[168]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.4...v1.0.5
[169]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.3...v1.0.4
[170]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.2...v1.0.3
[171]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.1...1.0.2
[172]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.0...1.0.1
[173]: https://conventionalcommits.org
[174]: https://semver.org
[175]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v2.3.2...v2.3.3
[176]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/597c2497a137c86696aba9b750b60f43d728495f
