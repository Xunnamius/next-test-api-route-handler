[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / expectExceptionsWithMatchingErrors

# Function: expectExceptionsWithMatchingErrors()

## Call Signature

> **expectExceptionsWithMatchingErrors**\<`Params`\>(`spec`, `errorFn`, `options`): `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:291

Maps each element of the `spec` array into a Jest expectation asserting that
`errorFn` either throws an error or rejects. If an assertion fails, a helpful
error message is thrown.

Example 1:

```typescript
await expectExceptionsWithMatchingErrors([
 [[param1, param2], 'expected error message 1'],
 [[1, 2, 3], 'expected error message 2']
],
() => {
  // ...
});
```

Example 2:

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

Note: if you're getting a type error about no matching overloads and/or an
untyped `errorFn`, make sure you've set `options.singleParameter`
accordingly.

### Type Parameters

#### Params

`Params`

### Parameters

#### spec

[`ExpectExceptionsWithMatchingErrorsSpec`](../type-aliases/ExpectExceptionsWithMatchingErrorsSpec.md)\<\[`Params`\], `"single-parameter"`\>

#### errorFn

[`ExpectExceptionsWithMatchingErrorsFunction`](../type-aliases/ExpectExceptionsWithMatchingErrorsFunction.md)\<\[`Params`\]\>

#### options

[`ExpectExceptionsWithMatchingErrorsOptions`](../type-aliases/ExpectExceptionsWithMatchingErrorsOptions.md) & `object`

### Returns

`Promise`\<`void`\>

## Call Signature

> **expectExceptionsWithMatchingErrors**\<`Params`\>(`spec`, `errorFn`, `options?`): `Promise`\<`void`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:294

Maps each element of the `spec` array into a Jest expectation asserting that
`errorFn` either throws an error or rejects. If an assertion fails, a helpful
error message is thrown.

Example 1:

```typescript
await expectExceptionsWithMatchingErrors([
 [[param1, param2], 'expected error message 1'],
 [[1, 2, 3], 'expected error message 2']
],
() => {
  // ...
});
```

Example 2:

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

Note: if you're getting a type error about no matching overloads and/or an
untyped `errorFn`, make sure you've set `options.singleParameter`
accordingly.

### Type Parameters

#### Params

`Params` *extends* `unknown`[]

### Parameters

#### spec

[`ExpectExceptionsWithMatchingErrorsSpec`](../type-aliases/ExpectExceptionsWithMatchingErrorsSpec.md)\<`Params`\>

#### errorFn

[`ExpectExceptionsWithMatchingErrorsFunction`](../type-aliases/ExpectExceptionsWithMatchingErrorsFunction.md)\<`Params`\>

#### options?

[`ExpectExceptionsWithMatchingErrorsOptions`](../type-aliases/ExpectExceptionsWithMatchingErrorsOptions.md)

### Returns

`Promise`\<`void`\>
