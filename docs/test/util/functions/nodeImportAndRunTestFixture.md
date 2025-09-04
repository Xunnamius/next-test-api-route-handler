[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / nodeImportAndRunTestFixture

# Function: nodeImportAndRunTestFixture()

> **nodeImportAndRunTestFixture**(): [`NodeImportAndRunTestFixture`](../type-aliases/NodeImportAndRunTestFixture.md)

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/fixtures/node-import-and-run-test.d.ts:92

This fixture initializes the dummy root directory with an index file under
`src` (described by `initialVirtualFiles`) and then executes it using node
(by default). It is expected that this file imports and tests the package
under test.

The index file must have a path matching the pattern `src/index${extension}`
or `src/index.test${extension}`; it can have any of the following extensions:
`.js`, `.cjs`, `.mjs`, `.jsx`, `.ts`, `.cts`, `.mts`, `.tsx`.

## Returns

[`NodeImportAndRunTestFixture`](../type-aliases/NodeImportAndRunTestFixture.md)
