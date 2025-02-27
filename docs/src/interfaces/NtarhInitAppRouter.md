[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / NtarhInitAppRouter

# Interface: NtarhInitAppRouter\<NextResponseJsonType\>

Defined in: [src/index.ts:149](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L149)

The parameters expected by `testApiHandler` when using `appHandler`.

## Extends

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

## Type Parameters

• **NextResponseJsonType** = `unknown`

## Properties

### appHandler

> **appHandler**: `Partial`\<`Omit`\<`AppRouteUserlandModule`, `"GET"` \| `"HEAD"` \| `"OPTIONS"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"PATCH"`\> & `object`\>

Defined in: [src/index.ts:158](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L158)

The actual App Router route handler under test. It should be an object
containing one or more async functions named for valid HTTP methods and/or
a valid configuration option. See [the Next.js
documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
for details.

***

### pagesHandler?

> `optional` **pagesHandler**: `undefined`

Defined in: [src/index.ts:169](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L169)

***

### params?

> `optional` **params**: `Record`\<`string`, `string` \| `string`[]\>

Defined in: [src/index.ts:179](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L179)

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled by `Request` automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

***

### paramsPatcher()?

> `optional` **paramsPatcher**: (`params`) => `Promisable`\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

Defined in: [src/index.ts:189](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L189)

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled by `Request` automatically.

#### Parameters

##### params

`Record`\<`string`, `string` \| `string`[]\>

#### Returns

`Promisable`\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

***

### rejectOnHandlerError?

> `optional` **rejectOnHandlerError**: `boolean`

Defined in: [src/index.ts:132](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L132)

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

***

### requestPatcher()?

> `optional` **requestPatcher**: (`request`) => `Promisable`\<`void` \| `Request`\>

Defined in: [src/index.ts:201](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L201)

A function that receives a `NextRequest` object and returns a `Request`
instance. Use this function to edit the request _before_ it's injected
into the handler.

If the returned `Request` instance is not also an instance of
`NextRequest`, it will be wrapped with `NextRequest`, e.g. `new
NextRequest(returnedRequest, { ... })`.

#### Parameters

##### request

`NextRequest`

#### Returns

`Promisable`\<`void` \| `Request`\>

***

### responsePatcher()?

> `optional` **responsePatcher**: (`res`) => `Promisable`\<`void` \| `Response`\>

Defined in: [src/index.ts:214](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L214)

A function that receives the `Response` object returned from `appHandler`
and returns a `Response` instance. Use this function to edit the response
_after_ your handler runs but _before_ it's processed by the server.

Note that `responsePatcher` is called even in the case of exceptions,
including _unhandled exceptions_ (for which Next.js returns an HTTP 500
response). The only time `responsePatcher` is not called is when an
unhandled exception occurs _and_ `rejectOnHandlerError` is `true`.

#### Parameters

##### res

`Response`

#### Returns

`Promisable`\<`void` \| `Response`\>

***

### test()

> **test**: (`parameters`) => `Promisable`\<`void`\>

Defined in: [src/index.ts:138](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L138)

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

#### Parameters

##### parameters

###### fetch

(`customInit`?) => `FetchReturnType`\<`NextResponseJsonType`\>

#### Returns

`Promisable`\<`void`\>

#### Inherited from

[`NtarhInit`](NtarhInit.md).[`test`](NtarhInit.md#test)

***

### url?

> `optional` **url**: `string`

Defined in: [src/index.ts:219](https://github.com/Xunnamius/next-test-api-route-handler/blob/85e69e8c9f0f5d099e62128bf945b508df618dd6/src/index.ts#L219)

`url: 'your-url'` is shorthand for `requestPatcher: (request) => new
NextRequest('your-url', request)`
