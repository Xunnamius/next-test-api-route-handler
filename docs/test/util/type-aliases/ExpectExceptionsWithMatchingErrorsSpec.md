[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / ExpectExceptionsWithMatchingErrorsSpec

# Type Alias: ExpectExceptionsWithMatchingErrorsSpec\<Params, SingleParameter\>

> **ExpectExceptionsWithMatchingErrorsSpec**\<`Params`, `SingleParameter`\> = \[`"single-parameter"` *extends* `SingleParameter` ? `Params`\[`0`\] : `Params`, `string`\][]

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:226

This type can be used to construct the error spec required by
[expectExceptionsWithMatchingErrors](../functions/expectExceptionsWithMatchingErrors.md) without having to call said
function.

Example:

```typescript
const errors = [
  [{ something: 1 }, 'expected error #1'],
  [{ something: 2 }, 'expected error #2'],
  [{ something: 3 }, 'expected error #3'],
] as Spec<[{ something: number }], 'single-parameter'>;

await expectExceptionsWithMatchingErrors(
  errors,
  (params) => fn(...params),
  { singleParameter: true }
);
```

## Type Parameters

### Params

`Params` *extends* readonly `unknown`[]

### SingleParameter

`SingleParameter` *extends* `"single-parameter"` \| `"multi-parameter"` = `"multi-parameter"`

## See

`spec` from [expectExceptionsWithMatchingErrors](../functions/expectExceptionsWithMatchingErrors.md)
