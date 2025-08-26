/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/no-explicit-any */

import assert from 'node:assert';
import { createServer } from 'node:http';
import { ReadableStream as WebReadableStream } from 'node:stream/web';

import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import type { NextApiHandler } from 'next';
import type { NextRequest } from 'next/server';

// ? Next expects AsyncLocalStorage to be globally available IMMEDIATELY! So
// ? this line should happen before any imports of Next.js packages.
// ! Unfortunately, due to the way Next.js is written, even at this point it is
// ! often too late to add AsyncLocalStorage to globalThis for Next.js to
// ! pickup. This is why the usage instructions recommend hoisting NTARH to
// ! be the first import.
if (!globalThis.AsyncLocalStorage) {
  globalThis.AsyncLocalStorage = require('node:async_hooks').AsyncLocalStorage;
}

// ? next@>=14.2.20 expects react to export a .cache() function, but react@18,
// ? which is next@14's peer dependency, doesn't export a .cache() function. If
// ? we don't see a .cache() function, we'll polyfill it.
// * https://github.com/Xunnamius/next-test-api-route-handler/issues/1167
// {@symbiote/notInvalid react} // ? We assume this is coming from Next
// istanbul ignore next
if (!require('react').cache) {
  require('react').cache = function (fn: (args: never[]) => unknown) {
    return function (...args: never[]) {
      return Reflect.apply(fn, null, args);
    };
  };
}

// ? next's "react-server" condition expects react to export a .createContext()
// ? function, but it is not always available for various reasons. If we don't
// ? see a .createContext() function, we'll polyfill it.
// * https://github.com/Xunnamius/next-test-api-route-handler/issues/1151
// {@symbiote/notInvalid react} // ? We assume this is coming from Next
// istanbul ignore next
if (!require('react').createContext) {
  require('react').createContext = function () {
    return {};
  };
}

/**
 * This is the default "pretty" URL that resolvers will associate with requests
 * from our dummy HTTP server. We use this to hide the uglier localhost url as
 * an implementation detail.
 */
const defaultNextRequestMockUrl = 'ntarh://testApiHandler/';

/**
 * This function is responsible for adding the headers sent along with every
 * fetch request by default. Headers that already exist will not be overwritten.
 *
 * Current default headers:
 *
 * - `x-msw-intention: bypass` (for msw@1)
 * - `x-msw-bypass: true`      (for msw@2)
 */
const addDefaultHeaders = (headers: Headers) => {
  if (!headers.has('x-msw-intention')) {
    headers.set('x-msw-intention', 'bypass');
  }

  if (!headers.has('x-msw-bypass')) {
    headers.set('x-msw-bypass', 'true');
  }

  return headers;
};

/**
 * @internal
 */
const $importFailed = Symbol('import-failed');

/**
 * @internal
 */
export const $originalGlobalFetch = Symbol('original-global-fetch-function');

/**
 * @internal
 */
export const $isPatched = Symbol('object-has-been-patched-by-ntarh');

// * vvv FIND NEXTJS INTERNAL RESOLVERS vvv * \\

const apiResolver = findNextjsInternalResolver<
  // * Copied from the first line in the possibleLocations array below
  typeof import('next/dist/server/api-utils/node/api-resolver').apiResolver
>('apiResolver', [
  // ? The following is for next@>=13.5.4:
  'next/dist/server/api-utils/node/api-resolver.js',
  // ? The following is for next@<13.5.4 >=12.1.0:
  'next/dist/server/api-utils/node.js',
  // ? The following is for next@<12.1.0 >=11.1.0:
  'next/dist/server/api-utils.js',
  // ? The following is for next@<11.1.0 >=9.0.6:
  'next/dist/next-server/server/api-utils.js',
  // ? The following is for next@<9.0.6 >= 9.0.0:
  'next-server/dist/server/api-utils.js'
]);

const AppRouteRouteModule = findNextjsInternalResolver<
  // * Copied from the first line in the possibleLocations array below
  typeof import('next/dist/server/route-modules/app-route/module').AppRouteRouteModule
>('AppRouteRouteModule', [
  // ? The following is for next@>=15.0.0-rc.1:
  'next/dist/server/route-modules/app-route/module.js',

  // ? The following is for next@>=14.0.4:
  'next/dist/server/future/route-modules/app-route/module.js'
]);

// * ^^^ FIND NEXTJS INTERNAL RESOLVERS ^^^ * \\

// ? We track the original global fetch function because Next.js patches it
// ? upon import (I'm not sure where or when), so we need to restore it before
// ? the end-developer's test function runs.
const originalGlobalFetch = globalThis.fetch;

/**
 * @internal
 */
export type Promisable<Promised> = Promised | Promise<Promised>;

/**
 * @internal
 */
export type FetchReturnType<NextResponseJsonType> = Promise<
  Omit<Response, 'json'> & {
    json: (...args: Parameters<Response['json']>) => Promise<NextResponseJsonType>;
    cookies: ReturnType<typeof import('cookie').parse>[];
  }
>;

export interface NtarhInit<NextResponseJsonType = unknown> {
  /**
   * If `false`, errors thrown from within a handler are kicked up to Next.js's
   * resolver to deal with, which is what would happen in production. If `true`,
   * the {@link testApiHandler} function will reject immediately instead.
   *
   * You should use `rejectOnHandlerError` whenever you want to manually handle
   * an error that bubbles up from your handler (which is especially true if
   * you're using `expect` _within_ your handler) or when you notice a false
   * negative despite exceptions being thrown.
   *
   * @default false
   */
  rejectOnHandlerError?: boolean;
  /**
   * `test` is a function that runs your test assertions. This function receives
   * one destructured parameter: `fetch`, which is equivalent to
   * `globalThis.fetch` but with the first parameter omitted.
   */
  test: (parameters: {
    fetch: (customInit?: RequestInit) => FetchReturnType<NextResponseJsonType>;
  }) => Promisable<void>;
}

type AppRouteUserlandModule =
  import('next/dist/server/route-modules/app-route/module').AppRouteUserlandModule;

/**
 * The parameters expected by `testApiHandler` when using `appHandler`.
 */
export interface NtarhInitAppRouter<NextResponseJsonType = unknown>
  extends NtarhInit<NextResponseJsonType> {
  /**
   * The actual App Router route handler under test. It should be an object
   * containing one or more async functions named for valid HTTP methods and/or
   * a valid configuration option. See [the Next.js
   * documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
   * for details.
   */
  appHandler: Partial<
    Omit<
      AppRouteUserlandModule,
      keyof import('next/dist/server/route-modules/app-route/module').AppRouteHandlers
    > & {
      [key in keyof import('next/dist/server/route-modules/app-route/module').AppRouteHandlers]?: (
        req: NextRequest,
        segmentData?: any
      ) => any;
    }
  >;
  pagesHandler?: undefined;
  /**
   * `params` is passed directly to the handler and represents processed dynamic
   * routes. This should not be confused with query string parsing, which is
   * handled by `Request` automatically.
   *
   * `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
   * params.id = 'some-id' }`. This is useful for quickly setting many params at
   * once.
   */
  params?: Record<string, string | string[]>;
  /**
   * A function that receives `params`, an object representing "processed"
   * dynamic route parameters. Modifications to `params` are passed directly to
   * the handler. You can also return a custom object from this function which
   * will replace `params` entirely.
   *
   * Parameter patching should not be confused with query string parsing, which
   * is handled by `Request` automatically.
   */
  paramsPatcher?: (
    params: Record<string, string | string[]>
  ) => Promisable<void | Record<string, string | string[]>>;
  /**
   * A function that receives a `NextRequest` object and returns a `Request`
   * instance. Use this function to edit the request _before_ it's injected
   * into the handler.
   *
   * If the returned `Request` instance is not also an instance of
   * `NextRequest`, it will be wrapped with `NextRequest`, e.g. `new
   * NextRequest(returnedRequest, { ... })`.
   */
  requestPatcher?: (
    request: import('next/server').NextRequest
  ) => Promisable<void | Request>;
  /**
   * A function that receives the `Response` object returned from `appHandler`
   * and returns a `Response` instance. Use this function to edit the response
   * _after_ your handler runs but _before_ it's processed by the server.
   *
   * Note that `responsePatcher` is called even in the case of exceptions,
   * including _unhandled exceptions_ (for which Next.js returns an HTTP 500
   * response). The only time `responsePatcher` is not called is when an
   * unhandled exception occurs _and_ `rejectOnHandlerError` is `true`.
   */
  responsePatcher?: (res: Response) => Promisable<void | Response>;
  /**
   * `url: 'your-url'` is shorthand for `requestPatcher: (request) => new
   * NextRequest('your-url', request)`
   */
  url?: string;
}

/**
 * The parameters expected by `testApiHandler` when using `pagesHandler`.
 */
export interface NtarhInitPagesRouter<NextResponseJsonType = unknown>
  extends NtarhInit<NextResponseJsonType> {
  /**
   * The actual Pages Router route handler under test. It should be an async
   * function that accepts `NextApiRequest` and `NextApiResult` objects (in
   * that order) as its two parameters.
   *
   * Note that type checking for `res.send` and similar methods was retired in
   * NTARH@4. Only the `response.json` method returned by NTARH's fetch wrapper
   * will have a typed result.
   */
  pagesHandler: NextApiHandler | { default: NextApiHandler };
  appHandler?: undefined;
  /**
   * `params` is passed directly to the handler and represents processed dynamic
   * routes. This should not be confused with query string parsing, which is
   * handled automatically.
   *
   * `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) => {
   * params.id = 'some-id' }`. This is useful for quickly setting many params at
   * once.
   */
  params?: Record<string, unknown>;
  /**
   * A function that receives `params`, an object representing "processed"
   * dynamic route parameters. Modifications to `params` are passed directly to
   * the handler. You can also return a custom object from this function which
   * will replace `params` entirely.
   *
   * Parameter patching should not be confused with query string parsing, which
   * is handled automatically.
   */
  paramsPatcher?: (
    params: Record<string, unknown>
  ) => Promisable<void | Record<string, unknown>>;
  /**
   * A function that receives an `IncomingMessage` object. Use this function
   * to edit the request _before_ it's injected into the handler.
   *
   * **Note: all replacement `IncomingMessage.header` names must be
   * lowercase.**
   */
  requestPatcher?: (request: IncomingMessage) => Promisable<void>;
  /**
   * A function that receives a `ServerResponse` object. Use this function
   * to edit the response _before_ it's injected into the handler.
   */
  responsePatcher?: (res: ServerResponse) => Promisable<void>;
  /**
   * `url: 'your-url'` is shorthand for `requestPatcher: (req) => { req.url =
   * 'your-url' }`
   */
  url?: string;
}

/**
 * Uses Next's internal `apiResolver` (for Pages Router) or an
 * `AppRouteRouteModule` instance (for App Router) to execute api route handlers
 * in a Next-like testing environment.
 */
export async function testApiHandler<NextResponseJsonType = any>({
  rejectOnHandlerError,
  requestPatcher,
  responsePatcher,
  paramsPatcher,
  params,
  url,
  pagesHandler: pagesHandler_,
  appHandler,
  test
}:
  | NtarhInitAppRouter<NextResponseJsonType>
  | NtarhInitPagesRouter<NextResponseJsonType>) {
  let server: Server | undefined = undefined;
  let deferredReject: ((error?: unknown) => void) | undefined = undefined;

  // ? Normalize pagesHandler into a NextApiHandler (ESM<=>CJS interop)
  /* istanbul ignore next */
  const pagesHandler =
    pagesHandler_ && typeof pagesHandler_ === 'object' && 'default' in pagesHandler_
      ? Object.assign(pagesHandler_.default, pagesHandler_)
      : pagesHandler_;

  try {
    if (!!pagesHandler_ === !!appHandler) {
      throw new TypeError(
        'next-test-api-route-handler (NTARH) initialization failed: you must provide exactly one of: pagesHandler, appHandler'
      );
    }

    server = pagesHandler ? createPagesRouterServer() : createAppRouterServer();

    const { address, port } = await new Promise<{ address: string; port: number }>(
      (resolve, reject) => {
        server?.listen(0, 'localhost', undefined, () => {
          const addr = server?.address();

          if (!addr || typeof addr === 'string') {
            reject(
              new Error(
                'assertion failed unexpectedly: server did not return AddressInfo instance'
              )
            );
          } else {
            /* istanbul ignore next */
            resolve({
              port: addr.port,
              address: addr.family === 'IPv6' ? `[${addr.address}]` : addr.address
            });
          }
        });
      }
    );

    const localUrl = `http://${address}:${port}`;

    await new Promise((resolve, reject) => {
      deferredReject = reject;

      Promise.resolve(
        test({
          fetch: Object.assign(fetch_, {
            // ? We do this here so we can track what the global fetch function
            // ? is doing. This lets us deal with Next.js patching global fetch.
            get [$originalGlobalFetch]() {
              return originalGlobalFetch;
            }
          })
        })
      ).then(resolve, reject);

      async function fetch_(customInit?: RequestInit) {
        const init: RequestInit = {
          redirect: 'manual',
          ...customInit,
          headers: addDefaultHeaders(new Headers(customInit?.headers))
        };

        return (
          originalGlobalFetch(localUrl, init) as FetchReturnType<NextResponseJsonType>
        ).then((response) => {
          // ? Lazy load (on demand) the contents of the `cookies` field
          Object.defineProperty(response, 'cookies', {
            configurable: true,
            enumerable: true,
            get: () => {
              const { parse: parseCookieHeader } = require('cookie');
              // @ts-expect-error: lazy getter guarantees this will be set
              delete response.cookies;
              response.cookies = response.headers.getSetCookie().map((header) =>
                Object.fromEntries(
                  Object.entries(parseCookieHeader(header)).flatMap(([k, v]) => {
                    return [
                      [k, String(v)],
                      [k.toLowerCase(), String(v)]
                    ];
                  })
                )
              );
              return response.cookies;
            }
          });

          return rebindJsonMethodAsSummoner(response);
        });
      }
    });
  } finally {
    server?.close();
    server?.closeAllConnections();
  }

  function createAppRouterServer() {
    // ? Keep these imports local so older Next.js versions don't choke and die.
    type CreateServerAdapter = typeof import('@whatwg-node/server').createServerAdapter;
    const createServerAdapter = require('@whatwg-node/server')
      .createServerAdapter as CreateServerAdapter;

    type NextRequest_ = typeof import('next/server').NextRequest;
    const NextRequest = require('next/server').NextRequest as NextRequest_;

    return createServer((req, res) => {
      const originalRes = res;
      void createServerAdapter(async (request) => {
        try {
          assert(appHandler !== undefined);

          const {
            cache,
            credentials,
            headers,
            integrity,
            keepalive,
            method,
            mode,
            redirect,
            referrer,
            referrerPolicy,
            signal
          } = request;

          const rawRequest = rebindJsonMethodAsSummoner(
            new NextRequest(
              normalizeUrlForceTrailingSlashIfPathnameEmpty(
                url || defaultNextRequestMockUrl
              ),
              /**
               * See: RequestData from next/dist/server/web/types.d.ts
               * See also: https://stackoverflow.com/a/57014050/1367414
               */
              {
                body: readableStreamOrNullFromAsyncIterable(
                  // ? request.body claims to be ReadableStream, but it's
                  // ? actually a Node.js native stream (i.e. iterable)...
                  request.body as unknown as AsyncIterable<any>
                ),
                cache,
                credentials,
                // https://github.com/nodejs/node/issues/46221
                duplex: 'half',
                headers,
                integrity,
                keepalive,
                method,
                mode,
                redirect,
                referrer,
                referrerPolicy,
                signal
              }
            )
          );

          const patchedRequest = (await requestPatcher?.(rawRequest)) || rawRequest;
          const nextRequest =
            // eslint-disable-next-line no-restricted-syntax
            patchedRequest instanceof NextRequest
              ? patchedRequest
              : new NextRequest(patchedRequest, {
                  // https://github.com/nodejs/node/issues/46221
                  duplex: 'half'
                });

          const rawParameters = { ...params };

          const finalParameters = returnUndefinedIfEmptyObject(
            (await paramsPatcher?.(rawParameters)) || rawParameters
          );

          // ? Mocking NODE_ENV here gets AppRouteRouteModule to spit out useful
          // ? debug info to the end developer.
          const appRouteRouteModule = await mockEnvVariable(
            'NODE_ENV',
            'development',
            () => {
              if (typeof AppRouteRouteModule !== 'function') {
                assert(
                  AppRouteRouteModule[$importFailed],
                  'assertion failed unexpectedly: AppRouteRouteModule was not a constructor (function)'
                );

                throw AppRouteRouteModule[$importFailed];
              }

              return new AppRouteRouteModule({
                definition: {
                  kind: 'APP_ROUTE' as any,
                  page: '/route',
                  pathname: 'ntarh://testApiHandler',
                  filename: 'route',
                  bundlePath: 'app/route'
                },
                nextConfigOutput: undefined,
                resolvedPagePath: 'ntarh://testApiHandler',
                userland: appHandler as AppRouteUserlandModule,
                distDir: 'ntarh://fake-dir',
                // @ts-ignore: necessary in next@<=15.4
                projectDir: 'ntarh://fake-dir'
              });
            }
          );

          const response_ = appRouteRouteModule.handle(
            rebindJsonMethodAsSummoner(nextRequest),
            {
              params: finalParameters,
              prerenderManifest: {
                version: 4,
                routes: {},
                dynamicRoutes: {},
                notFoundRoutes: [],
                preview: {} as any
              },
              renderOpts: {
                experimental: {
                  // @ts-expect-error: for next@<15
                  ppr: false,
                  // For next@>=15
                  isRoutePPREnabled: false
                },
                // ? Next.js tries to do things it shouldn't unless we add these
                // @ts-ignore: the types for renderOpts are wrong?!
                supportsDynamicHTML: true,
                // @ts-ignore: the types for renderOpts are wrong?!
                supportsDynamicResponse: true
              },
              // ? Some versions of Next.js poo the bed if we don't include this
              // ? even though it doesn't appear in the types as far as I can
              // ? tell
              // @ts-ignore: the types for renderOpts are wrong?!
              staticGenerationContext: { supportsDynamicHTML: true },
              // For next@>=15.2
              sharedContext: { buildId: 'ntarh' }
            }
          );

          // * We essentially copy what the Pages Router apiResolver does,
          // * which is also what the App Router does too but elsewhere.
          const response = rebindJsonMethodAsSummoner(
            await response_.catch((error: unknown) => {
              // eslint-disable-next-line no-console
              console.error(error);

              if (rejectOnHandlerError) {
                throw error;
              } else {
                return new Response('Internal Server Error', { status: 500 });
              }
            })
          );

          return (await responsePatcher?.(response)) || response;
        } catch (error) {
          handleError(originalRes, error, deferredReject);

          // ? This line (i.e. "await ... setImmediate(...));") allows the
          // ? event loop to service the rejection caused by deferredReject(...)
          // ? before continuing the execution of this function.
          await new Promise((resolve) => setImmediate(resolve));

          // ? Unless they're stepping through deep code, end developers should
          // ? never encounter this response since deferredReject rejects first.
          return new Response(
            `[NTARH Internal Server Error]: an error occurred during this test that caused testApiHandler to reject (i.e. rejectOnHandlerError === true). This response was returned as a courtesy so your handler does not potentially hang forever.\n\nError: ${
              /* istanbul ignore next */
              Error.isError(error) ? error.stack || error : String(error)
            }`,
            { status: 500 }
          );
        }
      })(req, res);
    });
  }

  function createPagesRouterServer() {
    return createServer((req, res) => {
      try {
        assert(pagesHandler_ !== undefined);

        req.url = url || defaultNextRequestMockUrl;

        Promise.resolve(requestPatcher?.(req))
          .then(() => responsePatcher?.(res))
          .then(async () => {
            // eslint-disable-next-line n/no-deprecated-api
            const { parse: parseUrl } = require('node:url');
            const rawParameters: Record<string, unknown> = {
              ...parseUrl(req.url || '', true).query,
              ...params
            };

            return (await paramsPatcher?.(rawParameters)) || rawParameters;
          })
          .then((finalParameters) => {
            if (typeof apiResolver !== 'function') {
              assert(
                apiResolver[$importFailed],
                'assertion failed unexpectedly: apiResolver was not a function'
              );

              throw apiResolver[$importFailed];
            }

            /**
             *? From Next.js internals:
             ** apiResolver(
             **    req: IncomingMessage,
             **    res: ServerResponse,
             **    query: any,
             **    resolverModule: any,
             **    apiContext: __ApiPreviewProps,
             **    propagateError: boolean,
             **    dev?: boolean,
             **    page?: boolean,
             **    onError?: ServerOnInstrumentationRequestError
             ** )
             */
            void apiResolver(
              req,
              res,
              finalParameters,
              pagesHandler,
              {} as any,
              !!rejectOnHandlerError
            ).catch((error: unknown) => handleError(res, error, deferredReject));
          })
          .catch((error: unknown) => {
            handleError(res, error, deferredReject);
          });
      } catch (error) {
        handleError(res, error, deferredReject);
      }
    });
  }
}

function returnUndefinedIfEmptyObject<T extends object>(o: T) {
  return Object.keys(o).length ? o : undefined;
}

/**
 * @internal
 */
async function mockEnvVariable<T>(
  name: string,
  updatedValue: string | undefined,
  callback: () => T
): Promise<T> {
  const oldEnvVariable = process.env[name];
  process.env[name] = updatedValue;

  try {
    return await callback();
  } finally {
    process.env[name] = oldEnvVariable;
  }
}

/**
 * Convert an AsyncIterable (Node stream-like) into a ReadableStream from
 * node:stream/web.
 *
 * @internal
 */
function readableStreamOrNullFromAsyncIterable(
  iterable: AsyncIterable<any> | null | undefined
) {
  if (iterable === undefined || iterable === null) {
    return null;
  }

  return WebReadableStream.from(iterable) as ReadableStream;
}

/**
 * What is this? Well, when ditching node-fetch for the internal fetch, the way
 * Jest uses node's vm package results in the internals returning objects from a
 * different realm than the objects created within the vm instance (like the one
 * in which jest tests are executed). What this extra step does is take the
 * object returned from res.json(), which is from an outside realm, and
 * "summons" it into the current vm realm. Without this step, matchers like
 * .toStrictEqual(...) will fail with a "serializes to the same string" error.
 *
 * @internal
 */
function rebindJsonMethodAsSummoner<T extends Response | Request>(communication: T): T {
  // @ts-expect-error: a hidden property
  if (!communication[$isPatched]) {
    communication.json = async () => {
      const text = await communication.text();
      return JSON.parse(text);
    };

    // @ts-expect-error: a hidden property
    communication[$isPatched] = true;
  }

  return communication;
}

/**
 * Attempt to find and import a Nextjs internal export.
 */
function findNextjsInternalResolver<T = NonNullable<unknown>>(
  exportedName: string,
  possibleLocations: string[]
) {
  const errors: string[] = [];
  let imported: T | undefined = undefined;

  for (const path of possibleLocations) {
    try {
      const { [exportedName]: xport } = require(path);
      imported = xport;
      break;
    } catch (error) {
      errors.push(
        Error.isError(error)
          ? error.message
              .split(/(?<=')( imported)? from ('|\S)/)[0]!
              .split(`\nRequire`)[0]!
          : /* istanbul ignore next */
            String(error)
      );
    }
  }

  return (
    imported ?? {
      [$importFailed]: new Error(
        // prettier-ignore
        `next-test-api-route-handler (NTARH) failed to import ${exportedName}` +
        `\n\n  This is usually caused by:` +
        `\n\n    1. Using a Node version that is end-of-life (review legacy install instructions)` +
          `\n    2. NTARH and the version of Next.js you installed are actually incompatible (please check documentation and/or submit a bug report)` +
        `\n\n  Failed import attempts:` +
        `\n\n    - ${errors.join('\n    - ')}`
      )
    }
  );
}

/**
 *
 * @internal
 */
function handleError(
  res: ServerResponse | undefined,
  error: unknown,
  deferredReject: ((error: unknown) => unknown) | undefined
) {
  // ? Prevent tests that crash the server from hanging. This might be a
  // ? Jest-specific (or maybe VM-module-specific) issue since it doesn't happen
  // ? when you run NTARH in Node.js without Jest (i.e. the integration tests).
  /* istanbul ignore else */
  if (res && !res.writableEnded) {
    res.end();
  }

  // ? Throwing at the point this function was called would not normally cause
  // ? testApiHandler to reject because createServer (an EventEmitter) only
  // ? accepts non-async event handlers which swallow errors from async
  // ? functions (which is why `void` is used instead of `await` when calling
  // ? `createServerAdapter` and `apiResolver`). So we'll have to get creative!
  // ? How about: defer rejections manually?
  /* istanbul ignore else */
  if (deferredReject) deferredReject(error);
  else throw error;
}

/**
 * @internal
 */
function normalizeUrlForceTrailingSlashIfPathnameEmpty(url: string) {
  const url_ = new URL(url, 'ntarh://');
  url_.pathname ||= '/';
  return url_.toString();
}
