[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / GitRepositoryFixtureOptions

# Type Alias: GitRepositoryFixtureOptions

> **GitRepositoryFixtureOptions** = `Tagged`\<\{ `setupGit?`: (`git`) => `Promisable`\<`void`\>; \}, *typeof* [`gitRepositoryFixtureName`](../variables/gitRepositoryFixtureName.md)\>

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/git-repository.d.ts:20

Contains any additional options properties this fixture expects or allows.

This type is Tagged so that it can be differentiated from `XContext`
types provided by other fixtures, even when they contain the same keys (or no
keys).

## See

[gitRepositoryFixture](../functions/gitRepositoryFixture.md)
