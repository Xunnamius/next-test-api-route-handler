[**next-test-api-route-handler**](../README.md) • **Docs**

***

[next-test-api-route-handler](../README.md) / NtarhInit

# Interface: NtarhInit\<NextResponseJsonType\>

## Extended by

- [`NtarhInitAppRouter`](NtarhInitAppRouter.md)
- [`NtarhInitPagesRouter`](NtarhInitPagesRouter.md)

## Type parameters

• **NextResponseJsonType** = `unknown`

## Properties

### rejectOnHandlerError?

> `optional` **rejectOnHandlerError**: `boolean`

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

#### Source

[index.ts:123](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L123)

***

### test()

> **test**: (`parameters`) => [`Promisable`](../type-aliases/Promisable.md)\<`void`\>

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

#### Parameters

• **parameters**

• **parameters.fetch**

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void`\>

#### Source

[index.ts:129](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L129)
