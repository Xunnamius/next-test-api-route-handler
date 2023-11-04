/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-conditional-in-test */
/* eslint-disable jest/no-untyped-mock-factory */
import { isolatedImport } from './setup';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'node:http';

// * This unit test ensures that NTARH can handle missing resolver dependencies.
// *
// * When updating actualResolverPath:
// *
// * 1. Update actualResolverPath
// * 2. Append previous actualResolverPath to altResolverPaths and update
// *    comments
// * 3. Duplicate current top jest.mock(...) call
// * 4. Change 2nd jest.mock(...) call to be virtual and remove extra key logic
// * 5. Change top jest.mock(...) call to correct path, update path index and
// *    fail letter

// ? The currently correct import path for the apiResolver function.
// * E (-5)
const actualResolverPath = 'next/dist/server/api-utils/node/api-resolver.js';
// ? Defunct import paths listed by discovery date in ascending order. That is:
// ? previous actualResolverPaths should be appended to the end of this array.
const altResolverPaths = [
  // * A (-1)
  'next-server/dist/server/api-utils.js',
  // * B (-2)
  'next/dist/next-server/server/api-utils.js',
  // * C (-3)
  'next/dist/server/api-utils.js',
  // * D (-4)
  'next/dist/server/api-utils/node.js'
];

// ! Only the first mock should be { virtual: false }, the others must be
// ! { virtual: true }

jest.mock('next/dist/server/api-utils/node/api-resolver.js', () => {
  return new Proxy(
    {},
    {
      get: function (_, key) {
        if (mockResolverPaths && mockResolversMetadata) {
          const meta = mockResolversMetadata[mockResolverPaths.at(-5)!];

          if (meta.shouldFail) {
            throw new Error(`fake import failure E`);
          } else if (key == 'apiResolver') {
            return getMockResolver(meta);
          } else if (key == '__esModule') {
            return true;
          } else if (key == 'then') {
            return this;
          }
          // ? Mocks are hoisted above imports, so account for that
        } else throw new Error('proxy E invoked too early');
      }
    }
  );
});

jest.mock(
  'next/dist/server/api-utils/node.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockResolverPaths.at(-4)!];

            if (meta.shouldFail) {
              throw new Error(`fake import failure D`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy D invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

jest.mock(
  'next/dist/server/api-utils.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockResolverPaths.at(-3)!];

            if (meta.shouldFail) {
              throw new Error(`fake import failure C`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy C invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

jest.mock(
  'next/dist/next-server/server/api-utils.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockResolverPaths.at(-2)!];

            if (meta.shouldFail) {
              throw new Error(`fake import failure B`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy B invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

jest.mock(
  'next-server/dist/server/api-utils.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockResolverPaths.at(-1)!];

            if (meta.shouldFail) {
              throw new Error(`fake import failure A`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy A invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

const mockResolverPaths = [...altResolverPaths, actualResolverPath].reverse();

const mockResolversMetadata: Record<
  string,
  {
    called: boolean;
    shouldFail: boolean;
    shouldReturnBadValue: boolean;
  }
> = Object.fromEntries(
  mockResolverPaths.map((path) => [
    path,
    {
      called: false,
      shouldFail: false,
      shouldReturnBadValue: false
    }
  ])
);

const getMockResolver = (meta: {
  called: boolean;
  shouldFail: boolean;
  shouldReturnBadValue: boolean;
}) => {
  return (
    meta.shouldReturnBadValue ||
    ((_: IncomingMessage, res: ServerResponse) => {
      meta.called = true;
      res.statusCode = 200;
      res.end();
      return Promise.resolve();
    })
  );
};

const importNtarh = () =>
  isolatedImport<typeof import('../src/index')>({ path: '../src/index' }).testApiHandler;

const getHandler =
  (status?: number) => async (_: NextApiRequest, res: NextApiResponse) => {
    res.status(status ?? 200).send({ hello: 'world' });
  };

const resetMockResolverFlags = () => {
  Object.values(mockResolversMetadata).forEach((o) => {
    o.called = false;
    o.shouldReturnBadValue = false;
    o.shouldFail = false;
  });
};

const jestExpectationContextFactory =
  (resolverPath: string) => (expectation: boolean) => {
    return `mockResolversMetadata[${resolverPath}].called = ${expectation}`;
  };

afterEach(() => resetMockResolverFlags());

describe('::testApiHandler', () => {
  it('gets apiResolver from wherever it might be located using whatever method is available', async () => {
    expect.hasAssertions();

    // ? Loop over resolver import paths one by one. For each path, only its
    // ? mock resolver should be called; all the others should not be called
    // ? (because they reported back being non-existent, or are tried later).
    for (const [currentIndex, currentResolverPath] of mockResolverPaths.entries()) {
      const previousResolverPaths = mockResolverPaths.slice(0, currentIndex);
      const nextResolverPaths = mockResolverPaths.slice(currentIndex + 1);

      for (const previousResolverPath of previousResolverPaths) {
        mockResolversMetadata[previousResolverPath].shouldFail = true;
      }

      // eslint-disable-next-line no-await-in-loop
      await expect(
        importNtarh()({
          handler: getHandler(),
          test: async ({ fetch }) => {
            expect((await fetch()).status).toBe(200);
          }
        })
      ).resolves.toBeUndefined();

      for (const previousResolverPath of previousResolverPaths) {
        const context = jestExpectationContextFactory(previousResolverPath);
        expect(context(mockResolversMetadata[previousResolverPath].called)).toBe(
          context(false)
        );
      }

      const context = jestExpectationContextFactory(currentResolverPath);
      expect(context(mockResolversMetadata[currentResolverPath].called)).toBe(
        context(true)
      );

      for (const nextResolverPath of nextResolverPaths) {
        const context = jestExpectationContextFactory(nextResolverPath);
        expect(context(mockResolversMetadata[nextResolverPath].called)).toBe(
          context(false)
        );
      }

      resetMockResolverFlags();

      // * In the end, we perform one final test to ensure they all fail
      // * and NTARH reports the appropriate error when no imports exist.
      if (currentIndex === mockResolverPaths.length - 1) {
        for (const resolverPath of mockResolverPaths) {
          mockResolversMetadata[resolverPath].shouldFail = true;
        }

        // ? Should be in reverse alphabetical order
        const expectedFailureLetters = Array.from({ length: mockResolverPaths.length })
          .map((_, index) => String.fromCodePoint(65 + index))
          .reverse();

        // eslint-disable-next-line no-await-in-loop
        await expect(
          importNtarh()({
            handler: getHandler(),
            test: async ({ fetch }) => void (await fetch())
          })
        ).rejects.toMatchObject({
          message: expect.stringMatching(
            new RegExp(
              expectedFailureLetters
                .map((letter) => `- fake import failure ${letter}`)
                .join('\\s+')
            )
          )
        });

        for (const resolverPath of mockResolverPaths) {
          const context = jestExpectationContextFactory(resolverPath);
          expect(context(mockResolversMetadata[resolverPath].called)).toBe(
            context(false)
          );
        }
      }
    }
  });

  it('sanity checks apiResolver value when server is created', async () => {
    expect.hasAssertions();

    mockResolversMetadata[actualResolverPath].shouldReturnBadValue = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        'assertion failed unexpectedly: apiResolver was not a function'
      )
    });
  });

  it('sanity checks addr value when server starts listening', async () => {
    expect.hasAssertions();

    jest.doMock('node:http', () => {
      const http = jest.requireActual('node:http');
      const oldCreateServer = http.createServer;

      http.createServer = (...args: unknown[]) => {
        const server = oldCreateServer(...args);
        server.address = () => undefined;
        return server;
      };

      return http;
    });

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        'assertion failed unexpectedly: server did not return AddressInfo instance'
      )
    });
  });
});
