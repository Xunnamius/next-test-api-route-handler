[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / IsolatedImportOptions

# Type Alias: IsolatedImportOptions

> **IsolatedImportOptions**: `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-import/dist/packages/test-mock-import/src/index.d.ts:12

## Type declaration

### reduceToDefault?

> `optional` **reduceToDefault**: `boolean`

By default, if `module.__esModule === true` and the only other property of
`module.exports` is `"default"`, then said `"default"` export will be
returned instead of a module object. Use `reduceToDefault` to override this
behavior in either direction.

#### Default

```ts
undefined
```

## See

[isolatedImport](../functions/isolatedImport.md)
