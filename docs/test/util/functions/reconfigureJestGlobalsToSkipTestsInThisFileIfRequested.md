[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / reconfigureJestGlobalsToSkipTestsInThisFileIfRequested

# Function: reconfigureJestGlobalsToSkipTestsInThisFileIfRequested()

> **reconfigureJestGlobalsToSkipTestsInThisFileIfRequested**(`targets?`): `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/jest/dist/packages/jest/src/index.d.ts:141

This function replaces Jest's `describe`, `test`, and `it` functions in the
current file with `describe.skip`, `test.skip`, and `it.skip` if
`process.env.SYMBIOTE_TEST_JEST_SKIP_SLOW_TESTS >= 1`. The replaced functions
also have a `noskip` method which are aliases for their respective original
versions.

Essentially, this function changes Jest's execution semantics such that all
tests in a given file are skipped by default. Use the `noskip` method to opt
a test into always being run.

To prevent a file from being executed in its entirety (for example, a test
file with hundreds or thousands of tests that still take a noticeable amount
of time to skip), include the string `-slow.` in the file's name, e.g.
`unit-my-slow.test.ts`, and set
`process.env.SYMBIOTE_TEST_JEST_SKIP_SLOW_TESTS >= 2`.

See the [symbiote wiki](https://github.com/Xunnamius/symbiote/wiki) for more
details.

## Parameters

### targets?

Determines which Jest globals are targeted for reconfiguration.

By default, only `describe` is reconfigured while `test` and `it` are left
alone. This makes it easier to apply `noskip` to a collection of tests, but
sometimes it's prudent to reconfigure the other globals as well.

#### describe?

`boolean`

**Default**

```ts
true
```

#### it?

`boolean`

**Default**

```ts
false
```

#### test?

`boolean`

**Default**

```ts
false
```

## Returns

`object`

### describe

> **describe**: `Describe`

### it

> **it**: `It`

### test

> **test**: `It`
