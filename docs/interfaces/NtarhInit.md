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

You should use `rejectOnHandlerError` whenever you want to manually handle
an error that bubbles up from your handler (which is especially true if
you're using `expect` _within_ your handler) or when you notice a false
negative despite exceptions being thrown.

**`Default`**

```ts
false
```

#### Defined in

[index.ts:117](https://github.com/Xunnamius/next-test-api-route-handler/blob/a04d909/src/index.ts#L117)

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

[index.ts:123](https://github.com/Xunnamius/next-test-api-route-handler/blob/a04d909/src/index.ts#L123)
