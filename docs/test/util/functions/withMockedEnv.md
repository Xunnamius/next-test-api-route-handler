[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / withMockedEnv

# Function: withMockedEnv()

> **withMockedEnv**(`test`, `simulatedEnv`, `__namedParameters`?): `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-env/dist/packages/test-mock-env/src/index.d.ts:40

Mock `process.env` within the scope of `test`. Guaranteed to return
`process.env` to its original state no matter how `test` terminates.

**WARNING: it is not safe to run this function concurrently (e.g. with
`Promise.all`).**

## Parameters

### test

() => `Promisable`\<`void`\>

### simulatedEnv

`Record`\<`string`, `string`\>

### \_\_namedParameters?

[`MockedEnvOptions`](../type-aliases/MockedEnvOptions.md)

## Returns

`Promise`\<`void`\>
