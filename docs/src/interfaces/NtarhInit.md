[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / NtarhInit

# Interface: NtarhInit\<NextResponseJsonType\>

Defined in: [src/index.ts:145](https://github.com/Xunnamius/next-test-api-route-handler/blob/7680aa4482550d5e81f4eff590b7532434ed2196/src/index.ts#L145)

## Extended by

- [`NtarhInitAppRouter`](NtarhInitAppRouter.md)
- [`NtarhInitPagesRouter`](NtarhInitPagesRouter.md)

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `unknown`

## Properties

### rejectOnHandlerError?

> `optional` **rejectOnHandlerError**: `boolean`

Defined in: [src/index.ts:158](https://github.com/Xunnamius/next-test-api-route-handler/blob/7680aa4482550d5e81f4eff590b7532434ed2196/src/index.ts#L158)

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

Defined in: [src/index.ts:164](https://github.com/Xunnamius/next-test-api-route-handler/blob/7680aa4482550d5e81f4eff590b7532434ed2196/src/index.ts#L164)

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

#### Parameters

##### parameters

###### fetch

(`customInit?`) => `FetchReturnType`\<`NextResponseJsonType`\>

#### Returns

`Promisable`\<`void`\>
