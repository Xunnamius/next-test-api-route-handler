import { parse, serialize } from 'cookie';

import { testApiHandler } from '../src/index';
import { withMockedOutput } from './setup';

// TODO: fix this import
// @ts-expect-error: broken import from node10; needs fixing
import { asMockedFunction } from '@xunnamius/jest-types';

import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('cookie');

const cookie = jest.requireActual('cookie');
const mockedCookieParse = asMockedFunction(parse);
const mockedCookieSerialize = asMockedFunction(serialize);

beforeEach(() => {
  mockedCookieParse.mockImplementation(cookie.parse);
  mockedCookieSerialize.mockImplementation(cookie.serialize);
});

const getHandler =
  (status?: number) => async (_: NextApiRequest, res: NextApiResponse) => {
    res.status(status ?? 200).send({ hello: 'world' });
  };

describe('::testApiHandler', () => {
  it('can test a handler', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: getHandler(),
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
        expect(res.cookies).toBeEmpty();
      }
    });

    await testApiHandler({
      handler: getHandler(404),
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
        expect(res.cookies).toBeEmpty();
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
        await expect((await fetch()).json()).resolves.toStrictEqual({ data: 'secret!' });
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
        await expect((await fetch()).json()).resolves.toStrictEqual({ url: '/' });
      }
    });

    await testApiHandler({
      url: '/my-url',
      handler: async (req, res) => {
        res.status(350).send({ url: req.url });
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(350);
        await expect((await fetch()).json()).resolves.toStrictEqual({ url: '/my-url' });
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
        await expect((await fetch()).json()).resolves.toStrictEqual({ url: '/my-url?b' });
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
        await expect((await fetch()).json()).resolves.toStrictEqual({ data: 'secret' });
      }
    });
  });

  it('automatically inserts x-msw-intention when no header is set', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({
          mswBypass: 'bypass'
        });
      }
    });
  });

  it('automatically inserts x-msw-intention when other headers are set via request patcher', async () => {
    expect.hasAssertions();

    await testApiHandler({
      requestPatcher: (req) => (req.headers.key = 'secret'),
      handler: async (req, res) => {
        res.status(200).send({
          mswBypass: req.headers['x-msw-intention'],
          key: req.headers.key
        });
      },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({
          mswBypass: 'bypass',
          key: 'secret'
        });
      }
    });
  });

  it('automatically inserts x-msw-intention when other headers are set via the fetch init argument', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({
          mswBypass: req.headers['x-msw-intention'],
          authorization: req.headers.authorization
        });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: { authorization: 'Bearer XYZ123' } });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({
          mswBypass: 'bypass',
          authorization: 'Bearer XYZ123'
        });
      }
    });
  });

  it('allows overriding x-msw-intention via various permutations of fetch init argument', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: { 'x-msw-intention': 'none' } });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
      }
    });

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: [['x-msw-intention', 'none']] });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
      }
    });

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: new Headers({ 'x-msw-intention': 'none' }) });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
      }
    });
  });

  it('allows specifying random header via various permutations of fetch init argument', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ header: req.headers['x-random-header'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: { 'x-random-header': 'randomness' } });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ header: 'randomness' });
      }
    });

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ header: req.headers['x-random-header'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: new Headers({ 'x-random-header': 'randomness' })
        });

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ header: 'randomness' });
      }
    });

    await testApiHandler({
      handler: async (req, res) => {
        res.status(200).send({ header: req.headers['x-random-header'] });
      },
      test: async ({ fetch }) => {
        const res = await fetch({ headers: [['x-random-header', 'randomness']] });
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({ header: 'randomness' });
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
        await expect((await fetch()).json()).resolves.toStrictEqual({});
      }
    });
  });

  it('respects params object; parses query string in request url', async () => {
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
      paramsPatcher: (parameters) => (parameters.a = '1'),
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
      paramsPatcher: (parameters) => (parameters.a = '1'),
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

  it('handles single set-cookie header', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: (_, res) => {
        // ? Node12 does not provide a fluent interface for setHeader
        res.setHeader(
          'Set-Cookie',
          mockedCookieSerialize('access_token', '1234', { expires: new Date() })
        );
        res.status(200).send({});
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(200);
        await expect((await fetch()).json()).resolves.toStrictEqual({});
        expect((await fetch()).cookies).toStrictEqual([
          {
            access_token: '1234',
            expires: expect.any(String),
            Expires: expect.any(String)
          }
        ]);
      }
    });
  });

  it('handles multiple set-cookie headers', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: (_, res) => {
        res.setHeader('Set-Cookie', [
          mockedCookieSerialize('access_token', '1234', { expires: new Date() }),
          mockedCookieSerialize('REFRESH_TOKEN', '5678')
        ]);
        res.status(200).send({});
      },
      test: async ({ fetch }) => {
        expect((await fetch()).status).toBe(200);
        await expect((await fetch()).json()).resolves.toStrictEqual({});
        expect((await fetch()).cookies).toStrictEqual([
          {
            access_token: '1234',
            expires: expect.any(String),
            Expires: expect.any(String)
          },
          { refresh_token: '5678', REFRESH_TOKEN: '5678' }
        ]);
      }
    });
  });

  it('response.cookies is lazily defined', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: (_, res) => {
        res.setHeader('Set-Cookie', [
          mockedCookieSerialize('access_token', '1234'),
          mockedCookieSerialize('access_token', '1234')
        ]);
        res.status(200).send({});
      },
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(mockedCookieParse).toHaveBeenCalledTimes(0);
        expect(res.cookies).toBeArrayOfSize(2);
        expect(mockedCookieParse).toHaveBeenCalledTimes(2);
        expect(res.cookies).toBeArrayOfSize(2);
        expect(mockedCookieParse).toHaveBeenCalledTimes(2);
      }
    });

    await testApiHandler({
      handler: (_, res) => {
        res.setHeader('Set-Cookie', [
          mockedCookieSerialize('access_token', '1234'),
          mockedCookieSerialize('access_token', '1234')
        ]);
        res.status(200).send({});
      },
      test: async ({ fetch }) => {
        const res = await fetch();

        expect(mockedCookieParse).toHaveBeenCalledTimes(2);
        expect(res.cookies).toBeArrayOfSize(2);
        expect(mockedCookieParse).toHaveBeenCalledTimes(4);
        expect(res.cookies).toBeArrayOfSize(2);
        expect(mockedCookieParse).toHaveBeenCalledTimes(4);
      }
    });
  });

  it('resolves on errors from handler function by default or if rejectOnHandlerError is false', async () => {
    expect.hasAssertions();

    await withMockedOutput(async ({ errorSpy }) => {
      await expect(
        testApiHandler({
          handler: () => {
            throw new Error('not good');
          },
          test: async ({ fetch }) => {
            const res = await fetch();
            expect(res.status).toBe(500);
            await expect(res.text()).resolves.toMatch(/Internal Server Error/);
          }
        })
      ).resolves.toBeUndefined();

      await expect(
        testApiHandler({
          rejectOnHandlerError: false,
          handler: () => {
            throw new Error('bad not good');
          },
          test: async ({ fetch }) => {
            const res = await fetch();
            expect(res.status).toBe(500);
            await expect(res.text()).resolves.toMatch(/Internal Server Error/);
          }
        })
      ).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('rejects on errors from test function', async () => {
    expect.hasAssertions();

    await expect(
      testApiHandler({
        handler: getHandler(),
        test: async ({ fetch }) => {
          await fetch();
          throw new Error('bad bad no good');
        }
      })
    ).rejects.toMatchObject({ message: 'bad bad no good' });

    await expect(
      testApiHandler({
        handler: getHandler(),
        test: async () => {
          throw new Error('bad bad no good at all');
        }
      })
    ).rejects.toMatchObject({ message: 'bad bad no good at all' });
  });

  it('rejects on errors from handler function if rejectOnHandlerError is true', async () => {
    expect.hasAssertions();

    await withMockedOutput(async ({ errorSpy }) => {
      await expect(
        testApiHandler({
          rejectOnHandlerError: true,
          handler: () => {
            throw new Error('bad bad not good');
          },
          test: async ({ fetch }) => {
            await fetch();
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad not good' });

      await expect(
        testApiHandler({
          rejectOnHandlerError: true,
          handler: async () => {
            throw new Error('bad bad bad not good');
          },
          test: async ({ fetch }) => {
            await fetch();
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad bad not good' });

      await expect(
        testApiHandler({
          rejectOnHandlerError: true,
          handler: () => Promise.reject(new Error('bad bad bad bad not good')),
          test: async ({ fetch }) => {
            await fetch();
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad bad bad not good' });

      expect(errorSpy).toHaveBeenCalledTimes(3);
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
        expect(true).toBe(true);
      }
    });
  });
});
