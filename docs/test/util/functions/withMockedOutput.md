[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / withMockedOutput

# Function: withMockedOutput()

> **withMockedOutput**(`test`, `__namedParameters?`): `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-output/dist/packages/test-mock-output/src/index.d.ts:76

Mock terminal output functions within the scope of `test`. Guaranteed to
return terminal output functions to their original state no matter how `test`
terminates.

**WARNING: it is not safe to run this function concurrently (e.g. with
`Promise.all`).**

## Parameters

### test

(`spies`) => `unknown`

### \_\_namedParameters?

[`MockedOutputOptions`](../type-aliases/MockedOutputOptions.md)

## Returns

`Promise`\<`void`\>
