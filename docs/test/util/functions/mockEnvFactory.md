[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / mockEnvFactory

# Function: mockEnvFactory()

> **mockEnvFactory**(`factorySimulatedEnv`, `factoryOptions`?): (`test`, `simulatedEnv`?, `options`?) => `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-env/dist/packages/test-mock-env/src/index.d.ts:51

Return a function that, when invoked, returns a pre-configured
[withMockedEnv](withMockedEnv.md) function.

This is useful for centralizing mock configuration in one place instead of
duplicating configuration across [withMockedEnv](withMockedEnv.md) calls.

## Parameters

### factorySimulatedEnv

`Record`\<`string`, `string`\>

### factoryOptions?

[`MockedEnvOptions`](../type-aliases/MockedEnvOptions.md)

## Returns

`Function`

### Parameters

#### test

() => `Promisable`\<`void`\>

#### simulatedEnv?

`Record`\<`string`, `string`\>

#### options?

[`MockedEnvOptions`](../type-aliases/MockedEnvOptions.md)

### Returns

`Promise`\<`void`\>
