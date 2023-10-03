## Table of contents

### Type Aliases

- [FetchReturnType][1]
- [NtarhParameters][2]

### Functions

- [testApiHandler][3]

## Type Aliases

### FetchReturnType

Ƭ **FetchReturnType**<`NextResponseJsonType`>:
`Promise`<`Omit`<`FetchReturnValue`, `"json"`> & { `cookies`:
`ReturnType`\<typeof `parseCookieHeader`>\[] ; `json`: (...`args`:
`Parameters`<`FetchReturnValue`\[`"json"`]>) =>
`Promise`<`NextResponseJsonType`> }>

#### Type parameters

| Name                   |
| :--------------------- |
| `NextResponseJsonType` |

#### Defined in

[index.ts:31][4]

---

### NtarhParameters

Ƭ **NtarhParameters**<`NextResponseJsonType`>: `Object`

The parameters expected by `testApiHandler`.

#### Type parameters

| Name                   | Type      |
| :--------------------- | :-------- |
| `NextResponseJsonType` | `unknown` |

#### Type declaration

| Name                    | Type                                                                                                                           | Description                                                                                                                                                                                                                                         |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler`               | `NextApiHandler`<`NextResponseJsonType`>                                                                                       | The actual handler under test. It should be an async function that accepts `NextApiRequest` and `NextApiResult` objects (in that order) as its two parameters.                                                                                      |
| `params?`               | `Record`<`string`, `string`                                                                                                    | `string`\[]>                                                                                                                                                                                                                                        | `params` is passed directly to the handler and represent processed dynamic routes. This should not be confused with query string parsing, which is handled automatically. `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => (params.id = 'some-id')`. This is most useful for quickly setting many params at once. |
| `paramsPatcher?`        | (`params`: `Record`<`string`, `unknown`>) => `void`                                                                            | A function that receives an object representing "processed" dynamic routes; _modifications_ to this object are passed directly to the handler. This should not be confused with query string parsing, which is handled automatically.               |
| `rejectOnHandlerError?` | `boolean`                                                                                                                      | If `false`, errors thrown from within a handler are kicked up to Next.js's resolver to deal with, which is what would happen in production. Instead, if `true`, the [testApiHandler][3] function will reject immediately. **`Default`** `ts false ` |
| `requestPatcher?`       | (`req`: `IncomingMessage`) => `void`                                                                                           | A function that receives an `IncomingMessage` object. Use this function to edit the request before it's injected into the handler. **Note: all replacement `IncomingMessage.header` names must be lowercase.**                                      |
| `responsePatcher?`      | (`res`: `ServerResponse`) => `void`                                                                                            | A function that receives a `ServerResponse` object. Use this functions to edit the request before it's injected into the handler.                                                                                                                   |
| `test`                  | (`params`: { `fetch`: (`customInit?`: `RequestInit`) => [`FetchReturnType`][1]<`NextResponseJsonType`> }) => `Promise`<`void`> | `test` must be a function that runs your test assertions, returning a promise (or async). This function receives one destructured parameter: `fetch`, which is the unfetch package's `fetch(...)` function but with the first parameter omitted.    |
| `url?`                  | `string`                                                                                                                       | `url: 'your-url'` is shorthand for `requestPatcher: (req) => (req.url = 'your-url')`                                                                                                                                                                |

#### Defined in

[index.ts:87][5]

## Functions

### testApiHandler

▸ **testApiHandler**<`NextResponseJsonType`>(`«destructured»`):
`Promise`<`void`>

Uses Next's internal `apiResolver` to execute api route handlers in a Next-like
testing environment.

#### Type parameters

| Name                   | Type  |
| :--------------------- | :---- |
| `NextResponseJsonType` | `any` |

#### Parameters

| Name             | Type                                           |
| :--------------- | :--------------------------------------------- |
| `«destructured»` | [`NtarhParameters`][2]<`NextResponseJsonType`> |

#### Returns

`Promise`<`void`>

#### Defined in

[index.ts:153][6]

[1]: README.md#fetchreturntype
[2]: README.md#ntarhparameters
[3]: README.md#testapihandler
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/ca1da40/src/index.ts#L31
[5]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/ca1da40/src/index.ts#L87
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/ca1da40/src/index.ts#L153
