/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable jest/no-untyped-mock-factory */

import { isolatedImport } from 'testverse:util.ts';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NextApiRequest, NextApiResponse } from 'next';

// function isAccessible(path: string) {
//   try {
//     accessSync(path, fsConstants.R_OK);
//     return true;
//   } catch {
//     return false;
//   }
// }

// * This unit test ensures that NTARH can handle missing resolver dependencies.
// *
// * When updating actualAppRouteRouteModulePath and/or actualApiResolverPath:
// *
// * 1. Update said variable to the new value
// * 2. Append previous value to altAppRouteRouteModulePaths/altApiResolverPaths
// *    and update comments
// * 3. Duplicate current top jest.mock(...) call for AppRouteRouteModule and/or
// *    apiResolver
// * 4. Remove extra key logic from duplicated jest.mock(...) call
// * 5. Change top jest.mock(...) call(s) to correct path, update path index and
// *    fail letter

// ? The currently correct import path for the apiResolver function.
// * BB (-2)
const actualAppRouteRouteModulePath =
  'next/dist/server/route-modules/app-route/module.js';
// ? Defunct import paths listed by discovery date in ascending order. That is:
// ? previous actualAppRouteRouteModulePaths should be appended to the end of
// ? this array.
const altAppRouteRouteModulePaths: string[] = [
  // * AA (-1)
  'next/dist/server/future/route-modules/app-route/module.js'
];

// ? The currently correct import path for the apiResolver function.
// * E (-5)
const actualApiResolverPath = 'next/dist/server/api-utils/node/api-resolver.js';
// ? Defunct import paths listed by discovery date in ascending order. That is:
// ? previous actualApiResolverPaths should be appended to the end of this array.
const altApiResolverPaths: string[] = [
  // * A (-1)
  'next-server/dist/server/api-utils.js',
  // * B (-2)
  'next/dist/next-server/server/api-utils.js',
  // * C (-3)
  'next/dist/server/api-utils.js',
  // * D (-4)
  'next/dist/server/api-utils/node.js'
];

// * vvv TOP MOCKS vvv * \\

jest.mock(
  'next/dist/server/route-modules/app-route/module.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockAppRouteRouteModulePaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockAppRouteRouteModulePaths.at(-2)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure BB`);
            } else if (key === 'AppRouteRouteModule') {
              return getMockAppRouteRouteModule(meta);
            } else if (key === '__esModule') {
              return true;
            } else if (key === 'then') {
              return undefined;
            }
            // ? Mocks are hoisted above imports, so account for that
          } else throw new Error('proxy BB invoked too early');
        }
      }
    );
  } /* ,
  {
    virtual: !isAccessible(
      `${__dirname}/../node_modules/next/dist/server/future/route-modules/app-route/module.js`
    )
  } */
);

jest.mock('next/dist/server/api-utils/node/api-resolver.js', () => {
  return new Proxy(
    {},
    {
      get: function (_, key) {
        if (mockApiResolverPaths && mockResolversMetadata) {
          const meta = mockResolversMetadata[mockApiResolverPaths.at(-5)!]!;

          if (meta.shouldFail) {
            throw new Error(`fake import failure E`);
          } else if (key === 'apiResolver') {
            return getMockApiResolver(meta);
          } else if (key === '__esModule') {
            return true;
          } else if (key === 'then') {
            return undefined;
          }
          // ? Mocks are hoisted above imports, so account for that
        } else throw new Error('proxy E invoked too early');
      }
    }
  );
});

// * ^^^ TOP MOCKS ^^^ * \\

// * vvv REMAINING AppRouteRouteModule MOCKS vvv * \\

jest.mock(
  'next/dist/server/future/route-modules/app-route/module.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockAppRouteRouteModulePaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockAppRouteRouteModulePaths.at(-1)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure AA`);
            } else if (key === 'AppRouteRouteModule') {
              return getMockAppRouteRouteModule(meta);
            }
          } else throw new Error('proxy AA invoked too early');
        }
      }
    );
  },
  {
    virtual: true
    /*
    virtual: !isAccessible(
      `${__dirname}/../node_modules/next/dist/server/route-modules/app-route/module.js`
    ) */
  }
);

// ! Lesson learned from trying to test next@15.0.0-rc.1: Jest has some obscure
// ! bug when calling jest.mock() using a relative path. If your module isn't
// ! being properly mocked, try duplicating the mock with the duplicate using
// ! its absolute path in addition.

// * ^^^ REMAINING AppRouteRouteModule MOCKS ^^^ * \\

// * vvv REMAINING apiResolver MOCKS vvv * \\

jest.mock(
  'next/dist/server/api-utils/node.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockApiResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockApiResolverPaths.at(-4)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure D`);
            } else if (key === 'apiResolver') {
              return getMockApiResolver(meta);
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
          if (mockApiResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockApiResolverPaths.at(-3)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure C`);
            } else if (key === 'apiResolver') {
              return getMockApiResolver(meta);
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
          if (mockApiResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockApiResolverPaths.at(-2)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure B`);
            } else if (key === 'apiResolver') {
              return getMockApiResolver(meta);
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
          if (mockApiResolverPaths && mockResolversMetadata) {
            const meta = mockResolversMetadata[mockApiResolverPaths.at(-1)!]!;

            if (meta.shouldFail) {
              throw new Error(`fake import failure A`);
            } else if (key === 'apiResolver') {
              return getMockApiResolver(meta);
            }
          } else throw new Error('proxy A invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

// * ^^^ REMAINING apiResolver MOCKS ^^^ * \\

const mockApiResolverPaths = [
  ...altApiResolverPaths,
  actualApiResolverPath
].toReversed();

const mockAppRouteRouteModulePaths = [
  ...altAppRouteRouteModulePaths,
  actualAppRouteRouteModulePath
].toReversed();

const mockResolversMetadata: Record<
  string,
  { called: boolean; shouldFail: boolean; shouldReturnBadValue: boolean }
> = Object.fromEntries(
  [mockApiResolverPaths, mockAppRouteRouteModulePaths]
    .flat()
    .map((path) => [
      path,
      { called: false, shouldFail: false, shouldReturnBadValue: false }
    ])
);

const getMockApiResolver = (meta: {
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

const getMockAppRouteRouteModule = (meta: {
  called: boolean;
  shouldFail: boolean;
  shouldReturnBadValue: boolean;
}) => {
  return (
    meta.shouldReturnBadValue ||
    class {
      constructor(something: unknown) {
        void something;
      }

      async handle() {
        meta.called = true;
        return new Response();
      }
    }
  );
};

const importNtarh = () =>
  isolatedImport<typeof import('universe')>('universe').testApiHandler;

const getPagesHandler =
  (status = 200) =>
  async (_: NextApiRequest, res: NextApiResponse) => {
    res.status(status).send({ hello: 'world' });
  };

const getAppHandler = (status = 200) => ({
  async GET() {
    return Response.json({ hello: 'world' }, { status });
  }
});

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
  it('sanity checks addr value when server starts listening', async () => {
    expect.hasAssertions();

    const http = require('node:http');
    const oldCreateServer = http.createServer;

    jest.spyOn(http, 'createServer').mockImplementation((...args: unknown[]) => {
      const server = oldCreateServer(...args);
      server.address = () => undefined;
      return server;
    });

    await expect(
      importNtarh()({
        pagesHandler: getPagesHandler(),
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        'assertion failed unexpectedly: server did not return AddressInfo instance'
      )
    });
  });

  // eslint-disable-next-line jest/prefer-lowercase-title
  describe('AppRouteRouteModule', () => {
    it('gets AppRouteRouteModule from wherever it might be located using whatever method is available', async () => {
      expect.hasAssertions();

      // ? Loop over resolver import paths one by one. For each path, only its
      // ? mock resolver should be called; all the others should not be called
      // ? (because they reported back being non-existent, or are tried later).
      for (const [
        currentIndex,
        currentResolverPath
      ] of mockAppRouteRouteModulePaths.entries()) {
        const previousResolverPaths = mockAppRouteRouteModulePaths.slice(
          0,
          currentIndex
        );
        const nextResolverPaths = mockAppRouteRouteModulePaths.slice(currentIndex + 1);

        for (const previousResolverPath of previousResolverPaths) {
          mockResolversMetadata[previousResolverPath]!.shouldFail = true;
        }

        // eslint-disable-next-line no-await-in-loop
        await expect(
          importNtarh()({
            appHandler: getAppHandler(),
            test: async ({ fetch }) => {
              expect((await fetch()).status).toBe(200);
            }
          })
        ).resolves.toBeUndefined();

        for (const previousResolverPath of previousResolverPaths) {
          const context = jestExpectationContextFactory(previousResolverPath);
          expect(context(mockResolversMetadata[previousResolverPath]!.called)).toBe(
            context(false)
          );
        }

        const context = jestExpectationContextFactory(currentResolverPath);
        expect(context(mockResolversMetadata[currentResolverPath]!.called)).toBe(
          context(true)
        );

        for (const nextResolverPath of nextResolverPaths) {
          const context = jestExpectationContextFactory(nextResolverPath);
          expect(context(mockResolversMetadata[nextResolverPath]!.called)).toBe(
            context(false)
          );
        }

        resetMockResolverFlags();

        // * In the end, we perform one final test to ensure they all fail
        // * and NTARH reports the appropriate error when no imports exist.
        if (currentIndex === mockAppRouteRouteModulePaths.length - 1) {
          for (const resolverPath of mockAppRouteRouteModulePaths) {
            mockResolversMetadata[resolverPath]!.shouldFail = true;
          }

          // ? Should be in reverse alphabetical order
          const expectedFailureLetters = Array.from({
            length: mockAppRouteRouteModulePaths.length
          })
            .map((_, index) => String.fromCodePoint(65 + index))
            .toReversed();

          // eslint-disable-next-line no-await-in-loop
          await expect(
            importNtarh()({
              appHandler: getAppHandler(),
              test: async ({ fetch }) => void (await fetch())
            })
          ).rejects.toMatchObject({
            message: expect.stringMatching(
              new RegExp(
                expectedFailureLetters
                  .map((letter) => `- fake import failure ${letter.repeat(2)}`)
                  .join(String.raw`\s+`)
              )
            )
          });

          for (const resolverPath of mockAppRouteRouteModulePaths) {
            const context = jestExpectationContextFactory(resolverPath);
            expect(context(mockResolversMetadata[resolverPath]!.called)).toBe(
              context(false)
            );
          }
        }
      }
    });

    it('sanity checks AppRouteRouteModule value when server is created/accessed', async () => {
      expect.hasAssertions();

      mockResolversMetadata[actualAppRouteRouteModulePath]!.shouldReturnBadValue = true;

      await expect(
        importNtarh()({
          appHandler: getAppHandler(),
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'assertion failed unexpectedly: AppRouteRouteModule was not a constructor (function)'
        )
      });
    });
  });

  describe('apiResolver', () => {
    it('gets apiResolver from wherever it might be located using whatever method is available', async () => {
      expect.hasAssertions();

      // ? Loop over resolver import paths one by one. For each path, only its
      // ? mock resolver should be called; all the others should not be called
      // ? (because they reported back being non-existent, or are tried later).
      for (const [currentIndex, currentResolverPath] of mockApiResolverPaths.entries()) {
        const previousResolverPaths = mockApiResolverPaths.slice(0, currentIndex);
        const nextResolverPaths = mockApiResolverPaths.slice(currentIndex + 1);

        for (const previousResolverPath of previousResolverPaths) {
          mockResolversMetadata[previousResolverPath]!.shouldFail = true;
        }

        // eslint-disable-next-line no-await-in-loop
        await expect(
          importNtarh()({
            pagesHandler: getPagesHandler(),
            test: async ({ fetch }) => {
              expect((await fetch()).status).toBe(200);
            }
          })
        ).resolves.toBeUndefined();

        for (const previousResolverPath of previousResolverPaths) {
          const context = jestExpectationContextFactory(previousResolverPath);
          expect(context(mockResolversMetadata[previousResolverPath]!.called)).toBe(
            context(false)
          );
        }

        const context = jestExpectationContextFactory(currentResolverPath);
        expect(context(mockResolversMetadata[currentResolverPath]!.called)).toBe(
          context(true)
        );

        for (const nextResolverPath of nextResolverPaths) {
          const context = jestExpectationContextFactory(nextResolverPath);
          expect(context(mockResolversMetadata[nextResolverPath]!.called)).toBe(
            context(false)
          );
        }

        resetMockResolverFlags();

        // * In the end, we perform one final test to ensure they all fail
        // * and NTARH reports the appropriate error when no imports exist.
        if (currentIndex === mockApiResolverPaths.length - 1) {
          for (const resolverPath of mockApiResolverPaths) {
            mockResolversMetadata[resolverPath]!.shouldFail = true;
          }

          // ? Should be in reverse alphabetical order
          const expectedFailureLetters = Array.from({
            length: mockApiResolverPaths.length
          })
            .map((_, index) => String.fromCodePoint(65 + index))
            .toReversed();

          // eslint-disable-next-line no-await-in-loop
          await expect(
            importNtarh()({
              pagesHandler: getPagesHandler(),
              test: async ({ fetch }) => void (await fetch())
            })
          ).rejects.toMatchObject({
            message: expect.stringMatching(
              new RegExp(
                expectedFailureLetters
                  .map((letter) => `- fake import failure ${letter}`)
                  .join(String.raw`\s+`)
              )
            )
          });

          for (const resolverPath of mockApiResolverPaths) {
            const context = jestExpectationContextFactory(resolverPath);
            expect(context(mockResolversMetadata[resolverPath]!.called)).toBe(
              context(false)
            );
          }
        }
      }
    });

    it('sanity checks apiResolver value when server is created/accessed', async () => {
      expect.hasAssertions();

      mockResolversMetadata[actualApiResolverPath]!.shouldReturnBadValue = true;

      await expect(
        importNtarh()({
          pagesHandler: getPagesHandler(),
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'assertion failed unexpectedly: apiResolver was not a function'
        )
      });
    });
  });
});
