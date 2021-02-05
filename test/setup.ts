import 'jest-extended';

import type { AnyFunction } from '@ergodark/types';

// TODO: add this to @ergodark/types:
export function asMockedFunction<T extends AnyFunction = never>(): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn: T): jest.MockedFunction<T>;
export function asMockedFunction<T extends AnyFunction>(fn?: T): jest.MockedFunction<T> {
  return ((fn || jest.fn()) as unknown) as jest.MockedFunction<T>;
}
