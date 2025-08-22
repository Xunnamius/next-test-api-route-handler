[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / NtarhInitPagesRouter

# Interface: NtarhInitPagesRouter\<NextResponseJsonType\>

Defined in: [src/index.ts:250](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L250)

The parameters expected by `testApiHandler` when using `pagesHandler`.

## Extends

- [`NtarhInit`](NtarhInit.md)\<`NextResponseJsonType`\>

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `unknown`

## Properties

### appHandler?

> `optional` **appHandler**: `undefined`

Defined in: [src/index.ts:262](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L262)

***

### pagesHandler

> **pagesHandler**: `NextApiHandler` \| \{ `default`: `NextApiHandler`; \}

Defined in: [src/index.ts:261](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L261)

The actual Pages Router route handler under test. It should be an async
function that accepts `NextApiRequest` and `NextApiResult` objects (in
that order) as its two parameters.

Note that type checking for `res.send` and similar methods was retired in
NTARH@4. Only the `response.json` method returned by NTARH's fetch wrapper
will have a typed result.

***

### params?

> `optional` **params**: `Record`\<`string`, `unknown`\>

Defined in: [src/index.ts:272](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L272)

`params` is passed directly to the handler and represents processed dynamic
routes. This should not be confused with query string parsing, which is
handled automatically.

`params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
params.id = 'some-id' }`. This is useful for quickly setting many params at
once.

***

### paramsPatcher()?

> `optional` **paramsPatcher**: (`params`) => `Promisable`\<`void` \| `Record`\<`string`, `unknown`\>\>

Defined in: [src/index.ts:282](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L282)

A function that receives `params`, an object representing "processed"
dynamic route parameters. Modifications to `params` are passed directly to
the handler. You can also return a custom object from this function which
will replace `params` entirely.

Parameter patching should not be confused with query string parsing, which
is handled automatically.

#### Parameters

##### params

`Record`\<`string`, `unknown`\>

#### Returns

`Promisable`\<`void` \| `Record`\<`string`, `unknown`\>\>

***

### rejectOnHandlerError?

> `optional` **rejectOnHandlerError**: `boolean`

Defined in: [src/index.ts:157](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L157)

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

> `optional` **requestPatcher**: (`request`) => `Promisable`\<`void`\>

Defined in: [src/index.ts:292](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L292)

A function that receives an `IncomingMessage` object. Use this function
to edit the request _before_ it's injected into the handler.

**Note: all replacement `IncomingMessage.header` names must be
lowercase.**

#### Parameters

##### request

`IncomingMessage`

#### Returns

`Promisable`\<`void`\>

***

### responsePatcher()?

> `optional` **responsePatcher**: (`res`) => `Promisable`\<`void`\>

Defined in: [src/index.ts:297](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L297)

A function that receives a `ServerResponse` object. Use this function
to edit the response _before_ it's injected into the handler.

#### Parameters

##### res

`ServerResponse`

#### Returns

`Promisable`\<`void`\>

***

### test()

> **test**: (`parameters`) => `Promisable`\<`void`\>

Defined in: [src/index.ts:163](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L163)

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

Defined in: [src/index.ts:302](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/src/index.ts#L302)

`url: 'your-url'` is shorthand for `requestPatcher: (req) => { req.url =
'your-url' }`
