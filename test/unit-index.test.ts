import { testApiHandler } from '../src/index';

import type { NextApiRequest, NextApiResponse } from 'next';

const nextSemverFloor = '>=9';

const getHandler =
  (status?: number) => async (_: NextApiRequest, res: NextApiResponse) => {
    res.status(status ?? 200).send({ hello: 'world' });
  };

describe('sanity checks', () => {
  test(`peerDependencies.next => "${nextSemverFloor}"`, async () => {
    expect.hasAssertions();
    expect(await (await import('../package.json')).peerDependencies.next).toBe(
      nextSemverFloor
    );
  });
});

describe('::testApiHandler', () => {
  it('can test a handler', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: getHandler(),
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(200);
        expect(await (await fetch()).json()).toStrictEqual({ hello: 'world' });
      }
    });

    await testApiHandler({
      handler: getHandler(404),
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(404);
        expect(await (await fetch()).json()).toStrictEqual({ hello: 'world' });
      }
    });
  });

  it('handles empty request.url', async () => {
    expect.hasAssertions();

    await testApiHandler({
      requestPatcher: (req) => (req.url = undefined),
      handler: async (_, res) => {
        res.status(350).send({ data: 'secret!' });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(350);
        expect(await (await fetch()).json()).toStrictEqual({ data: 'secret!' });
      }
    });
  });

  it('respects url string', async () => {
    expect.hasAssertions();

    await testApiHandler({
      url: undefined,
      handler: async (req, res) => {
        res.status(350).send({ url: req.url });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(350);
        expect(await (await fetch()).json()).toStrictEqual({ url: '/' });
      }
    });

    await testApiHandler({
      url: '/my-url',
      handler: async (req, res) => {
        res.status(350).send({ url: req.url });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(350);
        expect(await (await fetch()).json()).toStrictEqual({ url: '/my-url' });
      }
    });
  });

  it('respects url and requestPatcher', async () => {
    expect.hasAssertions();

    await testApiHandler({
      url: '/my-url',
      requestPatcher: (req) => (req.headers = { a: 'b' }),
      handler: async (req, res) => {
        res.status(350).send({ url: `${req.url}?${req.headers.a}` });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(350);
        expect(await (await fetch()).json()).toStrictEqual({ url: '/my-url?b' });
      }
    });
  });

  it('respects changes introduced through request patcher', async () => {
    expect.hasAssertions();

    await testApiHandler({
      requestPatcher: (req) => (req.headers.key = 'secret'),
      handler: async (req, res) => {
        res.status(500).send({ data: req.headers.key });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(500);
        expect(await (await fetch()).json()).toStrictEqual({ data: 'secret' });
      }
    });
  });

  it('respects changes introduced through response patcher', async () => {
    expect.hasAssertions();

    await testApiHandler({
      responsePatcher: (res) => (res.statusCode = 404),
      handler: async (_, res) => res.send({}),
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(404);
        expect(await (await fetch()).json()).toStrictEqual({});
      }
    });
  });

  it('respects params object', async () => {
    expect.hasAssertions();

    await testApiHandler({
      params: { a: '1' },
      requestPatcher: (req) => (req.url = '/api/handler?b=2&c=3'),
      handler: async (req, res) => {
        res.send({});
        expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3' });
      },
      test: async ({ fetch }) => void (await fetch())
    });
  });

  it('respects changes introduced through params patcher', async () => {
    expect.hasAssertions();

    await testApiHandler({
      paramsPatcher: (params) => (params.a = '1'),
      requestPatcher: (req) => (req.url = '/api/handler?b=2&c=3'),
      handler: async (req, res) => {
        res.send({});
        expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3' });
      },
      test: async ({ fetch }) => void (await fetch())
    });
  });

  it('respects params and paramPatcher concurrently', async () => {
    expect.hasAssertions();

    await testApiHandler({
      params: { d: 'z', e: 'f' },
      paramsPatcher: (params) => (params.a = '1'),
      requestPatcher: (req) => (req.url = '/api/handler?b=2&c=3'),
      handler: async (req, res) => {
        res.send({});
        expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3', d: 'z', e: 'f' });
      },
      test: async ({ fetch }) => void (await fetch())
    });
  });

  it("respects route handler's config property", async () => {
    expect.hasAssertions();

    const handler: ReturnType<typeof getHandler> & {
      config?: Record<string, unknown>;
    } = getHandler();
    // See https://nextjs.org/docs/api-routes/api-middlewares#custom-config
    handler.config = { api: { bodyParser: { sizeLimit: 1 /* bytes */ } } };

    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(200);
        expect((await fetch({ method: 'POST', body: 'more than 1 byte' })).status).toBe(
          413
        );
      }
    });
  });

  it('supports type generics', async () => {
    expect.hasAssertions();

    await testApiHandler<{ a: number }>({
      handler: async (_, res) => {
        // @ts-expect-error: b does not exist (this test "fails" if no TS error)
        res.send({ b: 1 });
      },
      test: async ({ fetch }) => {
        // @ts-expect-error: b does not exist (this test "fails" if no TS error)
        (await (await fetch()).json()).b;
        expect(true).toBeTrue();
      }
    });
  });
});
