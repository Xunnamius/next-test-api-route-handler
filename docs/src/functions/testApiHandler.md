[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / testApiHandler

# Function: testApiHandler()

> **testApiHandler**\<`NextResponseJsonType`\>(`__namedParameters`): `Promise`\<`void`\>

Defined in: [src/index.ts:298](https://github.com/Xunnamius/next-test-api-route-handler/blob/5e0ab38964ad8658174f23f3babfa03f89d957dd/src/index.ts#L298)

Uses Next's internal `apiResolver` (for Pages Router) or an
`AppRouteRouteModule` instance (for App Router) to execute api route handlers
in a Next-like testing environment.

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `any`

## Parameters

### \_\_namedParameters

[`NtarhInitAppRouter`](../interfaces/NtarhInitAppRouter.md)\<`NextResponseJsonType`\> | [`NtarhInitPagesRouter`](../interfaces/NtarhInitPagesRouter.md)\<`NextResponseJsonType`\>

## Returns

`Promise`\<`void`\>
