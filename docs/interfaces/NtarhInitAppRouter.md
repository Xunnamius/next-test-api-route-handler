[**next-test-api-route-handler**](../README.md) • **Docs**

***

[next-test-api-route-handler](../README.md) / NtarhInitAppRouter

# Interface: NtarhInitAppRouter\<NextResponseJsonType\>

The parameters expected by `testApiHandler` when using `appHandler`.

## Extends

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

## Type parameters

• **NextResponseJsonType** = `unknown`

## Properties

### appHandler

> **appHandler**: `Omit`\<`AppRouteUserlandModule`, `"GET"` \| `"HEAD"` \| `"OPTIONS"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"PATCH"`\> & `object`

The actual App Router route handler under test. It should be an object
containing one or more async functions named for valid HTTP methods and/or
a valid configuration option. See [the Next.js
documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
for details.

#### Type declaration

##### DELETE

> **DELETE**: `undefined` \| (`req`, `context`?) => `any`

##### GET

> **GET**: `undefined` \| (`req`, `context`?) => `any`

##### HEAD

> **HEAD**: `undefined` \| (`req`, `context`?) => `any`

##### OPTIONS

> **OPTIONS**: `undefined` \| (`req`, `context`?) => `any`

##### PATCH

> **PATCH**: `undefined` \| (`req`, `context`?) => `any`

##### POST

> **POST**: `undefined` \| (`req`, `context`?) => `any`

##### PUT

> **PUT**: `undefined` \| (`req`, `context`?) => `any`

#### Source

[index.ts:146](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L146)

***

### pagesHandler?

> `optional` **pagesHandler**: `undefined`

#### Source

[index.ts:155](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L155)

***

### params?

> `optional` **params**: `Record`\<`string`, `string` \| `string`[]\>

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled by `Request` automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

#### Source

[index.ts:165](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L165)

***

### paramsPatcher()?

> `optional` **paramsPatcher**: (`params`) => [`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled by `Request` automatically.

#### Parameters

• **params**: `Record`\<`string`, `string` \| `string`[]\>

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

#### Source

[index.ts:175](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L175)

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

#### Source

[index.ts:123](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L123)

***

### requestPatcher()?

> `optional` **requestPatcher**: (`request`) => [`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Request`\>

A function that receives a `NextRequest` object and returns a `Request`
instance. Use this function to edit the request _before_ it's injected
into the handler.

If the returned `Request` instance is not also an instance of
`NextRequest`, it will be wrapped with `NextRequest`, e.g. `new
NextRequest(returnedRequest, { ... })`.

#### Parameters

• **request**: `NextRequest`

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Request`\>

#### Source

[index.ts:188](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L188)

***

### responsePatcher()?

> `optional` **responsePatcher**: (`res`) => [`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Response`\>

A function that receives the `Response` object returned from `appHandler`
and returns a `Response` instance. Use this function to edit the response
_after_ your handler runs but _before_ it's processed by the server.

Note that `responsePatcher` is called even in the case of exceptions,
including _unhandled exceptions_ (for which Next.js returns an HTTP 500
response). The only time `responsePatcher` is not called is when an
unhandled exception occurs _and_ `rejectOnHandlerError` is `true`.

#### Parameters

• **res**: `Response`

#### Returns

[`Promisable`](../type-aliases/Promisable.md)\<`void` \| `Response`\>

#### Source

[index.ts:201](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L201)

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

#### Source

[index.ts:129](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L129)

***

### url?

> `optional` **url**: `string`

`url: 'your-url'` is shorthand for `requestPatcher: (request) => new
NextRequest('your-url', request)`

#### Source

[index.ts:206](https://github.com/Xunnamius/next-test-api-route-handler/blob/43eec5385cb48f619257324a2fe1b54d29748ff1/src/index.ts#L206)
