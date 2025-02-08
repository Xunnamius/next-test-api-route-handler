/* eslint-disable jest/prefer-strict-equal */

import 'next-test-api-route-handler';

import { asMocked, withMockedOutput } from '@-xun/jest';
import { parse, serialize } from 'cookie';
import { cookies, headers } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { $originalGlobalFetch, testApiHandler } from 'universe';

import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('cookie');

const cookie = jest.requireActual('cookie');
const mockedCookieParse = asMocked(parse);
const mockedCookieSerialize = asMocked(serialize);
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
  it('throws when attempting to pass both pagesHandler and appHandler', async () => {
    expect.hasAssertions();

    await expect(
      // @ts-expect-error: testing bad args
      testApiHandler({
        appHandler: {},
        pagesHandler: () => undefined,
        test: async ({ fetch }) => void (await fetch())
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('initialization failed:')
    });
  });

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

    it('uses cached global fetch as ::test({ fetch }) param', async () => {
      expect.hasAssertions();
      // expect(
      //   // @ts-expect-error: a hidden property
      //   fetch.__nextPatched
      // ).toBeUndefined();

      let ran = false;

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          GET() {
            // expect(
            //   // @ts-expect-error: a hidden property
            //   fetch.__nextPatched
            // ).toBeTrue();

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
          expect(fetch[$originalGlobalFetch]).toBe(originalGlobalFetch);

          const pRes = fetch();

          // @ts-expect-error: a hidden property
          expect(fetch[$originalGlobalFetch]).toBe(originalGlobalFetch);

          const res = await pRes;

          // @ts-expect-error: a hidden property
          expect(fetch[$originalGlobalFetch]).toBe(originalGlobalFetch);
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
            url: 'ntarh://testApiHandler/'
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
            url: 'ntarh://my-url/'
          });
        }
      });
    });

    it('does not reject when passed a relative url string', async () => {
      expect.hasAssertions();

      await expect(
        testApiHandler({
          rejectOnHandlerError: true,
          url: '/relative-url',
          appHandler: {
            GET() {
              return NextResponse.json({});
            }
          },
          test: async ({ fetch }) => {
            await fetch();
          }
        })
      ).resolves.toBeUndefined();
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
              { url: `${request.url}?${String(request.headers.get('a'))}` },
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

    it('replaces empty pathname with "/" for given URL', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        url: 'ntarh://my-path-no-slash',
        appHandler: {
          async GET(request) {
            expect(request.nextUrl.pathname).toBe('/');
            return Response.json({ url: request.url }, { status: 200 });
          }
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(200);
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: 'ntarh://my-path-no-slash/'
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
            url: 'ntarh://my-url/'
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
          // eslint-disable-next-line @typescript-eslint/no-misused-spread
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

            //await expect(params).resolves.toStrictEqual({ a: '1' });
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({ a: '1' });

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
            //await expect(params).resolves.toStrictEqual({ a: '1', b: '2', c: '3' });
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({ a: '1', b: '2', c: '3' });
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
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
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
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
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

    it('supports returning void, object, and Promise from paramsPatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher(parameters) {
          parameters.a = 'a';
          return undefined;
        },
        appHandler: {
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
              a: 'a'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        async paramsPatcher(parameters) {
          parameters.a = 'a';
          return undefined;
        },
        appHandler: {
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
              a: 'a'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher: () => ({ obj: 'ect' }),
        appHandler: {
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
              obj: 'ect'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher(_parameters) {
          return Promise.resolve({ obj: 'ect' });
        },
        appHandler: {
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({
              obj: 'ect'
            });

            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('supports returning void, Request, and Promise from requestPatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        requestPatcher() {
          return undefined;
        },
        appHandler: {
          async GET(request) {
            expect(request.url).toBe('ntarh://testApiHandler/');
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        requestPatcher(request) {
          return new Request(request);
        },
        appHandler: {
          async GET(request) {
            expect(request.url).toBe('ntarh://testApiHandler/');
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        requestPatcher() {
          return Promise.resolve(undefined);
        },
        appHandler: {
          async GET(request) {
            expect(request.url).toBe('ntarh://testApiHandler/');
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        async requestPatcher(request) {
          return new Request(request);
        },
        appHandler: {
          async GET(request) {
            expect(request.url).toBe('ntarh://testApiHandler/');
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
          async GET(_request, { params }) {
            //await expect(params).resolves.toStrictEqual({ d: 'z', e: 'f' });
            // eslint-disable-next-line jest/prefer-expect-resolves
            expect(await params).toStrictEqual({ d: 'z', e: 'f' });
            return Response.json({});
          }
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('supports returning void, Response, and Promise from responsePatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        responsePatcher() {
          return undefined;
        },
        appHandler: {
          async GET() {
            return Response.json({ unchanged: true });
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          await expect(res.json()).resolves.toStrictEqual({ unchanged: true });
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        responsePatcher() {
          return Response.json({ unchanged: false });
        },
        appHandler: {
          async GET() {
            return Response.json({ unchanged: true });
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          await expect(res.json()).resolves.toStrictEqual({ unchanged: false });
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        responsePatcher() {
          return Promise.resolve(undefined);
        },
        appHandler: {
          async GET() {
            return Response.json({ unchanged: true });
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          await expect(res.json()).resolves.toStrictEqual({ unchanged: true });
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        async responsePatcher() {
          return Response.json({ unchanged: false });
        },
        appHandler: {
          async GET() {
            return Response.json({ unchanged: true });
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          await expect(res.json()).resolves.toStrictEqual({ unchanged: false });
        }
      });
    });

    it('makes no changes to process.env that are externally visible', async () => {
      expect.hasAssertions();

      // eslint-disable-next-line unicorn/prefer-structured-clone
      const originalProcessEnvClone = JSON.parse(JSON.stringify(process.env));
      expect(process.env).toEqual(originalProcessEnvClone);

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            expect(process.env).toEqual(originalProcessEnvClone);
            return Response.json({});
          }
        },
        test: async ({ fetch }) => {
          await fetch();
          expect(process.env).toEqual(originalProcessEnvClone);
        }
      });

      expect(process.env).toEqual(originalProcessEnvClone);
    });

    it('is not a problem that fetch is called multiple times with multiple Next.js helper functions called', async () => {
      expect.hasAssertions();

      // * Make sure we're not sharing state between fetch calls

      let count = 0;

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          GET(request) {
            return Response.json({
              [++count]: 'count',
              count,
              hcount: request.headers.get('x-hcount'),
              ccount: request.cookies.get('__ccount')?.value
            });
          }
        },
        test: async ({ fetch }) => {
          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 1: 'count', count: 1, hcount: '1', ccount: '1' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 2: 'count', count: 2, hcount: '2', ccount: '2' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 3: 'count', count: 3, hcount: '3', ccount: '3' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 4: 'count', count: 4, hcount: '4', ccount: '4' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 5: 'count', count: 5, hcount: '5', ccount: '5' });
        }
      });
    });

    it('supports all relevant NextRequest and NextResponse methods', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET(request) {
            request.cookies.set('x-set', 'yes');

            expect(request.cookies.get('x-set')).toStrictEqual({
              name: 'x-set',
              value: 'yes'
            });

            expect(request.cookies.get('__has')).toStrictEqual({
              name: '__has',
              value: 'yes'
            });

            expect(request.nextUrl.protocol).toBe('ntarh:');
            // * https://github.com/vercel/next.js/pull/68379
            //expect(request.ip).toBeFalsy();
            //expect(request.geo).toBeEmptyObject();

            return new Response();
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { cookie: '__has=yes' } });
          expect(res.cookies).toStrictEqual([]);
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            const response = NextResponse.json({ hello: 'world' });
            response.cookies.set('__has', 'yes');
            return response;
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.cookies).toStrictEqual([expect.objectContaining({ __has: 'yes' })]);
          await expect(res.json()).resolves.toStrictEqual({ hello: 'world' });

          expect(res.ok).toBeTrue();
          expect(res.redirected).toBeFalse();
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            return NextResponse.redirect('ntarh://somewhere-else');
          }
        },
        responsePatcher(response) {
          expect(String(response.status)).toStartWith('3');
          return Response.json({ tested: true });
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          await expect(res.json()).resolves.toStrictEqual({ tested: true });
        }
      });
    });

    it('supports all relevant Next.js helper functions (including redirects)', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            return Response.json({
              c: (await cookies()).get('__c')?.value,
              h: (await headers()).get('__h')
            });
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ headers: { __h: 'i', cookie: '__c=d' } });
          const json = await res.json();
          expect(json).toStrictEqual({ c: 'd', h: 'i' });
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            return redirect('/somewhere-else');
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(307);
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            return permanentRedirect('ntarh://somewhere-else');
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(308);
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          async GET() {
            return notFound();
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toBe(404);
        }
      });
    });

    it('summons ::json() result for: requestPatcher, responsePatcher, appHandler, and fetch response', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        async requestPatcher(request) {
          await expect(request.json()).resolves.toStrictEqual({});
          // eslint-disable-next-line unicorn/no-invalid-fetch-options
          return new Request(request, { body: '{}' });
        },
        async responsePatcher(response) {
          await expect(response.json()).resolves.toStrictEqual({});
          return Response.json({});
        },
        appHandler: {
          async POST(request: Request) {
            await expect(request.json()).resolves.toStrictEqual({});
            return Response.json({});
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'POST', body: '{}' });
          await expect(res.json()).resolves.toStrictEqual({});
        }
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

    it('response.cookies (from fetch) is lazily defined', async () => {
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

    it('handles all supported HTTP methods', async () => {
      expect.hasAssertions();

      const sharedHandler = async (request: Request) => {
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          await expect(request.json()).resolves.toStrictEqual({
            method: request.method
          });
        }

        return Response.json({ method: request.method });
      };

      await testApiHandler({
        rejectOnHandlerError: true,
        appHandler: {
          GET: sharedHandler,
          POST: sharedHandler,
          PUT: sharedHandler,
          PATCH: sharedHandler,
          DELETE: sharedHandler,
          HEAD: sharedHandler,
          OPTIONS: sharedHandler
        },
        test: async ({ fetch }) => {
          let res = await fetch({ method: 'GET' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'GET' });

          res = await fetch({
            method: 'POST',
            body: JSON.stringify({ method: 'POST' })
          });
          await expect(res.json()).resolves.toStrictEqual({ method: 'POST' });

          res = await fetch({ method: 'PUT', body: JSON.stringify({ method: 'PUT' }) });
          await expect(res.json()).resolves.toStrictEqual({ method: 'PUT' });

          res = await fetch({
            method: 'PATCH',
            body: JSON.stringify({ method: 'PATCH' })
          });
          await expect(res.json()).resolves.toStrictEqual({ method: 'PATCH' });

          res = await fetch({ method: 'DELETE' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'DELETE' });

          res = await fetch({ method: 'HEAD' });
          await expect(res.text()).resolves.toBe('');

          res = await fetch({ method: 'OPTIONS' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'OPTIONS' });
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

    it('rejects on errors from patcher functions', async () => {
      expect.hasAssertions();

      await expect(
        testApiHandler({
          requestPatcher() {
            throw new Error('bad');
          },
          appHandler: {
            async GET() {
              return Response.json({});
            }
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });

      await expect(
        testApiHandler({
          responsePatcher() {
            throw new Error('bad');
          },
          appHandler: {
            async GET() {
              return Response.json({});
            }
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });

      await expect(
        testApiHandler({
          paramsPatcher() {
            throw new Error('bad');
          },
          appHandler: {
            async GET() {
              return Response.json({});
            }
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });
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
            url: 'ntarh://testApiHandler/'
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
          await expect((await fetch()).json()).resolves.toStrictEqual({
            url: '/my-url'
          });
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
          res.status(350).send({ url: `${String(req.url)}?${String(req.headers.a)}` });
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
          await expect((await fetch()).json()).resolves.toStrictEqual({
            data: 'secret'
          });
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

    it('supports returning void, object, and Promise from paramsPatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher(parameters) {
          parameters.a = 'a';
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.query).toStrictEqual({ a: 'a' });
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        async paramsPatcher(parameters) {
          parameters.a = 'a';
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.query).toStrictEqual({ a: 'a' });
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher: () => ({ obj: 'ect' }),
        async pagesHandler(req, res) {
          expect(req.query).toStrictEqual({ obj: 'ect' });
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        paramsPatcher(_parameters) {
          return Promise.resolve({ obj: 'ect' });
        },
        async pagesHandler(req, res) {
          expect(req.query).toStrictEqual({ obj: 'ect' });
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('does nothing to params if paramsPatcher is a noop', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        params: { a: 'thing' },
        paramsPatcher(_parameters) {
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.query).toStrictEqual({ a: 'thing' });
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });
    });

    it('supports returning void and Promise from requestPatcher and responsePatcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        requestPatcher(req) {
          req.url = 'ntarh://changed';
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.url).toBe('ntarh://changed');
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        requestPatcher(req) {
          req.url = 'ntarh://changed';
          return Promise.resolve(undefined);
        },
        async pagesHandler(req, res) {
          expect(req.url).toBe('ntarh://changed');
          res.send({});
        },
        test: async ({ fetch }) => void (await fetch())
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        responsePatcher(res) {
          res.statusCode = 505;
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.url).toBe('ntarh://testApiHandler/');
          res.send({});
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(505);
        }
      });

      await testApiHandler({
        rejectOnHandlerError: true,
        async responsePatcher(res) {
          res.statusCode = 505;
          return undefined;
        },
        async pagesHandler(req, res) {
          expect(req.url).toBe('ntarh://testApiHandler/');
          res.send({});
        },
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(505);
        }
      });
    });

    it('makes no changes to process.env that are externally visible', async () => {
      expect.hasAssertions();

      // eslint-disable-next-line unicorn/prefer-structured-clone
      const originalProcessEnvClone = JSON.parse(JSON.stringify(process.env));
      expect(process.env).toEqual(originalProcessEnvClone);

      await testApiHandler({
        rejectOnHandlerError: true,
        async pagesHandler(_req, res) {
          expect(process.env).toEqual(originalProcessEnvClone);
          res.send({});
        },
        test: async ({ fetch }) => {
          await fetch();
          expect(process.env).toEqual(originalProcessEnvClone);
        }
      });

      expect(process.env).toEqual(originalProcessEnvClone);
    });

    it('is not a problem that fetch is called multiple times', async () => {
      expect.hasAssertions();

      // * Make sure we're not sharing state between fetch calls

      let count = 0;

      await testApiHandler({
        rejectOnHandlerError: true,
        async pagesHandler(req, res) {
          res.status(200).send({
            [++count]: 'count',
            count,
            hcount: req.headers['x-hcount'],
            ccount: req.cookies.__ccount
          });
        },
        test: async ({ fetch }) => {
          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 1: 'count', count: 1, hcount: '1', ccount: '1' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 2: 'count', count: 2, hcount: '2', ccount: '2' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 3: 'count', count: 3, hcount: '3', ccount: '3' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 4: 'count', count: 4, hcount: '4', ccount: '4' });

          await expect(
            (
              await fetch({
                headers: {
                  cookie: `__ccount=${count + 1}`,
                  'x-hcount': String(count + 1)
                }
              })
            ).json()
          ).resolves.toStrictEqual({ 5: 'count', count: 5, hcount: '5', ccount: '5' });
        }
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
          expect(
            (await fetch({ method: 'POST', body: 'more than 1 byte' })).status
          ).toBe(413);
        }
      });
    });

    it('summons ::json() result for: fetch response', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        async pagesHandler(req, res) {
          res.send({});
          expect(req.body).toBe('{}');
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'POST', body: '{}' });
          await expect(res.json()).resolves.toStrictEqual({});
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

    it('response.cookies (from fetch) is lazily defined', async () => {
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

    it('handles all supported HTTP methods', async () => {
      expect.hasAssertions();

      await testApiHandler({
        rejectOnHandlerError: true,
        async pagesHandler(req, res) {
          res.status(200).send({ method: req.method });
        },
        test: async ({ fetch }) => {
          let res = await fetch({ method: 'GET' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'GET' });

          res = await fetch({ method: 'POST' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'POST' });

          res = await fetch({ method: 'PUT' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'PUT' });

          res = await fetch({ method: 'PATCH' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'PATCH' });

          res = await fetch({ method: 'DELETE' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'DELETE' });

          res = await fetch({ method: 'HEAD' });
          await expect(res.text()).resolves.toBe('');

          res = await fetch({ method: 'OPTIONS' });
          await expect(res.json()).resolves.toStrictEqual({ method: 'OPTIONS' });
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

    it('does not cause infinite redirection when testing redirects', async () => {
      expect.hasAssertions();

      await testApiHandler({
        pagesHandler: (_, res) => void res.redirect(308, '/redirected'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(308);
        }
      });

      await testApiHandler({
        pagesHandler: (_, res) => void res.redirect(307, '/redirected'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(307);
        }
      });

      await testApiHandler({
        pagesHandler: (_, res) => void res.redirect(303, '/redirected'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(303);
        }
      });

      await testApiHandler({
        pagesHandler: (_, res) => void res.redirect(302, '/redirected'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(302);
        }
      });

      await testApiHandler({
        pagesHandler: (_, res) => void res.redirect(301, '/redirected'),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(301);
        }
      });
    });

    it('rejects on errors from patcher functions', async () => {
      expect.hasAssertions();

      await expect(
        testApiHandler({
          requestPatcher() {
            throw new Error('bad');
          },
          async pagesHandler(_req, res) {
            res.send({});
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });

      await expect(
        testApiHandler({
          responsePatcher() {
            throw new Error('bad');
          },
          async pagesHandler(_req, res) {
            res.send({});
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });

      await expect(
        testApiHandler({
          paramsPatcher() {
            throw new Error('bad');
          },
          async pagesHandler(_req, res) {
            res.send({});
          },
          test: async ({ fetch }) => void (await fetch())
        })
      ).rejects.toMatchObject({ message: 'bad' });
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
  });
});
