[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / MockedEnvOptions

# Type Alias: MockedEnvOptions

> **MockedEnvOptions** = `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-env/dist/packages/test-mock-env/src/index.d.ts:5

## See

[withMockedEnv](../functions/withMockedEnv.md)

## Properties

### passthroughDebugEnv?

> `optional` **passthroughDebugEnv**: `boolean`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-env/dist/packages/test-mock-env/src/index.d.ts:31

If `true`, whenever `process.env.DEBUG` is present, it will be forwarded
as-is to the underlying environment mock even when `replaceEntireEnv` is
`true`. This allows debug output to make it to the screen.

#### Default

```ts
true
```

***

### replaceEntireEnv?

> `optional` **replaceEntireEnv**: `boolean`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-env/dist/packages/test-mock-env/src/index.d.ts:23

By default, all environment variables in the `process.env` object are
deleted before the object is re-hydrated with `newEnv`.

Two environment variables, if present, are exempt from deletion:
`process.env.DEBUG` and `process.env.DEBUG_COLORS`.

Setting `replace` to `false` will cause `newEnv` to be merged on top of
`process.env` instead of replacing it. Setting `replace` to `true` will
cause `newEnv` to replace the _entire_ `process.env` object, including
`process.env.DEBUG_COLORS`.

Note that `process.env.DEBUG` is unaffected by this option (see
[MockedEnvOptions.passthroughDebugEnv](#passthroughdebugenv) instead).

#### Default

```ts
undefined
```
