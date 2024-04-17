next-test-api-route-handler

# next-test-api-route-handler

## Table of contents

### Interfaces

- [NtarhInit](interfaces/NtarhInit.md)
- [NtarhInitAppRouter](interfaces/NtarhInitAppRouter.md)
- [NtarhInitPagesRouter](interfaces/NtarhInitPagesRouter.md)

### Type Aliases

- [FetchReturnType](README.md#fetchreturntype)
- [Promisable](README.md#promisable)

### Functions

- [testApiHandler](README.md#testapihandler)

## Type Aliases

### FetchReturnType

Ƭ **FetchReturnType**\<`NextResponseJsonType`\>: `Promise`\<`Omit`\<`Response`, ``"json"``\> & \{ `cookies`: `ReturnType`\<`parse`\>[] ; `json`: (...`args`: `Parameters`\<`Response`[``"json"``]\>) => `Promise`\<`NextResponseJsonType`\>  }\>

#### Type parameters

| Name |
| :------ |
| `NextResponseJsonType` |

#### Defined in

[index.ts:100](https://github.com/Xunnamius/next-test-api-route-handler/blob/b7621d6b938246e73d656a1f9516def892b70ed0/src/index.ts#L100)

___

### Promisable

Ƭ **Promisable**\<`Promised`\>: `Promised` \| `Promise`\<`Promised`\>

#### Type parameters

| Name |
| :------ |
| `Promised` |

#### Defined in

[index.ts:95](https://github.com/Xunnamius/next-test-api-route-handler/blob/b7621d6b938246e73d656a1f9516def892b70ed0/src/index.ts#L95)

## Functions

### testApiHandler

▸ **testApiHandler**\<`NextResponseJsonType`\>(`«destructured»`): `Promise`\<`void`\>

Uses Next's internal `apiResolver` (for Pages Router) or an
`AppRouteRouteModule` instance (for App Router) to execute api route handlers
in a Next-like testing environment.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `NextResponseJsonType` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`NtarhInitAppRouter`](interfaces/NtarhInitAppRouter.md)\<`NextResponseJsonType`\> \| [`NtarhInitPagesRouter`](interfaces/NtarhInitPagesRouter.md)\<`NextResponseJsonType`\> |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.ts:273](https://github.com/Xunnamius/next-test-api-route-handler/blob/b7621d6b938246e73d656a1f9516def892b70ed0/src/index.ts#L273)
