[**next-test-api-route-handler**](../../../README.md)

***

[next-test-api-route-handler](../../../README.md) / [test/util](../README.md) / MockedOutputSpies

# Type Alias: MockedOutputSpies

> **MockedOutputSpies**: `object`

Defined in: node\_modules/@-xun/symbiote/node\_modules/@-xun/test-mock-output/dist/packages/test-mock-output/src/index.d.ts:26

## Type declaration

### errorSpy

> **errorSpy**: `jest.SpyInstance`

Spies on `globalThis.console.error`.

### infoSpy

> **infoSpy**: `jest.SpyInstance`

Spies on `globalThis.console.info`.

### logSpy

> **logSpy**: `jest.SpyInstance`

Spies on `globalThis.console.log`.

### nodeErrorSpy

> **nodeErrorSpy**: `jest.SpyInstance`

Spies on `require('node:console').error`.

### nodeInfoSpy

> **nodeInfoSpy**: `jest.SpyInstance`

Spies on `require('node:console').info`.

### nodeLogSpy

> **nodeLogSpy**: `jest.SpyInstance`

Spies on `require('node:console').log`.

### nodeWarnSpy

> **nodeWarnSpy**: `jest.SpyInstance`

Spies on `require('node:console').warn`.

### stderrSpy

> **stderrSpy**: `jest.SpyInstance`

Spies on `process.stderr.write`.

### stdoutSpy

> **stdoutSpy**: `jest.SpyInstance`

Spies on `process.stdout.write`.

### warnSpy

> **warnSpy**: `jest.SpyInstance`

Spies on `globalThis.console.warn`.

## See

[withMockedOutput](../functions/withMockedOutput.md)
