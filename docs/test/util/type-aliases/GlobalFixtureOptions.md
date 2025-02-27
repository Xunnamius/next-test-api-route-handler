[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / GlobalFixtureOptions

# Type Alias: GlobalFixtureOptions

> **GlobalFixtureOptions**: `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-fixture/dist/packages/test-mock-fixture/src/types/options.d.ts:18

The options available to every fixture.

## Type declaration

### identifier?

> `optional` **identifier**: `string`

The identifier used in various places, including when creating the dummy
root directory and when describing the test environment in output text.

Must be alphanumeric, optionally including hyphens and underscores. Every
other character will be replaced with a hyphen.

#### Default

```ts
"fixtures-test"
```

### initialVirtualFiles?

> `optional` **initialVirtualFiles**: `object`

An object describing "virtual files" represented by mappings between
non-existent RelativePaths and their theoretical (immutable)
contents. These paths are relative to the dummy root directory.

Some fixtures use the `initialVirtualFiles` option to lookup certain
values, such as picking out keys from a virtual `package.json` file.

**These virtual files are not created on the filesystem automatically!**

To have the virtual files described in `initialVirtualFiles` actually
written out to the filesystem (relative to the dummy root directory), you
must use [dummyFilesFixture](../functions/dummyFilesFixture.md).

Consider also `dummyDirectoriesFixture` for writing out directories to the
filesystem using the `initialDirectories` option.

#### Index Signature

\[`filePath`: `string` \| `RelativePath`\]: `string`

### performCleanup

> **performCleanup**: `boolean`

When `true`, the dummy root directory will be deleted after the test
complete (regardless of the outcome). Set `performCleanup` to `false` to
disable this behavior.
