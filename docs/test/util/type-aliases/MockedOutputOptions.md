[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / MockedOutputOptions

# Type Alias: MockedOutputOptions

> **MockedOutputOptions** = `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-output/dist/packages/test-mock-output/src/index.d.ts:5

## See

[withMockedOutput](../functions/withMockedOutput.md)

## Properties

### passthrough?

> `optional` **passthrough**: (`"log"` \| `"warn"` \| `"error"` \| `"info"` \| `"stdout"` \| `"stderr"`)[]

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-output/dist/packages/test-mock-output/src/index.d.ts:21

Prevent mocking the implementation of one or more output spies, allowing
output to be passed through to the original function. Said spies will
remain functional.

#### Default

```ts
[]
```

***

### passthroughOutputIfDebugging?

> `optional` **passthroughOutputIfDebugging**: `boolean`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-output/dist/packages/test-mock-output/src/index.d.ts:13

If `true`, whenever `process.env.DEBUG` is present, output functions will
still be spied on but their implementations will not be mocked, allowing
debug output to make it to the screen.

#### Default

```ts
true
```
