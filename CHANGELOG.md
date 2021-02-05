# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits][1], and this project adheres to
[Semantic Versioning][2].

## [1.2.12][3] (2021-01-23)

### Build System

- Remove erroneous module import ([6eb2a34][4])

## [1.2.11][5] (2021-01-23)

### Build System

- Backport/normalize across packages ([e589c1d][6])

## [1.2.10][7] (2021-01-22)

### Build System

- Update debug statement syntax ([52a2276][8])

## [1.2.9][9] (2021-01-21)

### Build System

- **.github/workflows/build-test-deploy.yml:** fix peer dependency installation
  ([12e5bbe][10])

## [1.2.8][11] (2021-01-13)

### Bug Fixes

- **readme.md:** ensure quick start example is functional ([87dc31f][12])

## [1.2.7][13] (2021-01-12)

### Build System

- Rebuild lockfile ([94cfa38][14])
- Update babel-plugin-transform-mjs-imports ([62089c7][15])

## [1.2.6][16] (2021-01-06)

### Build System

- **package.json:** prune old deps ([2cf1d29][17])

## [1.2.5][18] (2021-01-06)

### Build System

- **.github:** add is-next-compat workflow ([1823c05][19])
- **.github/workflows/post-release-check.yml:** add new post-release-check
  ([a307efc][20])

## [1.2.4][21] (2021-01-06)

### Build System

- **readme.md:** add quick start example ([4e5e12c][22])

## [1.2.3][23] (2021-01-05)

### Build System

- **package.json:** favor "prepare" over "postinstall" and use npx for dev tools
  ([a111c87][24])

## [1.2.2][25] (2021-01-05)

### Build System

- **readme.md:** cosmetic ([98b65c6][26])

## [1.2.1][27] (2021-01-05)

### Build System

- **package.json:** update dependencies, prune unused dependencies
  ([6ef6cbe][28])

# [1.2.0][29] (2021-01-05)

### Build System

- **deps:** bump node-notifier from 8.0.0 to 8.0.1 ([45a79d4][30])
- **test/unit-externals.test.ts:** add mongo uri env var to test explicitly
  ([e0e1fd9][31])

### Features

- **.changelogrc.js:** transfer repository over to semantic-release CI/CD
  ([b9d2bf0][32])

## [1.1.3][33] (2020-12-06)

### Build System

- **package.json:** audit and update deps ([c82695a][34])
- **package.json:** manually bump version ([813b21a][35])

## [1.1.2][36] (2020-11-26)

### Bug Fixes

- **README:** update install language ([b68c721][37])

## [1.1.1][38] (2020-11-26)

### Bug Fixes

- **externals:** revert sort-package-json to maintainer version ([750055b][39])
- **externals:** rewrite test workflow ([d604dfc][40])

# [1.1.0][41] (2020-11-25)

### Bug Fixes

- **build:** move Next.js dependency to peer/dev dependencies ([0e7541f][42])
- **externals:** updated remaining dependency references to peerDependency
  references ([ccf54fb][43])

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.11...v1.2.12
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6eb2a348b1352e9f30d7ecacbaba01fa11cf1cfe
[5]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.10...v1.2.11
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e589c1d48aa1dae40643385c6acfcbacf9b40e16
[7]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.9...v1.2.10
[8]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/52a22765e17759271e7ba6c83ce9f3609500b5f3
[9]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.8...v1.2.9
[10]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/12e5bbe1bf36fda3ef938c7ed7cd445fec3901c9
[11]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.7...v1.2.8
[12]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/87dc31f264682d8048ee8d4cba4dbf866666bf07
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.6...v1.2.7
[14]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/94cfa3806bfa0250e9b2dd5b3abfb2ff65c77c6a
[15]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/62089c79f6c9b585d2bb8ca0a8b87bd355b8695f
[16]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.5...v1.2.6
[17]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/2cf1d29159fb746dc4a7c09a8193e46c6bec3823
[18]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.4...v1.2.5
[19]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/1823c055f034e528337c68d710164097e423f6e2
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a307efcf2cdf60679d68fab385bdc8951a476ace
[21]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.3...v1.2.4
[22]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/4e5e12c0df4fc80abb696d32718440ff294902e7
[23]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.2...v1.2.3
[24]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/a111c87ccd863ce4dac85a5bd0281d87affe3b63
[25]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.1...v1.2.2
[26]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/98b65c6da330040e4bcbc22fe28db87c3965fd0e
[27]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.2.0...v1.2.1
[28]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/6ef6cbeb143648eb1fed5eff39071a06e7354275
[29]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.3...v1.2.0
[30]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/45a79d41835b5146912511f8b583c9128d154cf9
[31]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/e0e1fd951fbe63c04c264ad11ab1fa7a39e1679a
[32]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b9d2bf010fba4b163e1eea0801271292a0e74308
[33]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.2...v1.1.3
[34]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/c82695a8816b6cd5f0e11d09cc2f948a30a416e9
[35]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/813b21ad1e2c78594903b3a8f504f4460d8e506e
[36]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.1...v1.1.2
[37]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/b68c721e5100baa883c7096e5cc4e81c1c60ed00
[38]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.1.0...v1.1.1
[39]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/750055b92699fc7f1c06349ccdb0ddc0179f891a
[40]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/d604dfc39d2e77cbe1234b8349a2ecef81a9e54a
[41]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.10...v1.1.0
[42]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/0e7541fbecd2e3bacc124f624bfca2b56ceeb89f
[43]:
  https://github.com/Xunnamius/next-test-api-route-handler/commit/ccf54fb480e35961647900d345149d3cd1cf60d8
