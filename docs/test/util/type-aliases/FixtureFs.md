[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / FixtureFs

# Type Alias: FixtureFs

> **FixtureFs** = `object` & `Omit`\<*typeof* `fs`, `"constants"` \| `"glob"`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/fixtures.d.ts:126

Context-sensitive asynchronous wrappers for `node:fs/promises` functions
(excluding fs.glob) with in-build debugging and exception handling.

Note that all relative `PathLike` parameters are considered local to `root`,
not the current working directory, and will be translated into
AbsolutePaths as such.

## Type declaration

### isAccessible()

> **isAccessible**: (...`args`) => `Promise`\<`boolean`\>

Identical to fs.access except it returns a boolean indicating
accessibility.

#### Parameters

##### args

...`Parameters`\<*typeof* `fs.access`\>

#### Returns

`Promise`\<`boolean`\>
