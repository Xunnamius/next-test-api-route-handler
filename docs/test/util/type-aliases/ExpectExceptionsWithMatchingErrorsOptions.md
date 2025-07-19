[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / ExpectExceptionsWithMatchingErrorsOptions

# Type Alias: ExpectExceptionsWithMatchingErrorsOptions

> **ExpectExceptionsWithMatchingErrorsOptions** = `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:230

## See

[expectExceptionsWithMatchingErrors](../functions/expectExceptionsWithMatchingErrors.md)

## Properties

### runOnly?

> `optional` **runOnly**: `number`[]

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:237

If present, only the given indices (zero-based) will be run. The others
will be skipped.

#### Default

```ts
undefined
```

***

### singleParameter?

> `optional` **singleParameter**: `boolean`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:248

If `true`, the first element of each `spec` tuple will be considered a
lone parameter (as if it were wrapped in an array).

This is to make adoption of this function by legacy code bases, which
used the old single-parameter style, easier and should otherwise be
left as `false`.

#### Default

```ts
false
```
