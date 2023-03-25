/* eslint-disable jest/no-untyped-mock-factory */
import { isolatedImport } from './setup';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

const actualResolverPath = 'next/dist/server/api-utils/node.js';
const altResolverPaths = [
  'next-server/dist/server/api-utils.js',
  'next/dist/next-server/server/api-utils.js',
  'next/dist/server/api-utils.js'
];

jest.mock('next/dist/server/api-utils/node.js', () => {
  return new Proxy(
    {},
    {
      get: function (_, key) {
        if (mockResolversMetadata) {
          const meta = mockResolversMetadata[actualResolverPath];
          if (meta.shouldFail) {
            throw new Error(`fake import failure #1`);
          } else if (key == 'apiResolver') {
            return getMockResolver(meta);
          } else if (key == '__esModule') {
            return true;
          } else if (key == 'then') {
            return this;
          }
          // ? Mocks are hoisted above imports, so account for that
        } else throw new Error('proxy #1 invoked too early');
      }
    }
  );
});

jest.mock(
  'next-server/dist/server/api-utils.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolversMetadata) {
            const meta = mockResolversMetadata[altResolverPaths[0]];
            if (meta.shouldFail) {
              throw new Error(`fake import failure #2`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy #2 invoked too early');
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
          if (mockResolversMetadata) {
            const meta = mockResolversMetadata[altResolverPaths[1]];
            if (meta.shouldFail) {
              throw new Error(`fake import failure #3`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy #3 invoked too early');
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
          if (mockResolversMetadata) {
            const meta = mockResolversMetadata[altResolverPaths[2]];
            if (meta.shouldFail) {
              throw new Error(`fake import failure #4`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy #4 invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

const mockResolversMetadata = {
  [actualResolverPath]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  },
  [altResolverPaths[0]]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  },
  [altResolverPaths[1]]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  },
  [altResolverPaths[2]]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  }
};

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

afterEach(() => resetMockResolverFlags());

describe('::testApiHandler', () => {
  it('gets apiResolver from wherever it might be located using whatever method is available', async () => {
    expect.hasAssertions();

    mockResolversMetadata[actualResolverPath].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(200);
        }
      })
    ).toResolve();

    expect(mockResolversMetadata[actualResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[2]].called).toBeTrue();
    expect(mockResolversMetadata[altResolverPaths[1]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[0]].called).toBeFalse();

    resetMockResolverFlags();

    mockResolversMetadata[actualResolverPath].shouldFail = true;
    mockResolversMetadata[altResolverPaths[2]].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => expect((await fetch()).status).toBe(200)
      })
    ).toResolve();

    expect(mockResolversMetadata[actualResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[2]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[1]].called).toBeTrue();
    expect(mockResolversMetadata[altResolverPaths[0]].called).toBeFalse();

    resetMockResolverFlags();

    mockResolversMetadata[actualResolverPath].shouldFail = true;
    mockResolversMetadata[altResolverPaths[2]].shouldFail = true;
    mockResolversMetadata[altResolverPaths[1]].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => expect((await fetch()).status).toBe(200)
      })
    ).toResolve();

    expect(mockResolversMetadata[actualResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[2]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[1]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[0]].called).toBeTrue();

    // ? Finally, they should all fail if they are all not found

    resetMockResolverFlags();

    mockResolversMetadata[actualResolverPath].shouldFail = true;
    mockResolversMetadata[altResolverPaths[2]].shouldFail = true;
    mockResolversMetadata[altResolverPaths[1]].shouldFail = true;
    mockResolversMetadata[altResolverPaths[0]].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(
        /- fake import failure #1\s+- fake import failure #4\s+- fake import failure #3\s+- fake import failure #2/
      )
    });

    expect(mockResolversMetadata[actualResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[2]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[1]].called).toBeFalse();
    expect(mockResolversMetadata[altResolverPaths[0]].called).toBeFalse();
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

    jest.doMock('http', () => ({
      createServer: (...args: unknown[]) => {
        const server = jest.requireActual('http').createServer(...args);
        server.address = () => undefined;
        return server;
      }
    }));

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
