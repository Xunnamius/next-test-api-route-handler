# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][73], and this project adheres to
[Semantic Versioning][74].

## [1.2.18][75] (2021-02-11)

### Build System

- **package.json:** update to proper forked dependencies ([042291d][76])

## [1.2.17][1] (2021-02-10)

### Build System

- **webpack.config.js:** normalize webpack configuration across repos
  ([65f48a3][2])
- **webpack.config.js:** remove ES6 syntax from JS file ([5ed6dbd][3])

## [1.2.16][4] (2021-02-10)

### Build System

- **package.json:** update dependencies ([aeef7a9][5])

## [1.2.15][6] (2021-02-08)

### Bug Fixes

- **readme.md:** simplify all examples with more modern syntax; remove
  @ergodark/types ([964bc47][7])

## [1.2.14][8] (2021-02-08)

### Bug Fixes

- **readme.md:** add Apollo example and additional guidance ([ed357f5][9])

## [1.2.13][10] (2021-02-05)

### Bug Fixes

- **config:** use transform-rename-import when building externals
  ([d224f5e][11])
- **index.ts:** use NextApiHandler type (thanks [@janhesters][12])
  ([473ff50][13])
- **integration-webpack.test.ts:** actually call bundle in test ([f7a12de][14])
- **is-next-compat.ts:** better handling of generics ([d7bc091][15])
- Next no longer misclassified as CJS ([9ebac01][16])

### Build System

- Properly mocked unit tests for externals ([b3273df][17])
- **build-test-deploy.yml:** drop support for webpack 4 ([e508c06][18])
- **test:** improved testing infrastructure ([fffe02e][19])
- Only silence sjx if not DEBUG ([f01ce40][20])
- **build-test-deploy.yml:** drop support for node 10 ([6adde15][21])
- **build-test-deploy.yml:** remove externals exception ([5e3893a][22])
- **cleanup.yml:** fix bugs in workflow ([cbf22fd][23])
- **package.json:** improved build-dist ([a3526f2][24])
- **package.json:** nicer destructured vals in docs ([661e62d][25])
- **package.json:** remove extraneous module ([1f2ad6a][26])
- **package.json:** update dependencies ([c64f761][27])
- **post-release-check.yml:** add five-minute-sleep ([4a0552d][28])
- **post-release-check.yml:** more resilient post-release check ([856435f][29])
- **types:** more precise unique-filename type ([a60793c][30])
- Drop support for node 10 ([71e9103][31])

## [1.2.12][32] (2021-01-23)

### Build System

- Remove erroneous module import ([6eb2a34][33])

## [1.2.11][34] (2021-01-23)

### Build System

- Backport/normalize across packages ([e589c1d][35])

## [1.2.10][36] (2021-01-22)

### Build System

- Update debug statement syntax ([52a2276][37])

## [1.2.9][38] (2021-01-21)

### Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation
  ([12e5bbe][39])

## [1.2.8][40] (2021-01-13)

### Bug Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][41])

## [1.2.7][42] (2021-01-12)

### Build System

- Rebuild lockfile ([94cfa38][43])
- Update babel-plugin-transform-mjs-imports ([62089c7][44])

## [1.2.6][45] (2021-01-06)

### Build System

- **package.json:** prune old deps ([2cf1d29][46])

## [1.2.5][47] (2021-01-06)

### Build System

- **.github:** add is-next-compat workflow ([1823c05][48])
- **.github/workflows/post-release-check.yml:** add new post-release-check
  ([a307efc][49])

## [1.2.4][50] (2021-01-06)

### Build System

- **readme.md:** add quick start example ([4e5e12c][51])

## [1.2.3][52] (2021-01-05)

### Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools
  ([a111c87][53])

## [1.2.2][54] (2021-01-05)

### Build System

- **readme.md:** cosmetic ([98b65c6][55])

## [1.2.1][56] (2021-01-05)

### Build System

- **package.json:** update dependencies, prune unused dependencies
  ([6ef6cbe][57])

# [1.2.0][58] (2021-01-05)

### Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][59])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly
  ([e0e1fd9][60])

### Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD
  ([b9d2bf0][61])

## [1.1.3][62] (2020-12-06)

### Build System

- **package.json:** audit and update deps ([c82695a][63])
- **package.json:** manually bump version ([813b21a][64])

## [1.1.2][65] (2020-11-26)

### Bug Fixes

- **README:** update install language ([b68c721][66])

## [1.1.1][67] (2020-11-26)

### Bug Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][68])
- **externals:** rewrite test workflow ([d604dfc][69])

# [1.1.0][70] (2020-11-25)

### Bug Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][71])
- **externals:** updated remaining dependency references to peerDependency
  references ([ccf54fb][72])

[1]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.16...v1.2.17
[2]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/65f48a3d97184bb8a1be4fd27e86be0d7cd6bb00
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5ed6dbd1cdcb15745f4979f1a716d9bce9a93afb
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.15...v1.2.16
[5]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/aeef7a9726934852e1a51c9da98c4a96a9c70044
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.14...v1.2.15
[7]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/964bc47f80691e83d92082fcaa0679219b8543f5
[8]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.13...v1.2.14
[9]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ed357f5211a49bfffbb28f03d60f157fa23d14b4
[10]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.12...v1.2.13
[11]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d224f5eff5a786b96614b2c3f826eba610027da0
[12]: https://github.com/janhesters
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/473ff500fb2c954ce32be911bde943259ae1bbef
[14]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f7a12ded8f43359fd3079ea8294a2199c34b2d26
[15]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d7bc091fe8f8e85b70987cfa4c663c7c8fd018c8
[16]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/9ebac018798ac82b97b8163bc5713b43001f592c
[17]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b3273dfbe43cb4c9ececdb4863ff4259f38807ec
[18]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e508c06b77d225f150ebfce6409c2506a88efe4c
[19]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/fffe02e14615daba1f9f8ec1bb2a4024ceb93e84
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/f01ce4041b2fb1fd24052ce17008df9746652730
[21]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6adde1576f4aeb8b9a72cdcefc2ea6bd4b71a5cd
[22]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/5e3893a425b95ac2b12edc2195171de85afcfd0a
[23]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/cbf22fdd78e28e02ec4213156c6c72ba16c8bfa3
[24]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a3526f28057201fcce19c752e554e705b8e3a922
[25]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/661e62d53be74211d3d158ad90c196f43c8fe6db
[26]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1f2ad6a2cdc863b183ac7f7bef756dd90c057ebe
[27]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c64f761c3b2cc69cf07cd7dd88e9671deb66fc4f
[28]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4a0552d2c730842371325111276c58651dabc558
[29]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/856435f02ebe2f44b13c92cc6c794eeab2b345d0
[30]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a60793c620fe926308f8c99c61076da81aebe2fa
[31]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/71e9103df5660fea2af3211b1d6c1fa72b1dd3c7
[32]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[33]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[34]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[35]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[36]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[37]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[38]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[39]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[40]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[41]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[42]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[43]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[44]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[45]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[46]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[47]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[48]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[49]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[50]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[51]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[52]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[53]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[54]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[55]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[56]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[57]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[58]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[59]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[60]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[61]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[62]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[63]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[64]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[65]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[66]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[67]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[68]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[69]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[70]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[71]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[72]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
[73]: https://conventionalcommits.org
[74]: https://semver.org
[75]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.17...v1.2.18
[76]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/042291d26742dfdda3742e6171efa25e9d3953ce
