[**next-test-api-route-handler**](../README.md) • **Docs**

***

[next-test-api-route-handler](../README.md) / NtarhInitPagesRouter

# Interface: NtarhInitPagesRouter\<NextResponseJsonType\>

The parameters expected by `testApiHandler` when using `pagesHandler`.

## Extends

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

## Type Parameters

• **NextResponseJsonType** = `unknown`

## Properties

### appHandler?

> `optional` **appHandler**: `undefined`

#### Defined in

[index.ts:243](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L243)

***

### pagesHandler

> **pagesHandler**: `NextApiHandler`\<`any`\> \| `object`

The actual Pages Router route handler under test. It should be an async
function that accepts `NextApiRequest` and `NextApiResult` objects (in
that order) as its two parameters.

Note that type checking for `res.send` and similar methods was retired in
NTARH@4. Only the `response.json` method returned by NTARH's fetch wrapper
will have a typed result.

#### Defined in

[index.ts:242](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L242)

***

### params?

> `optional` **params**: `Record`\<`string`, `unknown`\>

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

#### Defined in

[index.ts:253](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L253)

***

### paramsPatcher()?

> `optional` **paramsPatcher**: (`params`) => [`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Record`\<`string`, `unknown`\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled automatically.

#### Parameters

• **params**: `Record`\<`string`, `unknown`\>

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Record`\<`string`, `unknown`\>\>

#### Defined in

[index.ts:263](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L263)

***

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

#### Inherited from

[`NtarhInit`](NtarhInit.md).[`rejectOnHandlerError`](NtarhInit.md#rejectonhandlererror)

#### Defined in

[index.ts:137](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L137)

***

### requestPatcher()?

> `optional` **requestPatcher**: (`request`) => [`Promisable`](../type-aliases/Promisable.md)\<`void`\>

A function that receives an `IncomingMessage` object. Use this function
to edit the request _before_ it's injected into the handler.

**Note: all replacement `IncomingMessage.header` names must be
lowercase.**

#### Parameters

• **request**: `IncomingMessage`

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void`\>

#### Defined in

[index.ts:274](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L274)

***

### responsePatcher()?

> `optional` **responsePatcher**: (`res`) => [`Promisable`](../type-aliases/Promisable.md)\<`void`\>

A function that receives a `ServerResponse` object. Use this function
to edit the response _before_ it's injected into the handler.

#### Parameters

• **res**: `ServerResponse`\<`IncomingMessage`\>

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void`\>

#### Defined in

[index.ts:279](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L279)

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

#### Inherited from

[`NtarhInit`](NtarhInit.md).[`test`](NtarhInit.md#test)

#### Defined in

[index.ts:143](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L143)

***

### url?

> `optional` **url**: `string`

`url: 'your-url'` is shorthand for `requestPatcher: (req) => { req.url =
'your-url' }`

#### Defined in

[index.ts:284](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L284)
