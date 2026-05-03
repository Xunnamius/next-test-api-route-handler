[**next-test-api-route-handler**](../../README.md)

***

[next-test-api-route-handler](../../README.md) / [src](../README.md) / testApiHandler

# Function: testApiHandler()

> **testApiHandler**\<`NextResponseJsonType`\>(`__namedParameters`): `Promise`\<`void`\>

Defined in: [src/index.ts:312](https://github.com/Xunnamius/next-test-api-route-handler/blob/5d434cf87052de7aa75040c2b2f60b27369fecfb/src/index.ts#L312)

Uses Next's internal `apiResolver` (for Pages Router) or an
`AppRouteRouteModule` instance (for App Router) to execute api route handlers
in a Next-like testing environment.

## Type Parameters

### NextResponseJsonType

`NextResponseJsonType` = `any`

## Parameters

### \_\_namedParameters

[`NtarhInitAppRouter`](../interfaces/NtarhInitAppRouter.md)\<`NextResponseJsonType`\> \| [`NtarhInitPagesRouter`](../interfaces/NtarhInitPagesRouter.md)\<`NextResponseJsonType`\>

## Returns

`Promise`\<`void`\>
