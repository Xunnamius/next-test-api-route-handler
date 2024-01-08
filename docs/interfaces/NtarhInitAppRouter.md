[next-test-api-route-handler](../README.md) / NtarhInitAppRouter

# Interface: NtarhInitAppRouter\<NextResponseJsonType\>

The parameters expected by `testApiHandler` when using `appHandler`.

## Type parameters

| Name | Type |
| :------ | :------ |
| `NextResponseJsonType` | `unknown` |

## Hierarchy

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

  ↳ **`NtarhInitAppRouter`**

## Table of contents

### Properties

- [appHandler](NtarhInitAppRouter.md#apphandler)
- [pagesHandler](NtarhInitAppRouter.md#pageshandler)
- [params](NtarhInitAppRouter.md#params)
- [paramsPatcher](NtarhInitAppRouter.md#paramspatcher)
- [rejectOnHandlerError](NtarhInitAppRouter.md#rejectonhandlererror)
- [requestPatcher](NtarhInitAppRouter.md#requestpatcher)
- [responsePatcher](NtarhInitAppRouter.md#responsepatcher)
- [test](NtarhInitAppRouter.md#test)
- [url](NtarhInitAppRouter.md#url)

## Properties

### appHandler

• **appHandler**: `AppRouteUserlandModule`

The actual App Router route handler under test. It should be an object
containing one or more async functions named for valid HTTP methods and/or
a valid configuration option. See [the Next.js
documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
for details.

#### Defined in

[index.ts:127](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L127)

___

### pagesHandler

• `Optional` **pagesHandler**: `undefined`

#### Defined in

[index.ts:128](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L128)

___

### params

• `Optional` **params**: `Record`\<`string`, `string` \| `string`[]\>

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled by `Request` automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

#### Defined in

[index.ts:138](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L138)

___

### paramsPatcher

• `Optional` **paramsPatcher**: (`params`: `Record`\<`string`, `string` \| `string`[]\>) => [`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled by `Request` automatically.

#### Type declaration

▸ (`params`): [`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled by `Request` automatically.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Record`\<`string`, `string` \| `string`[]\> |

##### Returns

[`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `string` \| `string`[]\>\>

#### Defined in

[index.ts:148](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L148)

___

### rejectOnHandlerError

• `Optional` **rejectOnHandlerError**: `boolean`

If `false`, errors thrown from within a handler are kicked up to Next.js's
resolver to deal with, which is what would happen in production. If `true`,
the [testApiHandler](../README.md#testapihandler) function will reject immediately instead.

**`Default`**

```ts
false
```

#### Inherited from

[NtarhInit](NtarhInit.md).[rejectOnHandlerError](NtarhInit.md#rejectonhandlererror)

#### Defined in

[index.ts:104](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L104)

___

### requestPatcher

• `Optional` **requestPatcher**: (`request`: `NextRequest`) => [`Promisable`](../README.md#promisable)\<`Request`\>

A function that receives a `NextRequest` object and returns a `Request`
instance. Use this function to edit the request _before_ it's injected
into the handler.

If the returned `Request` instance is not also an instance of
`NextRequest`, it will be wrapped with `NextRequest`, e.g. `new
NextRequest(returnedRequest, { ... })`.

#### Type declaration

▸ (`request`): [`Promisable`](../README.md#promisable)\<`Request`\>

A function that receives a `NextRequest` object and returns a `Request`
instance. Use this function to edit the request _before_ it's injected
into the handler.

If the returned `Request` instance is not also an instance of
`NextRequest`, it will be wrapped with `NextRequest`, e.g. `new
NextRequest(returnedRequest, { ... })`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `NextRequest` |

##### Returns

[`Promisable`](../README.md#promisable)\<`Request`\>

#### Defined in

[index.ts:161](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L161)

___

### responsePatcher

• `Optional` **responsePatcher**: (`res`: `Response`) => [`Promisable`](../README.md#promisable)\<`Response`\>

A function that receives the `Response` object returned from
`appHandler` and returns a `Response` instance. Use this function to
edit the response _after_ your handler runs but _before_ it's processed
by the server.

#### Type declaration

▸ (`res`): [`Promisable`](../README.md#promisable)\<`Response`\>

A function that receives the `Response` object returned from
`appHandler` and returns a `Response` instance. Use this function to
edit the response _after_ your handler runs but _before_ it's processed
by the server.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `Response` |

##### Returns

[`Promisable`](../README.md#promisable)\<`Response`\>

#### Defined in

[index.ts:168](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L168)

___

### test

• **test**: (`parameters`: \{ `fetch`: (`customInit?`: `RequestInit`) => [`FetchReturnType`](../README.md#fetchreturntype)\<`NextResponseJsonType`\>  }) => [`Promisable`](../README.md#promisable)\<`void`\>

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

#### Type declaration

▸ (`parameters`): [`Promisable`](../README.md#promisable)\<`void`\>

`test` is a function that runs your test assertions. This function receives
one destructured parameter: `fetch`, which is equivalent to
`globalThis.fetch` but with the first parameter omitted.

##### Parameters

| Name | Type |
| :------ | :------ |
| `parameters` | `Object` |
| `parameters.fetch` | (`customInit?`: `RequestInit`) => [`FetchReturnType`](../README.md#fetchreturntype)\<`NextResponseJsonType`\> |

##### Returns

[`Promisable`](../README.md#promisable)\<`void`\>

#### Inherited from

[NtarhInit](NtarhInit.md).[test](NtarhInit.md#test)

#### Defined in

[index.ts:110](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L110)

___

### url

• `Optional` **url**: `string`

`url: 'your-url'` is shorthand for `requestPatcher: (req) => new
NextRequest('your-url', req)`

#### Defined in

[index.ts:173](https://github.com/Xunnamius/next-test-api-route-handler/blob/7ba22ec/src/index.ts#L173)
