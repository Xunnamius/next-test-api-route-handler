[next-test-api-route-handler](../README.md) / NtarhInitPagesRouter

# Interface: NtarhInitPagesRouter\<NextResponseJsonType\>

The parameters expected by `testApiHandler` when using `pagesHandler`.

## Type parameters

| Name | Type |
| :------ | :------ |
| `NextResponseJsonType` | `unknown` |

## Hierarchy

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

  ↳ **`NtarhInitPagesRouter`**

## Table of contents

### Properties

- [appHandler](NtarhInitPagesRouter.md#apphandler)
- [pagesHandler](NtarhInitPagesRouter.md#pageshandler)
- [params](NtarhInitPagesRouter.md#params)
- [paramsPatcher](NtarhInitPagesRouter.md#paramspatcher)
- [rejectOnHandlerError](NtarhInitPagesRouter.md#rejectonhandlererror)
- [requestPatcher](NtarhInitPagesRouter.md#requestpatcher)
- [responsePatcher](NtarhInitPagesRouter.md#responsepatcher)
- [test](NtarhInitPagesRouter.md#test)
- [url](NtarhInitPagesRouter.md#url)

## Properties

### appHandler

• `Optional` **appHandler**: `undefined`

#### Defined in

[index.ts:219](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L219)

___

### pagesHandler

• **pagesHandler**: `NextApiHandler`\<`any`\> \| \{ `default`: `NextApiHandler`\<`any`\>  }

The actual Pages Router route handler under test. It should be an async
function that accepts `NextApiRequest` and `NextApiResult` objects (in
that order) as its two parameters.

Note that type checking for `res.send` and similar methods was retired in
NTARH@4. Only the `response.json` method returned by NTARH's fetch wrapper
will have a typed result.

#### Defined in

[index.ts:218](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L218)

___

### params

• `Optional` **params**: `Record`\<`string`, `unknown`\>

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

#### Defined in

[index.ts:229](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L229)

___

### paramsPatcher

• `Optional` **paramsPatcher**: (`params`: `Record`\<`string`, `unknown`\>) => [`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `unknown`\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled automatically.

#### Type declaration

▸ (`params`): [`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `unknown`\>\>

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled automatically.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Record`\<`string`, `unknown`\> |

##### Returns

[`Promisable`](../README.md#promisable)\<`void` \| `Record`\<`string`, `unknown`\>\>

#### Defined in

[index.ts:239](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L239)

___

### rejectOnHandlerError

• `Optional` **rejectOnHandlerError**: `boolean`

If `false`, errors thrown from within a handler are kicked up to Next.js's
resolver to deal with, which is what would happen in production. If `true`,
the [testApiHandler](../README.md#testapihandler) function will reject immediately instead.

You should use `rejectOnHandlerError` whenever you want to manually handle
an error that bubbles up from your handler (which is especially true if
you're using `expect` _within_ your handler) or when you notice a false
negative despite exceptions being thrown.

**`Default`**

```ts
false
```

#### Inherited from

[NtarhInit](NtarhInit.md).[rejectOnHandlerError](NtarhInit.md#rejectonhandlererror)

#### Defined in

[index.ts:118](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L118)

___

### requestPatcher

• `Optional` **requestPatcher**: (`request`: `IncomingMessage`) => [`Promisable`](../README.md#promisable)\<`void`\>

A function that receives an `IncomingMessage` object. Use this function
to edit the request _before_ it's injected into the handler.

**Note: all replacement `IncomingMessage.header` names must be
lowercase.**

#### Type declaration

▸ (`request`): [`Promisable`](../README.md#promisable)\<`void`\>

A function that receives an `IncomingMessage` object. Use this function
to edit the request _before_ it's injected into the handler.

**Note: all replacement `IncomingMessage.header` names must be
lowercase.**

##### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `IncomingMessage` |

##### Returns

[`Promisable`](../README.md#promisable)\<`void`\>

#### Defined in

[index.ts:250](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L250)

___

### responsePatcher

• `Optional` **responsePatcher**: (`res`: `ServerResponse`\<`IncomingMessage`\>) => [`Promisable`](../README.md#promisable)\<`void`\>

A function that receives a `ServerResponse` object. Use this function
to edit the response _before_ it's injected into the handler.

#### Type declaration

▸ (`res`): [`Promisable`](../README.md#promisable)\<`void`\>

A function that receives a `ServerResponse` object. Use this function
to edit the response _before_ it's injected into the handler.

##### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `ServerResponse`\<`IncomingMessage`\> |

##### Returns

[`Promisable`](../README.md#promisable)\<`void`\>

#### Defined in

[index.ts:255](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L255)

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

[index.ts:124](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L124)

___

### url

• `Optional` **url**: `string`

`url: 'your-url'` is shorthand for `requestPatcher: (req) => { req.url =
'your-url' }`

#### Defined in

[index.ts:260](https://github.com/Xunnamius/next-test-api-route-handler/blob/5c32fd0/src/index.ts#L260)
