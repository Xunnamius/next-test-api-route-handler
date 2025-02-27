[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / DescribeRootFixtureContext

# Type Alias: DescribeRootFixtureContext

> **DescribeRootFixtureContext**: `Tagged`\<`EmptyObject`, *typeof* [`describeRootFixtureName`](../variables/describeRootFixtureName.md)\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/describe-root.d.ts:33

Contains any additional context properties this fixture makes available by
the time its `setup` function has successfully executed.

It is the sole responsibility of this fixture to ensure the context contains
the mentioned properties as described.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same properties
(or no properties).

## See

[describeRootFixture](../functions/describeRootFixture.md)
