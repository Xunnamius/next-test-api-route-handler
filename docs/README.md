# next-test-api-route-handler

## Index

### Functions

* [testApiHandler](README.md#testapihandler)

## Functions

### testApiHandler

▸ **testApiHandler**({ handler: (req: NextApiRequest,res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: TestParams) => Promise\<void>  }): Promise\<void>

*Defined in [index.ts:30](https://github.com/Xunnamius/next-test-endpoint/blob/2fbf44d/src/index.ts#L30)*

Uses Next's internal `apiResolver` to execute api route handlers in a
Next-like testing environment.

#### Parameters:

Name | Type |
------ | ------ |
`(destructured)` | { handler: (req: NextApiRequest,res: NextApiResponse) => Promise\<void> ; params: undefined \| {} ; requestPatcher: undefined \| (req: IncomingMessage) => void ; responsePatcher: undefined \| (res: ServerResponse) => void ; test: (obj: TestParams) => Promise\<void>  } |

**Returns:** Promise\<void>
