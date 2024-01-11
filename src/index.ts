/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
import assert from 'node:assert';

import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse
} from 'node:http';

import type { NextApiHandler } from 'next';
import type { apiResolver as NextPagesResolver } from 'next/dist/server/api-utils/node/api-resolver';

import type {
  AppRouteRouteModule as NextAppResolver,
  AppRouteUserlandModule as NextAppRoute
} from 'next/dist/server/future/route-modules/app-route/module';

/**
 * This is the default "pretty" URL that resolvers will associate with requests
 * from our dummy HTTP server. We use this to hide the uglier localhost url as
 * an implementation detail.
 */
const defaultNextRequestMockUrl = 'ntarh://testApiHandler';

/**
 * This function is responsible for adding the headers sent along with every
 * fetch request by default. Headers that already exist will not be overwritten.
 *
 * Current default headers:
 *
 * - `x-msw-intention: bypass`
 */
const addDefaultHeaders = (headers: Headers) => {
  if (!headers.has('x-msw-intention')) {
    headers.set('x-msw-intention', 'bypass');
  }

  return headers;
};

let apiResolver: typeof NextPagesResolver | null = null;
let AppRouteRouteModule: typeof NextAppResolver | null = null;

// ? We track the original global fetch function because Next.js patches it
// ? upon import (I'm not sure where or when), so we need to restore it before
// ? the end-developer's test function runs.
const originalGlobalFetch = fetch;

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

// ? The result of this function is memoized by the caller, so this function
// ? will only be invoked the first time this script is imported.
const tryImport = ((path: string) => (error?: Error) => {
  if (error) {
    tryImport.importErrors = tryImport.importErrors ?? [];
    tryImport.importErrors.push(error);
  }

  return require(path);
}) as ((path: string) => (error?: Error) => Promise<any>) & {
  importErrors: Error[];
};

const handleError = (
  res: ServerResponse | undefined,
  error: unknown,
  deferredReject: ((error: unknown) => unknown) | null
) => {
  // ? Prevent tests that crash the server from hanging. This might be a
  // ? Jest-specific (or maybe VM-module-specific) issue since it doesn't happen
  // ? when you run NTARH in Node.js without Jest (i.e. the integration tests).
  if (res && !res.writableEnded) {
    res.end();
  }

  // ? Throwing at the point this function was called would not normally cause
  // ? testApiHandler to reject because createServer (an EventEmitter) only
  // ? accepts non-async event handlers which swallow errors from async
  // ? functions (which is why `void` is used instead of `await` below). So
  // ? we'll have to get creative! How about: defer rejections manually?
  /* istanbul ignore else */
  if (deferredReject) deferredReject(error);
  else throw error;
};

/**
 * @internal
 */
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
  appHandler: NextAppRoute;
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
    // eslint-disable-next-line unicorn/prevent-abbreviations
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
  pagesHandler: NextApiHandler<any> | { default: NextApiHandler<any> };
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
    // eslint-disable-next-line unicorn/prevent-abbreviations
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
  let server: Server | null = null;
  let deferredReject: ((error?: unknown) => void) | null = null;

  // ? Normalize pagesHandler into a NextApiHandler (ESM<=>CJS interop)
  const pagesHandler =
    pagesHandler_ && typeof pagesHandler_ === 'object' && 'default' in pagesHandler_
      ? Object.assign(pagesHandler_.default, pagesHandler_)
      : pagesHandler_;

  try {
    // ? Next expects AsyncLocalStorage to be globally available
    if (!globalThis.AsyncLocalStorage) {
      globalThis.AsyncLocalStorage = require('node:async_hooks').AsyncLocalStorage;
    }

    if (!!pagesHandler_ === !!appHandler) {
      throw new TypeError(
        'next-test-api-route-handler (NTARH) initialization failed: you must provide exactly one of: pagesHandler, appHandler'
      );
    }

    // ? Dynamically import apiResolver only if necessary
    if (pagesHandler && !apiResolver) {
      tryImport.importErrors = [];

      ({ apiResolver } = await Promise.reject()
        // ? The following is for next@>=13.5.4:
        .catch(tryImport('next/dist/server/api-utils/node/api-resolver.js'))
        // ? The following is for next@<13.5.4 >=12.1.0:
        .catch(tryImport('next/dist/server/api-utils/node.js'))
        // ? The following is for next@<12.1.0 >=11.1.0:
        .catch(tryImport('next/dist/server/api-utils.js'))
        // ? The following is for next@<11.1.0 >=9.0.6:
        .catch(tryImport('next/dist/next-server/server/api-utils.js'))
        // ? The following is for next@<9.0.6 >= 9.0.0:
        .catch(tryImport('next-server/dist/server/api-utils.js'))
        .catch((error) => (tryImport.importErrors.push(error), { apiResolver: null })));

      if (!apiResolver) {
        const importErrors = tryImport.importErrors
          .map(
            (error) =>
              error.message
                .split(/(?<=')( imported)? from ('|\S)/)[0]
                .split(`\nRequire`)[0]
          )
          .join('\n    - ');

        tryImport.importErrors = [];
        // prettier-ignore
        throw new Error(
          `next-test-api-route-handler (NTARH) failed to import apiResolver` +
            `\n\n  This is usually caused by:` +
            `\n\n    1. Using a Node version that is end-of-life (review legacy install instructions)` +
              `\n    2. NTARH and the version of Next.js you installed are actually incompatible (please submit a bug report)` +
            `\n\n  Failed import attempts:` +
            `\n\n    - ${importErrors}`
        );
      }
    }

    // ? Dynamically import AppRouteRouteModule only if necessary
    if (appHandler && !AppRouteRouteModule) {
      tryImport.importErrors = [];

      ({ AppRouteRouteModule } = await Promise.reject()
        // ? The following is for next@>=14.0.4:
        .catch(tryImport('next/dist/server/future/route-modules/app-route/module.js'))
        .catch(
          (error) => (tryImport.importErrors.push(error), { AppRouteRouteModule: null })
        ));

      if (!AppRouteRouteModule) {
        const importErrors = tryImport.importErrors
          .map(
            (error) =>
              error.message
                .split(/(?<=')( imported)? from ('|\S)/)[0]
                .split(`\nRequire`)[0]
          )
          .join('\n    - ');

        tryImport.importErrors = [];
        // prettier-ignore
        throw new Error(
          `next-test-api-route-handler (NTARH) failed to import AppRouteRouteModule` +
            `\n\n  This is usually caused by:` +
            `\n\n    1. Using a Node version that is end-of-life (review legacy install instructions)` +
              `\n    2. NTARH and the version of Next.js you installed are actually incompatible (please submit a bug report)` +
            `\n\n  Failed import attempts:` +
            `\n\n    - ${importErrors}`
        );
      }
    }

    server = pagesHandler ? createPagesRouterServer() : createAppRouterServer();

    const port = await new Promise<number>((resolve, reject) => {
      server?.listen(() => {
        const addr = server?.address();

        if (!addr || typeof addr === 'string') {
          reject(
            new Error(
              'assertion failed unexpectedly: server did not return AddressInfo instance'
            )
          );
        } else {
          resolve(addr.port);
        }
      });
    });

    const localUrl = `http://localhost:${port}`;

    await new Promise((resolve, reject) => {
      deferredReject = reject;

      Promise.resolve(
        test({
          fetch: Object.assign(fetch_, {
            // ? We do this here so we can track what the global fetch function
            // ? is doing. This lets us deal with Next.js patching global fetch.
            get _ntarhOriginalGlobalFetch() {
              return originalGlobalFetch;
            }
          })
        })
      ).then(resolve, reject);

      async function fetch_(customInit?: RequestInit) {
        const init: RequestInit = {
          ...customInit,
          headers: addDefaultHeaders(new Headers(customInit?.headers))
        };

        return (
          originalGlobalFetch(localUrl, init) as FetchReturnType<NextResponseJsonType>
        ).then((res) => {
          // ? Lazy load (on demand) the contents of the `cookies` field
          Object.defineProperty(res, 'cookies', {
            configurable: true,
            enumerable: true,
            get: () => {
              const { parse: parseCookieHeader } = require('cookie');
              // @ts-expect-error: lazy getter guarantees this will be set
              delete res.cookies;
              res.cookies = [res.headers.getSetCookie() || []].flat().map((header) =>
                Object.fromEntries(
                  Object.entries(parseCookieHeader(header)).flatMap(([k, v]) => {
                    return [
                      [String(k), String(v)],
                      [String(k).toLowerCase(), String(v)]
                    ];
                  })
                )
              );
              return res.cookies;
            }
          });

          const oldJson = res.json.bind(res);
          // ? What is this? Well, when ditching node-fetch for the internal
          // ? fetch, the way Jest uses node's vm package results in the
          // ? internals returning objects from a different realm than the
          // ? objects created within the vm instance (like the one in which
          // ? jest tests are executed). What this extra step does is take
          // ? the object returned from res.json(), which is from an outside
          // ? realm, and "summons" it into the current vm realm. Without
          // ? this step, matchers like .toStrictEqual(...) will fail with a
          // ? "serializes to the same string" error.
          // ?
          // ? Why can't we use Object.assign(...) or spread syntax instead?
          // ? Because we need a deep clone (but faster than structuredClone).
          res.json = async () => JSON.parse(JSON.stringify(await oldJson()));

          return res;
        });
      }
    });
  } finally {
    server?.close();
  }

  function createAppRouterServer() {
    const { createServerAdapter } = require('@whatwg-node/server');
    type NextRequest_ = typeof import('next/server').NextRequest;
    const NextRequest = require('next/server').NextRequest as NextRequest_;

    return createServer((req, res) => {
      const originalRes = res;
      return createServerAdapter(async (request: Request) => {
        try {
          assert(appHandler !== undefined);

          // ? Mocking __NEXT_NO_MIDDLEWARE_URL_NORMALIZE here gets NextRequest
          // ? to avoid normalizing our URLs, keeping them exactly as given.
          const nextRequest = await mockEnvVariable(
            '__NEXT_NO_MIDDLEWARE_URL_NORMALIZE',
            'true',
            async () => {
              const rawRequest = new NextRequest(
                url || defaultNextRequestMockUrl,
                /**
                 * See: RequestData from next/dist/server/web/types.d.ts
                 * See also: https://stackoverflow.com/a/57014050/1367414
                 */
                {
                  ...request,
                  // https://github.com/nodejs/node/issues/46221
                  // @ts-expect-error: TS types are not yet updated
                  duplex: 'half'
                }
              );

              const patchedRequest = (await requestPatcher?.(rawRequest)) || rawRequest;
              const finalRequest =
                patchedRequest instanceof NextRequest
                  ? patchedRequest
                  : new NextRequest(patchedRequest, {
                      // https://github.com/nodejs/node/issues/46221
                      // @ts-expect-error: TS types are not yet updated
                      duplex: 'half'
                    });

              return finalRequest;
            }
          );

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
                throw new TypeError(
                  'assertion failed unexpectedly: AppRouteRouteModule was not a constructor (function)'
                );
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
                userland: appHandler
              });
            }
          );

          const response_ = appRouteRouteModule.handle(nextRequest, {
            params: finalParameters,
            prerenderManifest: {} as any,
            renderOpts: {
              // ? Next.js poos the bed if we don't include this
              experimental: {},
              // ? Next.js tries to do things it shouldn't unless we add this
              supportsDynamicHTML: true
            } as any
          });

          // * We essentially copy what the Pages Router apiResolver does,
          // * which is also what the App Router does too but elsewhere.
          const response = await response_.catch((error: unknown) => {
            // eslint-disable-next-line no-console
            console.error(error);

            if (rejectOnHandlerError) {
              throw error;
            } else {
              return new Response('Internal Server Error', { status: 500 });
            }
          });

          return (await responsePatcher?.(response)) || response;
        } catch (error) {
          handleError(originalRes, error, deferredReject);
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
            const { parse: parseUrl } = require('node:url');
            const rawParameters = { ...parseUrl(req.url || '', true).query, ...params };
            return (await paramsPatcher?.(rawParameters)) || rawParameters;
          })
          .then((finalParameters) => {
            if (typeof apiResolver !== 'function') {
              throw new TypeError(
                'assertion failed unexpectedly: apiResolver was not a function'
              );
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
             **    page?: boolean
             ** )
             */
            void apiResolver(
              req,
              res,
              finalParameters,
              pagesHandler,
              undefined as any,
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
