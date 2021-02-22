# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][93], and this project adheres to
[Semantic Versioning][94].

## [1.2.20][95] (2021-02-22)

### Build System

- **package-lock.json:** update deps ([5a2d98f][96])

## [1.2.19][1] (2021-02-22)

### Bug Fixes

- **.changelogrc.js:** fix dark magic ([b4157eb][2])
- **is-next-compat.ts:** never use console.log ([81533c8][3])
- **is-next-compat.ts:** use template string instead of literal ([3a4f0f1][4])
- **unit-index.test.ts:** 100% test coverage ([72189e8][5])

### Build System

- **.eslintrc.js:** account for node 12 ([cad0fb2][6])
- **.github:** update workflows and templates ([54e51eb][7])
- **integration-external.test.ts:** ensure proper cwd is used for executing
  externals ([31c1d5b][8])
- **is-next-compat.ts:** use execa instead of shelljs under the hood
  ([9d12004][9])
- **package.json:** remove shelljs, update other deps ([11e192a][10])
- **package.json:** update dependencies ([9e1705b][11])
- **test:** update with new lib-pkg tools ([004a657][12])
- Spellcheck-commit and .changelogrc no longer use shelljs ([dd72fd1][13])
- **setup.ts:** fix several lib-pkg tools ([44d1967][14])
- **unit-external.test.ts:** update with new lib-pkg tools ([6df7e73][15])
- Backport new webpack config ([b268534][16])
- Rename env-expect to expect-env ([035e98b][17])

### Reverts

- _"debug(build-test-deploy.yml): disable debug mode"_ ([6cefa7a][18])

## [1.2.18][19] (2021-02-11)

### Build System

- **package.json:** update to proper forked dependencies ([042291d][20])

## [1.2.17][21] (2021-02-10)

### Build System

- **webpack.config.js:** normalize webpack configuration across repos
  ([65f48a3][22])
- **webpack.config.js:** remove ES6 syntax from JS file ([5ed6dbd][23])

## [1.2.16][24] (2021-02-10)

### Build System

- **package.json:** update dependencies ([aeef7a9][25])

## [1.2.15][26] (2021-02-08)

### Bug Fixes

- **readme.md:** simplify all examples with more modern syntax; remove
  @ergodark/types ([964bc47][27])

## [1.2.14][28] (2021-02-08)

### Bug Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][29])

## [1.2.13][30] (2021-02-05)

### Bug Fixes

- **config:** use transform-rename-import when building externals
  ([d224f5e][31])
- **index.ts:** use NextApiHandler type (thanks [@janhesters][32])
  ([473ff50][33])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][34])
- **is-next-compat.ts:** better handling of generics ([d7bc091][35])
- Next no longer misclassified as CJS ([9ebac01][36])

### Build System

- Properly mocked unit tests for externals ([b3273df][37])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][38])
- **test:** improved testing infrastructure ([fffe02e][39])
- Only silence sjx if not DEBUG ([f01ce40][40])
- **build-test-deploy.yml:** drop support for node 10 ([6adde15][41])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][42])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][43])
- **package.json:** improved build-dist ([a3526f2][44])
- **package.json:** nicer destructured vals in docs ([661e62d][45])
- **package.json:** remove extraneous module ([1f2ad6a][46])
- **package.json:** update dependencies ([c64f761][47])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][48])
- **post-release-check.yml:** more resilient post-release check ([856435f][49])
- **types:** more precise unique-filename type ([a60793c][50])
- Drop support for node 10 ([71e9103][51])

## [1.2.12][52] (2021-01-23)

### Build System

- Remove erroneous module import ([6eb2a34][53])

## [1.2.11][54] (2021-01-23)

### Build System

- Backport/normalize across packages ([e589c1d][55])

## [1.2.10][56] (2021-01-22)

### Build System

- Update debug statement syntax ([52a2276][57])

## [1.2.9][58] (2021-01-21)

### Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation
  ([12e5bbe][59])

## [1.2.8][60] (2021-01-13)

### Bug Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][61])

## [1.2.7][62] (2021-01-12)

### Build System

- Rebuild lockfile ([94cfa38][63])
- Update babel-plugin-transform-mjs-imports ([62089c7][64])

## [1.2.6][65] (2021-01-06)

### Build System

- **package.json:** prune old deps ([2cf1d29][66])

## [1.2.5][67] (2021-01-06)

### Build System

- **.github:** add is-next-compat workflow ([1823c05][68])
- **.github/workflows/post-release-check.yml:** add new post-release-check
  ([a307efc][69])

## [1.2.4][70] (2021-01-06)

### Build System

- **readme.md:** add quick start example ([4e5e12c][71])

## [1.2.3][72] (2021-01-05)

### Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools
  ([a111c87][73])

## [1.2.2][74] (2021-01-05)

### Build System

- **readme.md:** cosmetic ([98b65c6][75])

## [1.2.1][76] (2021-01-05)

### Build System

- **package.json:** update dependencies, prune unused dependencies
  ([6ef6cbe][77])

# [1.2.0][78] (2021-01-05)

### Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][79])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly
  ([e0e1fd9][80])

### Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD
  ([b9d2bf0][81])

## [1.1.3][82] (2020-12-06)

### Build System

- **package.json:** audit and update deps ([c82695a][83])
- **package.json:** manually bump version ([813b21a][84])

## [1.1.2][85] (2020-11-26)

### Bug Fixes

- **README:** update install language ([b68c721][86])

## [1.1.1][87] (2020-11-26)

### Bug Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][88])
- **externals:** rewrite test workflow ([d604dfc][89])

# [1.1.0][90] (2020-11-25)

### Bug Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][91])
- **externals:** updated remaining dependency references to peerDependency
  references ([ccf54fb][92])

[1]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.18...v1.2.19
[2]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b4157eba128f6a787531fdabf2bebf78851a0d9a
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/81533c8953adde75499cd11b552bca5f970addca
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/3a4f0f150779a226ee3c9f45fde201391fa1bec0
[5]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/72189e80136b0567de8fc65eed9b2a4be365ca1a
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cad0fb2b6153434d3be41f394f1fa636cc930435
[7]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/54e51ebd0e133fb469306b76bc756c283a71a2c1
[8]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/31c1d5b358df78e0f27e881c0329355d91370995
[9]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9d12004ad5adfc5d4d6992bdb67c52168829967e
[10]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/11e192a670c5cf40faff32abeecb610534cd382b
[11]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9e1705b88fbcb5c4794abfb56691bdea7500db0d
[12]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/004a657bafaab0419e645b6388c7536e38a1ef22
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/dd72fd1859fd74df3af0d47a1747d8c404abc3a7
[14]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/44d1967a412ca67829deeb29c7603ddf7e42f435
[15]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6df7e73fff51036c63efc7ba898c3d76bc47deb7
[16]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b2685345493165cc63136b051cc5fafbf02f5c48
[17]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/035e98bbe4b6bcf1ec6de40ee38b36ec107e8186
[18]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6cefa7ae41832e61ef6df75409be61141f7d1687
[19]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.17...v1.2.18
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
[21]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.16...v1.2.17
[22]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/65f48a3d97184bb8a1be4fd27e86be0d7cd6bb00
[23]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5ed6dbd1cdcb15745f4979f1a716d9bce9a93afb
[24]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.15...v1.2.16
[25]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[26]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.14...v1.2.15
[27]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[28]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.13...v1.2.14
[29]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[30]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.12...v1.2.13
[31]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d224f5eff5a786b96614b2c3f826eba610027da0
[32]: https://github.com/janhesters
[33]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[34]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[35]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d7bc091fe8f8e85b70987cfa4c663c7c8fd018c8
[36]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[37]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[38]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[39]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[40]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[41]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[42]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[43]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[44]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[45]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[46]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[47]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[48]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[49]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[50]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a60793c620fe926308f8c99c61076da81aebe2fa
[51]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[52]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[53]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[54]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[55]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[56]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[57]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[58]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[59]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[60]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[61]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[62]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[63]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[64]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[65]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[66]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[67]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[68]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[69]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[70]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[71]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[72]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[73]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[74]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[75]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[76]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[77]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[78]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[79]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[80]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[81]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[82]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[83]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[84]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[85]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[86]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[87]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[88]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[89]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[90]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[91]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[92]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[93]: https://conventionalcommits.org
[94]: https://semver.org
[95]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.19...v1.2.20
[96]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5a2d98f3ddb34e9d934f16510a73cacd43ee42ee
