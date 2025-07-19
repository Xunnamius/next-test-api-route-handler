[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / protectedImportFactory

# Function: protectedImportFactory()

> **protectedImportFactory**\<`Module`\>(...`__namedParameters`): \<`LocalModule`\>(`__namedParameters?`) => `Promise`\<`LocalModule`\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-import/dist/packages/test-mock-import/src/index.d.ts:52

Returns a function that, when invoked, performs a CJS module import (via
`require`) as if it were being imported for the first time. Also awaits the
import result and protects the caller from any calls to `process.exit` from
the imported module.

Use `expectedExitCode` when the import is expected to terminate with a
specific exit code.

## Type Parameters

### Module

`Module`

## Parameters

### \_\_namedParameters

...\[`string` \| `AbsolutePath`, [`IsolatedImportOptions`](../type-aliases/IsolatedImportOptions.md)\]

## Returns

> \<`LocalModule`\>(`__namedParameters?`): `Promise`\<`LocalModule`\>

### Type Parameters

#### LocalModule

`LocalModule` = `Module`

### Parameters

#### \_\_namedParameters?

[`IsolatedImportOptions`](../type-aliases/IsolatedImportOptions.md) & `object`

### Returns

`Promise`\<`LocalModule`\>

## See

[isolatedImport](isolatedImport.md)
