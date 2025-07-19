[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / NtarhInitAppRouter

# Interface: NtarhInitAppRouter\<NextResponseJsonType\>

Defined in: [src/index.ts:163](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L163)

The parameters expected by `testApiHandler` when using `appHandler`.

## Extends

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `unknown`

## Properties

### appHandler

> **appHandler**: `Partial`\<`Omit`\<`AppRouteUserlandModule`, keyof `AppRouteHandlers`\> & `{ [key in keyof AppRouteHandlers]?: (req: NextRequest, segmentData?: any) => any }`\>

Defined in: [src/index.ts:172](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L172)

The actual App Router route handler under test. It should be an object
containing one or more async functions named for valid HTTP methods and/or
a valid configuration option. See [the Next.js
documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
for details.

***

### pagesHandler?

> `optional` **pagesHandler**: `undefined`

Defined in: [src/index.ts:183](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L183)

***

### params?

> `optional` **params**: `Record`\<`string`, `string` \| `string`[]\>

Defined in: [src/index.ts:193](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L193)

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled by `Request` automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

***

### paramsPatcher()?

> `optional` **paramsPatcher**: (`params`) => `Promisable`\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

Defined in: [src/index.ts:203](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L203)

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

#### Inherited from

[`NtarhInit`](NtarhInit.md).[`rejectOnHandlerError`](NtarhInit.md#rejectonhandlererror)

***

### requestPatcher()?

> `optional` **requestPatcher**: (`request`) => `Promisable`\<`void` \| `Request`\>

Defined in: [src/index.ts:215](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L215)

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

Defined in: [src/index.ts:228](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L228)

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

#### Inherited from

[`NtarhInit`](NtarhInit.md).[`test`](NtarhInit.md#test)

***

### url?

> `optional` **url**: `string`

Defined in: [src/index.ts:233](https://github.com/Xunnamius/next-test-api-route-handler/blob/2864e3a2c10a43eec470c473dcbdc6e9599cfee3/src/index.ts#L233)

`url: 'your-url'` is shorthand for `requestPatcher: (request) => new
NextRequest('your-url', request)`
