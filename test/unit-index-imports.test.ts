import { isolatedImport } from './setup';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

const firstResolverPath = 'next/dist/server/api-utils.js';
const secondResolverPath = 'next/dist/next-server/server/api-utils.js';
const thirdResolverPath = 'next-server/dist/server/api-utils.js';

jest.mock('next/dist/server/api-utils.js', () => {
  return new Proxy(
    {},
    {
      get: function (_, key) {
        if (mockResolversMetadata) {
          const meta = mockResolversMetadata[firstResolverPath];
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
        } else throw new Error('proxy invoked too early');
      }
    }
  );
});

jest.mock(
  'next/dist/next-server/server/api-utils.js',
  () => {
    return new Proxy(
      {},
      {
        get: function (_, key) {
          if (mockResolversMetadata) {
            const meta = mockResolversMetadata[secondResolverPath];
            if (meta.shouldFail) {
              throw new Error(`fake import failure #2`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy invoked too early');
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
          if (mockResolversMetadata) {
            const meta = mockResolversMetadata[thirdResolverPath];
            if (meta.shouldFail) {
              throw new Error(`fake import failure #3`);
            } else if (key == 'apiResolver') {
              return getMockResolver(meta);
            }
          } else throw new Error('proxy invoked too early');
        }
      }
    );
  },
  { virtual: true }
);

const mockResolversMetadata = {
  [firstResolverPath]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  },
  [secondResolverPath]: {
    called: false,
    shouldFail: false,
    shouldReturnBadValue: false
  },
  [thirdResolverPath]: {
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

    mockResolversMetadata[firstResolverPath].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(200);
        }
      })
    ).toResolve();

    expect(mockResolversMetadata[firstResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[secondResolverPath].called).toBeTrue();
    expect(mockResolversMetadata[thirdResolverPath].called).toBeFalse();

    resetMockResolverFlags();

    mockResolversMetadata[firstResolverPath].shouldFail = true;
    mockResolversMetadata[secondResolverPath].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => expect((await fetch()).status).toBe(200)
      })
    ).toResolve();

    expect(mockResolversMetadata[firstResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[secondResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[thirdResolverPath].called).toBeTrue();

    resetMockResolverFlags();

    mockResolversMetadata[firstResolverPath].shouldFail = true;
    mockResolversMetadata[secondResolverPath].shouldFail = true;
    mockResolversMetadata[thirdResolverPath].shouldFail = true;

    await expect(
      importNtarh()({
        handler: getHandler(),
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(
        /- fake import failure #1\s+- fake import failure #2\s+- fake import failure #3/
      )
    });

    expect(mockResolversMetadata[firstResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[secondResolverPath].called).toBeFalse();
    expect(mockResolversMetadata[thirdResolverPath].called).toBeFalse();
  });

  it('sanity checks apiResolver value when server is created', async () => {
    expect.hasAssertions();

    mockResolversMetadata[firstResolverPath].shouldReturnBadValue = true;

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
