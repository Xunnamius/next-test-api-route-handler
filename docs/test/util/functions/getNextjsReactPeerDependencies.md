[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / getNextjsReactPeerDependencies

# Function: getNextjsReactPeerDependencies()

> **getNextjsReactPeerDependencies**(`npmInstallNextJsString`): `Promise`\<`string`[]\>

Defined in: [test/util.ts:28](https://github.com/Xunnamius/next-test-api-route-handler/blob/fc0972ebac2c7f073379ab76e95e9fc328afef50/test/util.ts#L28)

Since some versions of Next.js are released with flawed
`package.json::peerDependencies`, sometimes we need to ensure the correct
versions of Next.js's peer dependencies are actually installed.

## Parameters

### npmInstallNextJsString

`string`

For example: `next`, `next@latest`, or `next@15.0.0-rc.1`

## Returns

`Promise`\<`string`[]\>
