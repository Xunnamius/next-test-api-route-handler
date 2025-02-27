[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / FixtureContext

# Type Alias: FixtureContext\<Options\>

> **FixtureContext**\<`Options`\>: `object` & `ReturnVIfTExtendsU`\<`Options`, [`DescribeRootFixtureOptions`](DescribeRootFixtureOptions.md), [`DescribeRootFixtureContext`](DescribeRootFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`DummyDirectoriesFixtureOptions`](DummyDirectoriesFixtureOptions.md), [`DummyDirectoriesFixtureContext`](DummyDirectoriesFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`DummyFilesFixtureOptions`](DummyFilesFixtureOptions.md), [`DummyFilesFixtureContext`](DummyFilesFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`DummyNpmPackageFixtureOptions`](DummyNpmPackageFixtureOptions.md), [`DummyNpmPackageFixtureContext`](DummyNpmPackageFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`GitRepositoryFixtureOptions`](GitRepositoryFixtureOptions.md), [`GitRepositoryFixtureContext`](GitRepositoryFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`NodeImportAndRunTestFixtureOptions`](NodeImportAndRunTestFixtureOptions.md), [`NodeImportAndRunTestFixtureContext`](NodeImportAndRunTestFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`RunTestFixtureOptions`](RunTestFixtureOptions.md), [`RunTestFixtureContext`](RunTestFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`NpmCopyPackageFixtureOptions`](NpmCopyPackageFixtureOptions.md), [`NpmCopyPackageFixtureContext`](NpmCopyPackageFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`NpmLinkPackageFixtureOptions`](NpmLinkPackageFixtureOptions.md), [`NpmLinkPackageFixtureContext`](NpmLinkPackageFixtureContext.md)\> & `ReturnVIfTExtendsU`\<`Options`, [`WebpackTestFixtureOptions`](WebpackTestFixtureOptions.md), [`WebpackTestFixtureContext`](WebpackTestFixtureContext.md)\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/fixtures.d.ts:64

The context object passed around between every [MockFixture](MockFixture.md).

## Type declaration

### debug

> **debug**: `ExtendedDebugger`

An ExtendedDebugger instance extended specifically for use by the
current fixture.

### fixtures

> **fixtures**: [`GenericMockFixture`](GenericMockFixture.md)[]

The fixtures that comprise the current runtime.

### fs

> **fs**: [`FixtureFs`](FixtureFs.md)

Context-sensitive asynchronous wrappers for `node:fs/promises` functions
(excluding FixtureFs.glob) with in-built debugging and exception
handling.

Note that all relative `PathLike` parameters are considered local to
`root`, not the current working directory, and will be translated into
AbsolutePaths as such.

### options

> **options**: `ReadonlyDeep`\<[`GlobalFixtureOptions`](GlobalFixtureOptions.md)\> & `ReadonlyDeep`\<`Omit`\<`Options` *extends* `Tagged`\<`unknown`, `PropertyKey`\> ? `UnwrapTagged`\<`Options`\> : `Options`, *typeof* `emptyObjectSymbol`\>\>

The options applicable to the current runtime.

### root

> **root**: `AbsolutePath`

The AbsolutePath pointing to the dummy root directory.

### virtualFiles

> **virtualFiles**: `object`

The mutable "virtual files" as they exist currently in memory, including
any mutations performed by fixtures.

#### Index Signature

\[`filePath`: `RelativePath`\]: `string`

#### See

[GlobalFixtureOptions.initialVirtualFiles](GlobalFixtureOptions.md#initialvirtualfiles)

## Type Parameters

• **Options**
