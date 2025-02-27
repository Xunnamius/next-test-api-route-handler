[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / asMocked

# Function: asMocked()

## Call Signature

> **asMocked**\<`T`\>(`options`?): `MaybeMockedDeep`\<`T`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:47

Return a function representing `T` but wrapped with Jest mock definitions.
Pass `{shallow: true}` as the only parameter to disable the deep mocking of
`T`, which otherwise occurs by default.

This is a more powerful version of Jest's own jest.mocked and
jest.MockedFn.

### Type Parameters

• **T** *extends* (...`args`) => `any`

### Parameters

#### options?

##### shallow?

`false`

### Returns

`MaybeMockedDeep`\<`T`\>

### Example

```ts
import type { MyFunctionType } from "./library";
jest.mock("./library");

const mockRepresentingMyFunctionType = asMocked<MyFunctionType>();
// ...
expect(mockRepresentingMyFunctionType.mock.calls[0][0]).toBe(42);
```

## Call Signature

> **asMocked**\<`T`\>(`options`): `MaybeMocked`\<`T`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:66

Return a function representing `T` but wrapped (shallowly) with Jest mock
definitions.

This is a more powerful version of Jest's own jest.mocked and
jest.MockedFn.

### Type Parameters

• **T** *extends* (...`args`) => `any`

### Parameters

#### options

##### shallow

`true`

### Returns

`MaybeMocked`\<`T`\>

### Example

```ts
import type { MyFunctionType } from "./library";
jest.mock("./library");

const mockRepresentingMyFunctionType = asMocked<MyFunctionType>({ shallow: true });
// ...
expect(mockRepresentingMyFunctionType.mock.calls[0][0]).toBe(42);
```

## Call Signature

> **asMocked**\<`T`\>(`source`, `options`?): `MaybeMockedDeep`\<`T`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:83

Wrap the non-nullish `source` with Jest mock definitions. Pass `{shallow:
true}` as the second parameter to disable the default deep mocking behavior.

This is a more powerful version of Jest's own jest.mocked function.

### Type Parameters

• **T** *extends* `object`

### Parameters

#### source

`T`

#### options?

##### shallow

`false`

### Returns

`MaybeMockedDeep`\<`T`\>

### Example

```ts
import { myFunction } from "./library";
jest.mock("./library");

const mockMyFunction = asMocked(myFunction);
expect(mockMyFunction.mock.calls[0][0]).toBe(42);
```

## Call Signature

> **asMocked**\<`T`\>(`source`, `options`): `MaybeMocked`\<`T`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:99

Shallowly wrap the non-nullish `source` with Jest mock definitions.

This is a more powerful version of Jest's own jest.mocked function.

### Type Parameters

• **T** *extends* `object`

### Parameters

#### source

`T`

#### options

##### shallow

`true`

### Returns

`MaybeMocked`\<`T`\>

### Example

```ts
import { myFunction } from "./library";
jest.mock("./library");

const mockMyFunction = asMocked(myFunction, { shallow: true });
expect(mockMyFunction.mock.calls[0][0]).toBe(42);
```

## Call Signature

> **asMocked**\<`T`\>(...`args`): `MaybeMockedDeep`\<`T`\> \| `MaybeMocked`\<`T`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:116

Wrap the non-nullish `source` (or `T` itself is `source` is omitted) with
Jest mock definitions.

This is a more powerful version of Jest's own jest.mocked function.

### Type Parameters

• **T** *extends* `object`

### Parameters

#### args

\[`object`\] | \[`T`, `object`\]

### Returns

`MaybeMockedDeep`\<`T`\> \| `MaybeMocked`\<`T`\>

### Example

```ts
import { myFunction } from "./library";
jest.mock("./library");

const mockMyFunction = asMocked(myFunction);
expect(mockMyFunction.mock.calls[0][0]).toBe(42);
```
