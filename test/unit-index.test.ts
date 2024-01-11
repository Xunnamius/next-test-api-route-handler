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
const originalGlobalFetch = fetch;

beforeEach(() => {
  mockedCookieParse.mockImplementation(cookie.parse);
  mockedCookieSerialize.mockImplementation(cookie.serialize);
});

afterEach(() => {
  // ? Undo what Next.js does to the global fetch function
  globalThis.fetch = originalGlobalFetch;
});

describe('::testApiHandler', () => {
  describe('<app router>', () => {
    const getHandler = (status?: number) => ({
      async GET() {
        return Response.json({ hello: 'world' }, { status: status || 200 });
      }
    });

    it('can test a handler', async () => {
      expect.hasAssertions();

      await testApiHandler({
        appHandler: getHandler(),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
          expect(res.cookies).toBeEmpty();
        }
      });

      await testApiHandler({
        appHandler: getHandler(404),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(404);
          await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
          expect(res.cookies).toBeEmpty();
        }
      });
    });

    it('does not expose patched global fetch function outside handler', async () => {
      expect.hasAssertions();
      expect(
        // @ts-expect-error: a hidden property
        fetch.__nextPatched
      ).toBeUndefined();

      let ran = false;

      await testApiHandler({
        appHandler: {
          GET() {
            expect(
              // @ts-expect-error: a hidden property
              fetch.__nextPatched
            ).toBeTrue();

            ran = true;
            return Response.json({ hello: 'world' });
          }
        },
        test: async ({ fetch }) => {
          expect(
            // @ts-expect-error: a hidden property
            fetch.__nextPatched
          ).toBeUndefined();

          // @ts-expect-error: a hidden property
          expect(fetch._ntarhOriginalGlobalFetch).toBe(originalGlobalFetch);

          const pRes = fetch();

          // @ts-expect-error: a hidden property
          expect(fetch._ntarhOriginalGlobalFetch).toBe(originalGlobalFetch);

          const res = await pRes;

          // @ts-expect-error: a hidden property
          expect(fetch._ntarhOriginalGlobalFetch).toBe(originalGlobalFetch);
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
          expect(ran).toBeTrue();
        }
      });
    });

    it('respects url string', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        url: undefined,
        appHandler: {
          async GET(request) {
            return Response.json({ url: request.url }, { status: 350 });
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: 'ntarh://testApiHandler'
          });
        }
      });

      await testApiHandler({
        url: 'ntarh://my-url',
        appHandler: {
          async GET(request) {
            return Response.json({ url: request.url }, { status: 350 });
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: 'ntarh://my-url'
          });
        }
      });
    });

    it('respects url and requestPatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        url: 'ntarh:///my-url',
        requestPatcher: (request) => {
          request.headers.set('a', 'b');
        },
        appHandler: {
          async GET(request) {
            return Response.json(
              { url: `${request.url}?${request.headers.get('a')}` },
              { status: 350 }
            );
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: 'ntarh:///my-url?b'
          });
        }
      });
    });

    it('respects changes introduced through request patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        requestPatcher: (request) => {
          request.headers.set('key', 'secret');
        },
        appHandler: {
          async POST(request) {
            return Response.json({ data: request.headers.get('key') }, { status: 555 });
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch({ method: 'POST' })).status).toBe(555);
          await expect((await fetch({ method: 'POST' })).json()).resolves.toStrictEqual({
            data: 'secret'
          });
        }
      });
    });

    it('automatically inserts x-msw-intention when no header is set', async () => {
      expect.hasAssertions();

      await testApiHandler({
        appHandler: {
          async GET(request) {
            return Response.json(
              { mswBypass: request.headers.get('x-msw-intention') },
              { status: 200 }
            );
          }
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
        requestPatcher: (request) => {
          request.headers.set('key', 'secret');
        },
        appHandler: {
          async GET(request) {
            return Response.json(
              {
                mswBypass: request.headers.get('x-msw-intention'),
                key: request.headers.get('key')
              },
              { status: 200 }
            );
          }
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
        appHandler: {
          async GET(request) {
            return Response.json(
              {
                mswBypass: request.headers.get('x-msw-intention'),
                authorization: request.headers.get('authorization')
              },
              { status: 200 }
            );
          }
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
        appHandler: {
          async GET(request) {
            return Response.json(
              { mswBypass: request.headers.get('x-msw-intention') },
              { status: 200 }
            );
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { 'x-msw-intention': 'none' } });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });

      await testApiHandler({
        appHandler: {
          async GET(request) {
            return Response.json(
              { mswBypass: request.headers.get('x-msw-intention') },
              { status: 200 }
            );
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: [['x-msw-intention', 'none']] });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });

      await testApiHandler({
        appHandler: {
          async GET(request) {
            return Response.json(
              { mswBypass: request.headers.get('x-msw-intention') },
              { status: 200 }
            );
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({
            headers: new Headers({ 'x-msw-intention': 'none' })
          });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });
    });

    it('allows specifying random header via various permutations of fetch init argument', async () => {
      expect.hasAssertions();

      await testApiHandler({
        appHandler: {
          async GET(request) {
            return Response.json(
              { header: request.headers.get('x-random-header') },
              { status: 200 }
            );
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { 'x-random-header': 'randomness' } });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ header: 'randomness' });
        }
      });

      await testApiHandler({
        appHandler: {
          async GET(request) {
            return Response.json(
              { header: request.headers.get('x-random-header') },
              { status: 200 }
            );
          }
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
        appHandler: {
          async GET(request) {
            return Response.json(
              { header: request.headers.get('x-random-header') },
              { status: 200 }
            );
          }
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
        responsePatcher: async (response) => {
          return new Response(await response.text(), { ...response, status: 404 });
        },
        appHandler: {
          async GET() {
            return Response.json({}, { status: 200 });
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(404);
          await expect((await fetch()).json()).resolves.toStrictEqual({});
        }
      });
    });

    it('respects params object and parsed query string as two different objects (unlike Pages Router)', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { a: '1' },
        requestPatcher: () => {
          return new Request('ntarh:///api/handler?b=2&c=3');
        },
        appHandler: {
          async GET(request, { params }) {
            expect(Array.from(request.nextUrl.searchParams.entries())).toStrictEqual([
              ['b', '2'],
              ['c', '3']
            ]);

            expect(params).toStrictEqual({ a: '1' });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('respects changes introduced through params patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher: (parameters) => {
          parameters.a = '1';
          parameters.b = '2';
          parameters.c = '3';
        },
        appHandler: {
          async GET(_request, { params }) {
            expect(params).toStrictEqual({ a: '1', b: '2', c: '3' });
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('respects params and paramsPatcher concurrently', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { d: 'z', e: 'f' },
        paramsPatcher(parameters) {
          return { ...parameters, a: '1', b: '2', c: '3' };
        },
        appHandler: {
          GET(_request, { params }) {
            expect(params).toStrictEqual({
              a: '1',
              b: '2',
              c: '3',
              d: 'z',
              e: 'f'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('overrides params with paramsPatcher returned result', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { d: 'z', e: 'f' },
        paramsPatcher(_parameters) {
          return { a: '1', b: '2', c: '3' };
        },
        appHandler: {
          GET(_request, { params }) {
            expect(params).toStrictEqual({
              a: '1',
              b: '2',
              c: '3'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('does nothing to params if paramsPatcher is a noop', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { d: 'z', e: 'f' },
        paramsPatcher(_parameters) {
          return undefined;
        },
        appHandler: {
          GET(_request, { params }) {
            expect(params).toStrictEqual({ d: 'z', e: 'f' });
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('handles single set-cookie header', async () => {
      expect.hasAssertions();

      await testApiHandler({
        appHandler: {
          GET() {
            const response = Response.json({});
            response.headers.set(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234', { expires: new Date() })
            );

            return response;
          }
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
        appHandler: {
          GET() {
            const response = Response.json({});

            response.headers.set(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234', { expires: new Date() })
            );

            response.headers.append(
              'Set-Cookie',
              mockedCookieSerialize('REFRESH_TOKEN', '5678')
            );

            return response;
          }
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
        appHandler: {
          GET() {
            const response = Response.json({});

            response.headers.set(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234')
            );

            response.headers.append(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234')
            );

            return response;
          }
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
        appHandler: {
          GET() {
            const response = Response.json({});

            response.headers.set(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234')
            );

            response.headers.append(
              'Set-Cookie',
              mockedCookieSerialize('access_token', '1234')
            );

            return response;
          }
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

    it('does not misplace request body', async () => {
      expect.hasAssertions();

      const body = JSON.stringify({ hello: 'world!' });

      await testApiHandler({
        appHandler: {
          async POST(request) {
            return new Response(await request.text());
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'POST', body });
          expect(res.status).toBe(200);
          await expect(res.text()).resolves.toBe(body);
        }
      });
    });

    it('resolves on errors from handler function by default or if rejectOnHandlerError is false or not provided', async () => {
      expect.hasAssertions();

      await withMockedOutput(async ({ errorSpy }) => {
        await expect(
          testApiHandler({
            appHandler: {
              GET() {
                throw new Error('not good');
              }
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
            appHandler: {
              GET() {
                throw new Error('bad not good');
              }
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
          appHandler: getHandler(),
          test: async ({ fetch }) => {
            await fetch();
            throw new Error('bad bad no good');
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad no good' });

      await expect(
        testApiHandler({
          appHandler: getHandler(),
          test: async () => {
            throw new Error('bad bad no good at all');
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad no good at all' });
    });

    it('rejects on errors from handler function (or handler returns rejected Promise) if rejectOnHandlerError is true', async () => {
      expect.hasAssertions();

      await withMockedOutput(async ({ errorSpy }) => {
        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            appHandler: {
              GET() {
                throw new Error('bad bad not good');
              }
            },
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad not good' });

        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            appHandler: {
              async GET() {
                throw new Error('bad bad not good');
              }
            },
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad not good' });

        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            appHandler: {
              GET() {
                // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
                return Promise.reject(new Error('bad bad bad bad not good'));
              }
            },
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad bad bad not good' });

        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            appHandler: {
              async GET() {
                // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
                return Promise.reject(new Error('bad bad bad bad not good'));
              }
            },
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad bad bad not good' });

        expect(errorSpy).toHaveBeenCalledTimes(4);
      });
    });

    it('rejects on non-Response (except rejected Promises) returned from handler and outputs error message', async () => {
      expect.hasAssertions();

      const message = expect.stringMatching(
        /^No response is returned from route handler 'ntarh:\/\/testApiHandler'/
      );

      await withMockedOutput(async ({ errorSpy }) => {
        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            appHandler: {
              GET() {
                return 'something awful';
              }
            },
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message });

        expect(errorSpy.mock.calls).toStrictEqual([
          [expect.objectContaining({ message })]
        ]);
      });
    });

    it('supports type generics', async () => {
      expect.hasAssertions();

      await testApiHandler<{ a: number }>({
        appHandler: {
          async GET() {
            // ? We shouldn't be type checking this deep
            return Response.json({ b: 1 });
          }
        },
        test: async ({ fetch }) => {
          // @ts-expect-error: b does not exist (this test "fails" if no TS error)
          (await (await fetch()).json()).b;
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('<pages router>', () => {
    const getHandler =
      (status?: number) => async (_: NextApiRequest, res: NextApiResponse) => {
        res.status(status ?? 200).send({ hello: 'world' });
      };

    it('can test a handler', async () => {
      expect.hasAssertions();

      await testApiHandler({
        pagesHandler: getHandler(),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });
          expect(res.cookies).toBeEmpty();
        }
      });

      await testApiHandler({
        pagesHandler: getHandler(404),
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
        requestPatcher: (req) => {
          req.url = undefined;
        },
        pagesHandler: async (_, res) => {
          res.status(350).send({ data: 'secret!' });
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            data: 'secret!'
          });
        }
      });
    });

    it('respects url string', async () => {
      expect.hasAssertions();

      await testApiHandler({
        url: undefined,
        pagesHandler: async (req, res) => {
          res.status(350).send({ url: req.url });
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: 'ntarh://testApiHandler'
          });
        }
      });

      await testApiHandler({
        url: '/my-url',
        pagesHandler: async (req, res) => {
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
        requestPatcher: (req) => {
          req.headers = { a: 'b' };
        },
        pagesHandler: async (req, res) => {
          res.status(350).send({ url: `${req.url}?${req.headers.a}` });
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(350);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: '/my-url?b'
          });
        }
      });
    });

    it('respects changes introduced through request patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        requestPatcher: (req) => {
          req.headers.key = 'secret';
        },
        pagesHandler: async (req, res) => {
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
        pagesHandler: async (req, res) => {
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
        requestPatcher: (req) => {
          req.headers.key = 'secret';
        },
        pagesHandler: async (req, res) => {
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
        pagesHandler: async (req, res) => {
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
        pagesHandler: async (req, res) => {
          res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { 'x-msw-intention': 'none' } });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });

      await testApiHandler({
        pagesHandler: async (req, res) => {
          res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: [['x-msw-intention', 'none']] });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });

      await testApiHandler({
        pagesHandler: async (req, res) => {
          res.status(200).send({ mswBypass: req.headers['x-msw-intention'] });
        },
        test: async ({ fetch }) => {
          const res = await fetch({
            headers: new Headers({ 'x-msw-intention': 'none' })
          });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ mswBypass: 'none' });
        }
      });
    });

    it('allows specifying random header via various permutations of fetch init argument', async () => {
      expect.hasAssertions();

      await testApiHandler({
        pagesHandler: async (req, res) => {
          res.status(200).send({ header: req.headers['x-random-header'] });
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { 'x-random-header': 'randomness' } });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({ header: 'randomness' });
        }
      });

      await testApiHandler({
        pagesHandler: async (req, res) => {
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
        pagesHandler: async (req, res) => {
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
        responsePatcher: (res) => {
          res.statusCode = 404;
        },
        pagesHandler: async (_, res) => res.send({}),
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(404);
          await expect((await fetch()).json()).resolves.toStrictEqual({});
        }
      });
    });

    it('respects params object; parses query string in request url', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { a: '1' },
        requestPatcher: (req) => {
          req.url = '/api/handler?b=2&c=3';
        },
        pagesHandler: async (req, res) => {
          res.send({});
          expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3' });
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('respects changes introduced through params patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher: (parameters) => {
          parameters.a = '1';
        },
        requestPatcher: (req) => {
          req.url = '/api/handler?b=2&c=3';
        },
        pagesHandler: async (req, res) => {
          res.send({});
          expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3' });
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('respects params and paramsPatcher concurrently', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { d: 'z', e: 'f' },
        paramsPatcher(parameters) {
          parameters.a = '1';
        },
        requestPatcher(req) {
          req.url = '/api/handler?b=2&c=3';
        },
        async pagesHandler(req, res) {
          res.send({});
          expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3', d: 'z', e: 'f' });
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it("respects route handler's config property", async () => {
      expect.hasAssertions();

      const pagesHandler: ReturnType<typeof getHandler> & {
        config?: Record<string, unknown>;
      } = getHandler();
      // See https://nextjs.org/docs/api-routes/api-middlewares#custom-config
      pagesHandler.config = { api: { bodyParser: { sizeLimit: 1 /* bytes */ } } };

      await testApiHandler({
        pagesHandler,
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
        pagesHandler: (_, res) => {
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
        pagesHandler: (_, res) => {
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
        pagesHandler: (_, res) => {
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
        pagesHandler: (_, res) => {
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

    it('does not misplace request body', async () => {
      expect.hasAssertions();

      const body = JSON.stringify({ hello: 'world!' });

      await testApiHandler({
        pagesHandler: (req, res) => {
          res.status(200).send(req.body);
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'POST', body });
          expect(res.status).toBe(200);
          await expect(res.text()).resolves.toBe(body);
        }
      });
    });

    it('resolves on errors from handler function by default or if rejectOnHandlerError is false or not provided', async () => {
      expect.hasAssertions();

      await withMockedOutput(async ({ errorSpy }) => {
        await expect(
          testApiHandler({
            pagesHandler: () => {
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
            pagesHandler: () => {
              throw new Error('bad not good');
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
            pagesHandler: async () => {
              throw new Error('bad not good');
            },
            test: async ({ fetch }) => {
              const res = await fetch();
              expect(res.status).toBe(500);
              await expect(res.text()).resolves.toMatch(/Internal Server Error/);
            }
          })
        ).resolves.toBeUndefined();

        expect(errorSpy).toHaveBeenCalledTimes(3);
      });
    });

    it('rejects on errors from test function', async () => {
      expect.hasAssertions();

      await expect(
        testApiHandler({
          pagesHandler: getHandler(),
          test: async ({ fetch }) => {
            await fetch();
            throw new Error('bad bad no good');
          }
        })
      ).rejects.toMatchObject({ message: 'bad bad no good' });

      await expect(
        testApiHandler({
          pagesHandler: getHandler(),
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
            pagesHandler: () => {
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
            pagesHandler: async () => {
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
            pagesHandler: () => Promise.reject(new Error('bad bad bad bad not good')),
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad bad bad not good' });

        await expect(
          testApiHandler({
            rejectOnHandlerError: true,
            pagesHandler: async () =>
              // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
              Promise.reject(new Error('bad bad bad bad not good')),
            test: async ({ fetch }) => {
              await fetch();
            }
          })
        ).rejects.toMatchObject({ message: 'bad bad bad bad not good' });

        expect(errorSpy).toHaveBeenCalledTimes(4);
      });
    });

    it('supports type generics', async () => {
      expect.hasAssertions();

      await testApiHandler<{ a: number }>({
        pagesHandler: async (_, res) => {
          // ? Formerly we would expect an error to be thrown here, but in
          // ? NTARH@4 we've relaxed the type checking so that only fetch::json
          // ? is affected. I believe this leads to more accurate and more
          // ? useful type checking for NTARH users.
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
});
