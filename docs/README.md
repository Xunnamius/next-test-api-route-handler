## Table of contents

### Functions

- [testApiHandler][1]

## Functions

### testApiHandler

▸ **testApiHandler**<`NextApiHandlerType`>(`__namedParameters`):
`Promise`<`void`>

Uses Next's internal `apiResolver` to execute api route handlers in a Next-like
testing environment.

`requestPatcher/responsePatcher` are functions that receive an IncomingMessage
and ServerResponse object respectively. Use these functions to edit the request
and response before they're injected into the api handler.

`params` are passed directly to the api handler and represent processed dynamic
routes. This should not be confused with query string parsing, which is handled
automatically.

`handler` is the actual api handler under test. It should be an async function
that accepts NextApiRequest and NextApiResult objects (in that order) as its two
parameters.

`test` should be a function that returns a promise (or async) where test
assertions can be run. This function receives one parameter: fetch, which is
unfetch's `fetch(...)` function but with the first parameter omitted.

#### Type parameters

| Name                 | Type      |
| :------------------- | :-------- |
| `NextApiHandlerType` | `unknown` |

#### Parameters

| Name                                 | Type                                                                                         |
| :----------------------------------- | :------------------------------------------------------------------------------------------- |
| `__namedParameters`                  | `Object`                                                                                     |
| `__namedParameters.handler`          | `NextApiHandler`<`NextApiHandlerType`>                                                       |
| `__namedParameters.params?`          | `Record`<`string`, `string` \| `string`[]>                                                   |
| `__namedParameters.url?`             | `string`                                                                                     |
| `__namedParameters.paramsPatcher?`   | (`params`: `Record`<`string`, `unknown`>) => `void`                                          |
| `__namedParameters.requestPatcher?`  | (`req`: `IncomingMessage`) => `void`                                                         |
| `__namedParameters.responsePatcher?` | (`res`: `ServerResponse`) => `void`                                                          |
| `__namedParameters.test`             | (`obj`: { `fetch`: (`init?`: `RequestInit`) => `Promise`<`Response`> }) => `Promise`<`void`> |

#### Returns

`Promise`<`void`>

#### Defined in

[index.ts:31][2]

[1]: README.md#testapihandler
[2]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/e5c6a99/src/index.ts#L31
