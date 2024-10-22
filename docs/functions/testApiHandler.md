[**next-test-api-route-handler**](../README.md) • **Docs**

***

[next-test-api-route-handler](../README.md) / testApiHandler

# Function: testApiHandler()

> **testApiHandler**\<`NextResponseJsonType`\>(`__namedParameters`): `Promise`\<`void`\>

Uses Next's internal `apiResolver` (for Pages Router) or an
`AppRouteRouteModule` instance (for App Router) to execute api route handlers
in a Next-like testing environment.

## Type Parameters

• **NextResponseJsonType** = `any`

## Parameters

• **\_\_namedParameters**: [`NtarhInitAppRouter`](../interfaces/NtarhInitAppRouter.md)\<`NextResponseJsonType`\> \| [`NtarhInitPagesRouter`](../interfaces/NtarhInitPagesRouter.md)\<`NextResponseJsonType`\>

## Returns

`Promise`\<`void`\>

## Defined in

[index.ts:292](https://github.com/Xunnamius/next-test-api-route-handler/blob/e773623b6be329996aafd723ed43e973bdc65aa6/src/index.ts#L292)
