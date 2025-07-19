[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / mockFixturesFactory

# Function: mockFixturesFactory()

> **mockFixturesFactory**\<`Fixtures`, `AdditionalOptions`, `AdditionalContext`\>(...`__namedParameters`): (...`args`) => `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/index.d.ts:49

Returns a function allowing for the creation of many mock (or "dummy")
filesystem structures, each used to simulate one or more runtime environments
for the package under test.

## Type Parameters

### Fixtures

`Fixtures` *extends* [`GenericMockFixtureFunctions`](../type-aliases/GenericMockFixtureFunctions.md)

### AdditionalOptions

`AdditionalOptions` *extends* `Record`\<`string`, `unknown`\> = `EmptyObject`

### AdditionalContext

`AdditionalContext` *extends* `Record`\<`string`, `unknown`\> = `EmptyObject`

## Parameters

### \_\_namedParameters

...\[`Fixtures`, `ReadonlyDeep`\<[`GlobalFixtureOptions`](../type-aliases/GlobalFixtureOptions.md) & [`GenericMockFixture`](../type-aliases/GenericMockFixture.md) *extends* `ReturnType`\<`Fixtures`\[`number`\]\> ? `unknown` : `IfAny`\<`ReturnType`\<`Fixtures`\[`number`\]\>, `unknown`, `ReturnVIfTExtendsU`\<[`DescribeRootFixture`](../type-aliases/DescribeRootFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DescribeRootFixtureOptions`](../type-aliases/DescribeRootFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyDirectoriesFixture`](../type-aliases/DummyDirectoriesFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyDirectoriesFixtureOptions`](../type-aliases/DummyDirectoriesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyFilesFixture`](../type-aliases/DummyFilesFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyFilesFixtureOptions`](../type-aliases/DummyFilesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyNpmPackageFixture`](../type-aliases/DummyNpmPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyNpmPackageFixtureOptions`](../type-aliases/DummyNpmPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`GitRepositoryFixture`](../type-aliases/GitRepositoryFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`GitRepositoryFixtureOptions`](../type-aliases/GitRepositoryFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NodeImportAndRunTestFixture`](../type-aliases/NodeImportAndRunTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NodeImportAndRunTestFixtureOptions`](../type-aliases/NodeImportAndRunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`RunTestFixture`](../type-aliases/RunTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`RunTestFixtureOptions`](../type-aliases/RunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmCopyPackageFixture`](../type-aliases/NpmCopyPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NpmCopyPackageFixtureOptions`](../type-aliases/NpmCopyPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmLinkPackageFixture`](../type-aliases/NpmLinkPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NpmLinkPackageFixtureOptions`](../type-aliases/NpmLinkPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`WebpackTestFixture`](../type-aliases/WebpackTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`WebpackTestFixtureOptions`](../type-aliases/WebpackTestFixtureOptions.md), `true`\>\> & `NoInfer`\<`AdditionalOptions`\>\>\]

## Returns

> (...`args`): `Promise`\<`void`\>

### Parameters

#### args

...\[(`context`) => `unknown`, `Partial`\<`ReadonlyDeep`\<[`GlobalFixtureOptions`](../type-aliases/GlobalFixtureOptions.md) & [`GenericMockFixture`](../type-aliases/GenericMockFixture.md) *extends* `ReturnType`\<`Fixtures`\[`number`\]\> ? `unknown` : `IfAny`\<`ReturnType`\<`Fixtures`\[`number`\]\>, `unknown`, `ReturnVIfTExtendsU`\<[`DescribeRootFixture`](../type-aliases/DescribeRootFixture.md), `ReturnType`\<...\>, [`DescribeRootFixtureOptions`](../type-aliases/DescribeRootFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyDirectoriesFixture`](../type-aliases/DummyDirectoriesFixture.md), `ReturnType`\<...\>, [`DummyDirectoriesFixtureOptions`](../type-aliases/DummyDirectoriesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyFilesFixture`](../type-aliases/DummyFilesFixture.md), `ReturnType`\<...\>, [`DummyFilesFixtureOptions`](../type-aliases/DummyFilesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyNpmPackageFixture`](../type-aliases/DummyNpmPackageFixture.md), `ReturnType`\<...\>, [`DummyNpmPackageFixtureOptions`](../type-aliases/DummyNpmPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`GitRepositoryFixture`](../type-aliases/GitRepositoryFixture.md), `ReturnType`\<...\>, [`GitRepositoryFixtureOptions`](../type-aliases/GitRepositoryFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NodeImportAndRunTestFixture`](../type-aliases/NodeImportAndRunTestFixture.md), `ReturnType`\<...\>, [`NodeImportAndRunTestFixtureOptions`](../type-aliases/NodeImportAndRunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`RunTestFixture`](../type-aliases/RunTestFixture.md), `ReturnType`\<...\>, [`RunTestFixtureOptions`](../type-aliases/RunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmCopyPackageFixture`](../type-aliases/NpmCopyPackageFixture.md), `ReturnType`\<...\>, [`NpmCopyPackageFixtureOptions`](../type-aliases/NpmCopyPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmLinkPackageFixture`](../type-aliases/NpmLinkPackageFixture.md), `ReturnType`\<...\>, [`NpmLinkPackageFixtureOptions`](../type-aliases/NpmLinkPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`WebpackTestFixture`](../type-aliases/WebpackTestFixture.md), `ReturnType`\<...\>, [`WebpackTestFixtureOptions`](../type-aliases/WebpackTestFixtureOptions.md), `true`\>\> & `NoInfer`\<`AdditionalOptions`\>\>\>?\]

### Returns

`Promise`\<`void`\>
