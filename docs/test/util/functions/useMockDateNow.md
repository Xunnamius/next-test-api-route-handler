[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / useMockDateNow

# Function: useMockDateNow()

> **useMockDateNow**(`options?`): `void`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:200

Sets up a Jest spy on the `Date` object's `now` method such that it returns
`mockNow` or `mockDateNowMs` (default) rather than the actual date. If you
want to restore the mock, you will have to do so manually (or use Jest
configuration to do so automatically).

This is useful when testing against dummy data containing values derived from
the current time (i.e. unix epoch).

## Parameters

### options?

#### mockNow?

`number`

## Returns

`void`
