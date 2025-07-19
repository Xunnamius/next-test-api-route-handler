[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / mockArgvFactory

# Function: mockArgvFactory()

> **mockArgvFactory**(`factorySimulatedArgv`, `factoryOptions?`): (`test`, `simulatedArgv?`, `options?`) => `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-argv/dist/packages/test-mock-argv/src/index.d.ts:32

Return a function that, when invoked, returns a pre-configured
[withMockedArgv](withMockedArgv.md) function.

This is useful for centralizing mock configuration in one place instead of
duplicating configuration across [withMockedArgv](withMockedArgv.md) calls.

## Parameters

### factorySimulatedArgv

`string`[]

### factoryOptions?

[`MockedArgvOptions`](../type-aliases/MockedArgvOptions.md)

## Returns

> (`test`, `simulatedArgv?`, `options?`): `Promise`\<`void`\>

### Parameters

#### test

() => `Promisable`\<`void`\>

#### simulatedArgv?

`string`[]

#### options?

[`MockedArgvOptions`](../type-aliases/MockedArgvOptions.md)

### Returns

`Promise`\<`void`\>
