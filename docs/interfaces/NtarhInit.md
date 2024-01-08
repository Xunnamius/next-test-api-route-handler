[next-test-api-route-handler](../README.md) / NtarhInit

# Interface: NtarhInit\<NextResponseJsonType\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `NextResponseJsonType` | `unknown` |

## Hierarchy

- **`NtarhInit`**

  ↳ [`NtarhInitAppRouter`](NtarhInitAppRouter.md)

  ↳ [`NtarhInitPagesRouter`](NtarhInitPagesRouter.md)

## Table of contents

### Properties

- [rejectOnHandlerError](NtarhInit.md#rejectonhandlererror)
- [test](NtarhInit.md#test)

## Properties

### rejectOnHandlerError

• `Optional` **rejectOnHandlerError**: `boolean`

If `false`, errors thrown from within a handler are kicked up to Next.js's
resolver to deal with, which is what would happen in production. If `true`,
the [testApiHandler](../README.md#testapihandler) function will reject immediately instead.

**`Default`**

```ts
false
```

#### Defined in

[index.ts:104](https://github.com/Xunnamius/next-test-api-route-handler/blob/43680d9/src/index.ts#L104)

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

#### Defined in

[index.ts:110](https://github.com/Xunnamius/next-test-api-route-handler/blob/43680d9/src/index.ts#L110)
