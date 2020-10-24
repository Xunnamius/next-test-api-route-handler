[v1.0.9]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.8...v1.0.9
[v1.0.8]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.7...v1.0.8
[v1.0.7]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.6...v1.0.7
[v1.0.6]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.5...v1.0.6
[v1.0.5]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.4...v1.0.5
[v1.0.4]: https://github.com/Xunnamius/next-test-api-route-handler/compare/v1.0.3...v1.0.4
[v1.0.3]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.2...v1.0.3
[1.0.2]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/Xunnamius/next-test-api-route-handler/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/Xunnamius/next-test-api-route-handler/releases/tag/1.0.0

[https://keepachangelog.com/en/1.0.0/]::

[types of changes]::
  [added]:: (for new features)
  [changed]:: (for changes in existing functionality)
  [deprecated]:: (for soon-to-be removed features)
  [removed]:: (for now removed features)
  [fixed]:: (for any bug fixes)
  [security]:: (in case of vulnerabilities)

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Upcoming]

(no notes yet)

## Released

### [![v1.0.9](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.9)][v1.0.9]
#### Changed
- Several quality updates
- Fixed README typos

---

### [![v1.0.9](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.9)][v1.0.9]
#### Added
- Added [babel-plugin-transform-mjs-imports][plugin] to fix [issues with Webpack
  importing CJS modules in `.mjs` files][webpack-problems]

---

### [![v1.0.8](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.8)][v1.0.8]
#### Changed
- Preparing to switch to Webpack 5 (blocked by `dotenv-webpack`)
- ES module files are now `.mjs` in npm package (retired the local
  `package.json` solution)
- README updates

---

### [![v1.0.7](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.7)][v1.0.7]
#### Changed
- Switched to dual CJS2 bundle + ES modules configuration
- Properly externalized dependencies (so: much smaller bundle size!)
- README updates

---

### [![v1.0.6](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.6)][v1.0.6]
#### Changed
- Improved test coverage
- Improvements to the external script
- Improvements to the build process (including better minification)
- Bumped deps
- Added `--runInBand` to `test` npm run-script to fix coverage generation bug
  with Jest when running `externals.test.ts`

---

### [![v1.0.5](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.5)][v1.0.5]
#### Changed
- Added UMD build step to Webpack for non-ESM CJS/AMD compat (package can now be
  `required` normally)
- Finished `externals.test.ts`

---

### [![v1.0.4](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.4)][v1.0.4]
#### Fixed
- Missing `main` key in package.json breaks several build systems

---

### [![v1.0.3](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/v1.0.3)][v1.0.3]
#### Added
- Added CHANGELOG
- Added `is-next-compat` external script to monitor compat with `next@latest`
- Webpack and `.env` configuration support to compile external scripts

#### Changed
- Prettier README
- Upgraded eslint configuration
- More robust NPM run scripts, various build system fixes, and upgraded
  TypeScript configuration
- Bumped Next lock to `9.5.5`

#### Removed
- Type exports stored separately

---

### [![1.0.2](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/1.0.2)][1.0.2]
#### Added
- Explicit types export for TypeScript support

---

### [![1.0.1](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/1.0.1)][1.0.1]
#### Fixed
- Changed Babel transpilation target to `node: true`

---

### [![1.0.0](https://api.ergodark.com/badges/github-tag-date/xunnamius/next-test-api-route-handler/1.0.0)][1.0.0]
#### Added
- Initial release

[Upcoming]: https://github.com/Xunnamius/next-test-api-route-handler/compare/main...develop
[webpack-problems]: https://github.com/reactioncommerce/reaction-component-library/issues/399#issuecomment-467860022
[plugin]: https://www.npmjs.com/package/babel-plugin-transform-mjs-imports
