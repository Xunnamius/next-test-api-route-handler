[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / NtarhInit

# Interface: NtarhInit\<NextResponseJsonType\>

Defined in: [src/index.ts:133](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L133)

## Extended by

- [`NtarhInitAppRouter`](NtarhInitAppRouter.md)
- [`NtarhInitPagesRouter`](NtarhInitPagesRouter.md)

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `unknown`

## Properties

### rejectOnHandlerError?

> `optional` **rejectOnHandlerError**: `boolean`

Defined in: [src/index.ts:146](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L146)

If `false`, errors thrown from within a handler are kicked up to Next.js's
resolver to deal with, which is what would happen in production. If `true`,
the [testApiHandler](../functions/testApiHandler.md) function will reject immediately instead.

You should use `rejectOnHandlerError` whenever you want to manually handle
an error that bubbles up from your handler (which is especially true if
you're using `expect` _within_ your handler) or when you notice a false
negative despite exceptions being thrown.

#### Default

```ts
false
```

***

### test()

> **test**: (`parameters`) => `Promisable`\<`void`\>

Defined in: [src/index.ts:152](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L152)

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

#### Parameters

##### parameters

###### fetch

(`customInit?`) => `FetchReturnType`\<`NextResponseJsonType`\>

#### Returns

`Promisable`\<`void`\>
