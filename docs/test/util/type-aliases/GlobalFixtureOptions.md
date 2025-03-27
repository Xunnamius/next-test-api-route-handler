[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / GlobalFixtureOptions

# Type Alias: GlobalFixtureOptions

> **GlobalFixtureOptions** = `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:18

The options available to every fixture.

## Properties

### identifier?

> `optional` **identifier**: `string`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:28

The identifier used in various places, including when creating the dummy
root directory and when describing the test environment in output text.

Must be alphanumeric, optionally including hyphens and underscores. Every
other character will be replaced with a hyphen.

#### Default

```ts
"fixtures-test"
```

***

### initialVirtualFiles?

> `optional` **initialVirtualFiles**: `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:57

An object describing "virtual files" represented by mappings between
non-existent RelativePaths and their theoretical (immutable)
contents. These paths are relative to the dummy root directory.

Non-string contents will be stringified via `JSON.stringify(entry,
undefined, 2)`.

Note that some fixtures use the `initialVirtualFiles` option to lookup
certain values, such as picking out keys from a virtual `package.json`
file.

Also note that **these virtual files are not created on the filesystem
automatically!**

To have the virtual files described in `initialVirtualFiles` actually
written out to the filesystem (relative to the dummy root directory), you
must use [dummyFilesFixture](../functions/dummyFilesFixture.md).

Consider also `dummyDirectoriesFixture` for writing out directories to the
filesystem using the `initialDirectories` option.

#### Index Signature

\[`filePath`: `string` \| `RelativePath`\]: `unknown`

***

### performCleanup

> **performCleanup**: `boolean`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:34

When `true`, the dummy root directory will be deleted after the test
complete (regardless of the outcome). Set `performCleanup` to `false` to
disable this behavior.
