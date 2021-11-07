## Table of contents

### Type aliases

- [TestParameters][1]

### Functions

- [testApiHandler][2]

## Type aliases

### TestParameters

Ƭ **TestParameters**<`NextResponseJsonType`>: `Object`

The parameters expected by `testApiHandler`.

#### Type parameters

| Name                   | Type      |
| :--------------------- | :-------- |
| `NextResponseJsonType` | `unknown` |

#### Type declaration

| Name               | Type                                                                                                             | Description                                                                                                                                                                                                                                                                                                                               |
| :----------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler`          | `NextApiHandler`<`NextResponseJsonType`>                                                                         | The actual handler under test. It should be an async function that accepts `NextApiRequest` and `NextApiResult` objects (in that order) as its two parameters.                                                                                                                                                                            |
| `params?`          | `Record`<`string`, `string` \| `string`\[]>                                                                      | `params` is passed directly to the handler and represent processed dynamic routes. This should not be confused with query string parsing, which is handled automatically. `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => (params.id = 'some-id')`. This is most useful for quickly setting many params at once. |
| `url?`             | `string`                                                                                                         | `url: 'your-url'` is shorthand for `requestPatcher: (req) => (req.url = 'your-url')`                                                                                                                                                                                                                                                      |
| `paramsPatcher?`   | (`params`: `Record`<`string`, `unknown`>) => `void`                                                              | -                                                                                                                                                                                                                                                                                                                                         |
| `requestPatcher?`  | (`req`: `IncomingMessage`) => `void`                                                                             | -                                                                                                                                                                                                                                                                                                                                         |
| `responsePatcher?` | (`res`: `ServerResponse`) => `void`                                                                              | -                                                                                                                                                                                                                                                                                                                                         |
| `test`             | (`obj`: { `fetch`: (`init?`: `RequestInit`) => `FetchReturnType`<`NextResponseJsonType`> }) => `Promise`<`void`> | -                                                                                                                                                                                                                                                                                                                                         |

#### Defined in

[index.ts:55][3]

## Functions

### testApiHandler

▸ **testApiHandler**<`NextResponseJsonType`>(`(destructured)`):
`Promise`<`void`>

Uses Next's internal `apiResolver` to execute api route handlers in a Next-like
testing environment.

#### Type parameters

| Name                   | Type  |
| :--------------------- | :---- |
| `NextResponseJsonType` | `any` |

#### Parameters

| Name             | Type                                          |
| :--------------- | :-------------------------------------------- |
| `(destructured)` | [`TestParameters`][1]<`NextResponseJsonType`> |

#### Returns

`Promise`<`void`>

#### Defined in

[index.ts:110][4]

[1]: README.md#testparameters
[2]: README.md#testapihandler
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/f46a637/src/index.ts#L55
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/f46a637/src/index.ts#L110
