[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / NpmCopyPackageFixtureOptions

# Type Alias: NpmCopyPackageFixtureOptions

> **NpmCopyPackageFixtureOptions** = `Tagged`\<\{ `ignorePackageDependencies?`: \{ `bundledDependencies?`: `boolean`; `dependencies?`: `boolean`; `devDependencies?`: `boolean`; `optionalDependencies?`: `boolean`; `peerDependencies?`: `boolean`; `peerDependenciesMeta?`: `boolean`; \}; `packageUnderTest`: `Omit`\<`GenericPackage`, `"projectMetadata"`\>; `runInstallScripts?`: `boolean`; \}, *typeof* [`npmCopyPackageFixtureName`](../variables/npmCopyPackageFixtureName.md)\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/npm-copy-package.d.ts:20

Contains any additional options properties this fixture expects or allows.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same keys (or no
keys).

## See

[npmCopyPackageFixture](../functions/npmCopyPackageFixture.md)
