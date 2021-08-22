## Table of contents

### Type aliases

- [Parameters][1]

### Functions

- [testApiHandler][2]

## Type aliases

### Parameters

Ƭ **Parameters**<`NextApiHandlerType`>: `Object`

The parameters expected by `testApiHandler`.

#### Type parameters

| Name                 | Type      |
| :------------------- | :-------- |
| `NextApiHandlerType` | `unknown` |

#### Type declaration

| Name               | Type                                                                                         | Description                                                                                                                                                                                                                                                                                                                               |
| :----------------- | :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handler`          | `NextApiHandler`<`NextApiHandlerType`>                                                       | The actual handler under test. It should be an async function that accepts `NextApiRequest` and `NextApiResult` objects (in that order) as its two parameters.                                                                                                                                                                            |
| `params?`          | `Record`<`string`, `string` \| `string`\[]>                                                  | `params` is passed directly to the handler and represent processed dynamic routes. This should not be confused with query string parsing, which is handled automatically. `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => (params.id = 'some-id')`. This is most useful for quickly setting many params at once. |
| `url?`             | `string`                                                                                     | `url: 'your-url'` is shorthand for `requestPatcher: (req) => (req.url = 'your-url')`                                                                                                                                                                                                                                                      |
| `paramsPatcher?`   | (`params`: `Record`<`string`, `unknown`>) => `void`                                          | -                                                                                                                                                                                                                                                                                                                                         |
| `requestPatcher?`  | (`req`: `IncomingMessage`) => `void`                                                         | -                                                                                                                                                                                                                                                                                                                                         |
| `responsePatcher?` | (`res`: `ServerResponse`) => `void`                                                          | -                                                                                                                                                                                                                                                                                                                                         |
| `test`             | (`obj`: { `fetch`: (`init?`: `RequestInit`) => `Promise`<`Response`> }) => `Promise`<`void`> | -                                                                                                                                                                                                                                                                                                                                         |

#### Defined in

[index.ts:16][3]

## Functions

### testApiHandler

▸ **testApiHandler**<`NextApiHandlerType`>(`(destructured)`): `Promise`<`void`>

Uses Next's internal `apiResolver` to execute api route handlers in a Next-like
testing environment.

#### Type parameters

| Name                 | Type      |
| :------------------- | :-------- |
| `NextApiHandlerType` | `unknown` |

#### Parameters

| Name             | Type                                    |
| :--------------- | :-------------------------------------- |
| `(destructured)` | [`Parameters`][1]<`NextApiHandlerType`> |

#### Returns

`Promise`<`void`>

#### Defined in

[index.ts:70][4]

[1]: README.md#parameters
[2]: README.md#testapihandler
[3]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/631f824/src/index.ts#L16
[4]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/631f824/src/index.ts#L70
