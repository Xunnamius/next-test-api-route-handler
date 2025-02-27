[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / describeRootFixture

# Function: describeRootFixture()

> **describeRootFixture**(): [`DescribeRootFixture`](../type-aliases/DescribeRootFixture.md)

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/describe-root.d.ts:46

This fixture outputs debug information describing the runtime environment.

This fixture is treated specially in two ways:

1. If a fixture with the name `'describe-root'` is not included in the
   `fixtures` array parameter of `withMockedFixtures`, _this fixture will be
   automatically appended_ to said array.

2. _This fixture will always run_, even when an error occurs in an earlier
   fixture.

## Returns

[`DescribeRootFixture`](../type-aliases/DescribeRootFixture.md)
