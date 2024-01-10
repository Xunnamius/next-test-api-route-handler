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

[index.ts:59](https://github.com/Xunnamius/next-test-api-route-handler/blob/ceddb7d/src/index.ts#L59)

___

### Promisable

Ƭ **Promisable**\<`Promised`\>: `Promised` \| `Promise`\<`Promised`\>

#### Type parameters

| Name |
| :------ |
| `Promised` |

#### Defined in

[index.ts:54](https://github.com/Xunnamius/next-test-api-route-handler/blob/ceddb7d/src/index.ts#L54)

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

[index.ts:257](https://github.com/Xunnamius/next-test-api-route-handler/blob/ceddb7d/src/index.ts#L257)
