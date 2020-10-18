# next-test-api-route-handler

## Index

### Functions

* [testApiHandler](README.md#testapihandler)

## Functions

### testApiHandler

▸ **testApiHandler**({ handler: (req: NextApiRequest, res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: { fetch: (init?: RequestInit) => ReturnType\<*typeof* fetch>  }) => Promise\<void>  }): Promise\<void>

*Defined in [index.ts:31](https://github.com/Xunnamius/next-test-api-route-handler/blob/ad2d03c/src/index.ts#L31)*

Uses Next's internal `apiResolver` to execute api route handlers in a
Next-like testing environment.

`requestPatcher/responsePatcher` are functions that receive an
IncomingMessage and ServerResponse object respectively. Use these functions
to edit the request and response before they're injected into the api
handler.

`params` are passed directly to the api handler and represent processed
dynamic routes. This should not be confused with query string parsing, which
is handled automatically.

`handler` is the actual api handler under test. It should be an async
function that accepts NextApiRequest and NextApiResult objects (in that
order) as its two parameters.

`test` should be a function that returns a promise (or async) where test
assertions can be run. This function receives one parameter: fetch, which is
unfetch's `fetch(...)` function but with the first parameter omitted.

#### Parameters:

Name | Type |
------ | ------ |
`(destructured)` | { handler: (req: NextApiRequest, res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: { fetch: (init?: RequestInit) => ReturnType\<*typeof* fetch>  }) => Promise\<void>  } |

**Returns:** Promise\<void>
