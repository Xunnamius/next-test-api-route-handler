[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / getNextjsReactPeerDependencies

# Function: getNextjsReactPeerDependencies()

> **getNextjsReactPeerDependencies**(`npmInstallNextJsString`): `Promise`\<`string`[]\>

Defined in: [test/util.ts:28](https://github.com/Xunnamius/next-test-api-route-handler/blob/e9d6c65a2563c98f0367b0ff43cd7ea952acf10a/test/util.ts#L28)

Since some versions of Next.js are released with flawed
`package.json::peerDependencies`, sometimes we need to ensure the correct
versions of Next.js's peer dependencies are actually installed.

## Parameters

### npmInstallNextJsString

`string`

For example: `next`, `next@latest`, or `next@15.0.0-rc.1`

## Returns

`Promise`\<`string`[]\>
