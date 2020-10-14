# next-test-api-route-handler

## Index

### Functions

* [testApiHandler](README.md#testapihandler)

## Functions

### testApiHandler

▸ **testApiHandler**({ handler: (req: NextApiRequest,res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: { fetch: (init?: RequestInit) => ReturnType\<*typeof* fetch>  }) => Promise\<void>  }): Promise\<void>

*Defined in [index.ts:31](https://github.com/Xunnamius/next-test-api-route-handler/blob/cfd1c8c/src/index.ts#L31)*

Uses Next's internal `apiResolver` to execute api route handlers in a
Next-like testing environment.

#### Parameters:

Name | Type |
------ | ------ |
`(destructured)` | { handler: (req: NextApiRequest,res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: { fetch: (init?: RequestInit) => ReturnType\<*typeof* fetch>  }) => Promise\<void>  } |

**Returns:** Promise\<void>
