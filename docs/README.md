## Table of contents

### Functions

- [testApiHandler][1]

## Functions

### testApiHandler

▸ **testApiHandler**({ `handler`: NextApiHandler ; `params?`: _Record_<_string_,
_unknown_> ; `requestPatcher?`: (`req`: IncomingMessage) => _void_ ;
`responsePatcher?`: (`res`: ServerResponse) => _void_ ; `test`: (`obj`: {
`fetch`: (`init?`: RequestInit) => _ReturnType_<_typeof_ fetch> }) =>
_Promise_<_void_> }): _Promise_<_void_>

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

#### Parameters:

**({ destructured })**: _object_

| Name               | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `handler`          | NextApiHandler                                                                                    |
| `params?`          | _Record_<_string_, _unknown_>                                                                     |
| `requestPatcher?`  | (`req`: IncomingMessage) => _void_                                                                |
| `responsePatcher?` | (`res`: ServerResponse) => _void_                                                                 |
| `test`             | (`obj`: { `fetch`: (`init?`: RequestInit) => _ReturnType_<_typeof_ fetch> }) => _Promise_<_void_> |

**Returns:** _Promise_<_void_>

Defined in: [index.ts:31][2]

[1]: README.md#testapihandler
[2]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/f07fd84/src/index.ts#L31
