[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / withMockedFixtures

# Function: withMockedFixtures()

> **withMockedFixtures**\<`Fixtures`, `AdditionalOptions`, `AdditionalContext`\>(`test`, `fixtures`, `options`): `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/index.d.ts:25

Create a mock or "dummy" filesystem structure used to simulate one or more
runtime environments for the package under test.

When passing one-off custom fixture functions via the `fixtures` parameter,
use the `AdditionalOptions` and `AdditionalContext` type parameters to supply
any additional options and context where necessary.

## Type Parameters

### Fixtures

`Fixtures` *extends* [`GenericMockFixtureFunctions`](../type-aliases/GenericMockFixtureFunctions.md)

### AdditionalOptions

`AdditionalOptions` *extends* `Record`\<`string`, `unknown`\> = `EmptyObject`

### AdditionalContext

`AdditionalContext` *extends* `Record`\<`string`, `unknown`\> = `EmptyObject`

## Parameters

### test

(`context`) => `unknown`

The function responsible for interfacing with the testing framework (e.g.
running `expect` functions).

### fixtures

`Fixtures`

The fixtures used to construct the dummy environment. If the describeRoot
fixture is not included, it will be appended automatically. If the root
fixture is not included, it will be prepended automatically; if it is
included but not the first element, said instance(s) will be removed.

Otherwise, **duplicate fixtures are _not_ filtered out!**

### options

`ReadonlyDeep`\<[`GlobalFixtureOptions`](../type-aliases/GlobalFixtureOptions.md) & [`GenericMockFixture`](../type-aliases/GenericMockFixture.md) *extends* `ReturnType`\<`Fixtures`\[`number`\]\> ? `unknown` : `IfAny`\<`ReturnType`\<`Fixtures`\[`number`\]\>, `unknown`, `ReturnVIfTExtendsU`\<[`DescribeRootFixture`](../type-aliases/DescribeRootFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DescribeRootFixtureOptions`](../type-aliases/DescribeRootFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyDirectoriesFixture`](../type-aliases/DummyDirectoriesFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyDirectoriesFixtureOptions`](../type-aliases/DummyDirectoriesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyFilesFixture`](../type-aliases/DummyFilesFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyFilesFixtureOptions`](../type-aliases/DummyFilesFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`DummyNpmPackageFixture`](../type-aliases/DummyNpmPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`DummyNpmPackageFixtureOptions`](../type-aliases/DummyNpmPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`GitRepositoryFixture`](../type-aliases/GitRepositoryFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`GitRepositoryFixtureOptions`](../type-aliases/GitRepositoryFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NodeImportAndRunTestFixture`](../type-aliases/NodeImportAndRunTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NodeImportAndRunTestFixtureOptions`](../type-aliases/NodeImportAndRunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`RunTestFixture`](../type-aliases/RunTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`RunTestFixtureOptions`](../type-aliases/RunTestFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmCopyPackageFixture`](../type-aliases/NpmCopyPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NpmCopyPackageFixtureOptions`](../type-aliases/NpmCopyPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`NpmLinkPackageFixture`](../type-aliases/NpmLinkPackageFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`NpmLinkPackageFixtureOptions`](../type-aliases/NpmLinkPackageFixtureOptions.md), `true`\> & `ReturnVIfTExtendsU`\<[`WebpackTestFixture`](../type-aliases/WebpackTestFixture.md), `ReturnType`\<`Fixtures`\[`number`\]\>, [`WebpackTestFixtureOptions`](../type-aliases/WebpackTestFixtureOptions.md), `true`\>\> & `NoInfer`\<`AdditionalOptions`\>\>

Options seen by all fixtures.

## Returns

`Promise`\<`void`\>
