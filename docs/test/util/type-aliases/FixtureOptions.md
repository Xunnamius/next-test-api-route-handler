[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / FixtureOptions

# Type Alias: FixtureOptions\<MockFixture, ShouldUnwrap\>

> **FixtureOptions**\<`MockFixture`, `ShouldUnwrap`\> = [`GlobalFixtureOptions`](GlobalFixtureOptions.md) & [`GenericMockFixture`](GenericMockFixture.md) *extends* `MockFixture` ? `unknown` : `IfAny`\<`MockFixture`, `unknown`, `ReturnVIfTExtendsU`\<[`DescribeRootFixture`](DescribeRootFixture.md), `MockFixture`, [`DescribeRootFixtureOptions`](DescribeRootFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`DummyDirectoriesFixture`](DummyDirectoriesFixture.md), `MockFixture`, [`DummyDirectoriesFixtureOptions`](DummyDirectoriesFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`DummyFilesFixture`](DummyFilesFixture.md), `MockFixture`, [`DummyFilesFixtureOptions`](DummyFilesFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`DummyNpmPackageFixture`](DummyNpmPackageFixture.md), `MockFixture`, [`DummyNpmPackageFixtureOptions`](DummyNpmPackageFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`GitRepositoryFixture`](GitRepositoryFixture.md), `MockFixture`, [`GitRepositoryFixtureOptions`](GitRepositoryFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`NodeImportAndRunTestFixture`](NodeImportAndRunTestFixture.md), `MockFixture`, [`NodeImportAndRunTestFixtureOptions`](NodeImportAndRunTestFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`RunTestFixture`](RunTestFixture.md), `MockFixture`, [`RunTestFixtureOptions`](RunTestFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`NpmCopyPackageFixture`](NpmCopyPackageFixture.md), `MockFixture`, [`NpmCopyPackageFixtureOptions`](NpmCopyPackageFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`NpmLinkPackageFixture`](NpmLinkPackageFixture.md), `MockFixture`, [`NpmLinkPackageFixtureOptions`](NpmLinkPackageFixtureOptions.md), `ShouldUnwrap`\> & `ReturnVIfTExtendsU`\<[`WebpackTestFixture`](WebpackTestFixture.md), `MockFixture`, [`WebpackTestFixtureOptions`](WebpackTestFixtureOptions.md), `ShouldUnwrap`\>\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:67

This type combines all possible configurable options conditioned on which
fixtures are actually used.

Pass `unknown` to return a generic result.

## Type Parameters

### MockFixture

`MockFixture`

### ShouldUnwrap

`ShouldUnwrap` *extends* `boolean` = `true`
