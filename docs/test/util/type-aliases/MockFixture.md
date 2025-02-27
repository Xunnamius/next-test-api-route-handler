[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / MockFixture

# Type Alias: MockFixture\<Name, Context\>

> **MockFixture**\<`Name`, `Context`\>: `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/fixtures.d.ts:22

An object describing a mock or "dummy" filesystem structure used to simulate
one or more runtime environments for the package under test.

## Type Parameters

• **Name** *extends* `string`

• **Context**

## Type declaration

### description

> **description**: `string`

A short string output during debugging that describes what the fixture is
doing.

### name

> **name**: `Name` \| `symbol`

An alphanumeric (including hyphens and underscores) string used to identify
the fixture. This string _should_ be unique per fixture.

Including invalid characters in the fixture name will cause an error.

### setup()?

> `optional` **setup**: (`context`) => `Promisable`\<`unknown`\>

An optional function that is run before the `test` function is invoked.

If this function throws, the error will bubble, preventing other fixtures
(and their setup functions) from running.

If a fixture provides neither a `setup` nor `teardown` function, it is
essentially a no-op.

#### Parameters

##### context

`Context`

#### Returns

`Promisable`\<`unknown`\>

### teardown()?

> `optional` **teardown**: (`context`) => `Promisable`\<`unknown`\>

An optional function that is run after the `test` function completes.

Note that, so long as its corresponding `setup` function completed
successfully, `teardown` functions are **ALWAYS** run, even when the `test`
function throws, and even when the `setup`/`teardown` functions of other
fixtures throw.

`teardown` functions are run in reverse order; the first `teardown`
function defined by a fixture will be the last `teardown` function to run.

If a fixture provides neither a `setup` nor `teardown` function, it is
essentially a no-op.

#### Parameters

##### context

`Context`

#### Returns

`Promisable`\<`unknown`\>
