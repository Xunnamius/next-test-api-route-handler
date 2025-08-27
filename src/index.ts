/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/no-explicit-any */

import assert from 'node:assert';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

// Remove unused Server type and avoid duplicate identifiers
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

        const response = await (pagesHandler
          ? runPagesRouter(init)
          : runAppRouter(init));

        // ? Lazy load (on demand) the contents of the `cookies` field
        Object.defineProperty(response, 'cookies', {
          configurable: true,
          enumerable: true,
          get: () => {
            const { parse: parseCookieHeader } = require('cookie');
            const parsed = response.headers.getSetCookie().map((header) =>
              Object.fromEntries(
                Object.entries(parseCookieHeader(header)).flatMap(([k, v]) => {
                  return [
                    [k, String(v)],
                    [k.toLowerCase(), String(v)]
                  ];
                })
              )
            );
            // Cache result on the instance for subsequent reads
            Object.defineProperty(response, 'cookies', {
              configurable: true,
              enumerable: true,
              value: parsed
            });
            return parsed as any;
          }
        });

        return rebindJsonMethodAsSummoner(response) as any;
      }
    });
  } finally {
    // No network server to close; handlers are invoked directly
  }
  async function runAppRouter(init: RequestInit): Promise<Response> {
    // ? Keep these imports local so older Next.js versions don't choke and die.
    type NextRequest_ = typeof import('next/server').NextRequest;
    const NextRequest = require('next/server').NextRequest as NextRequest_;

    assert(appHandler !== undefined);

    const request_ = new Request(
      normalizeUrlForceTrailingSlashIfPathnameEmpty(url || defaultNextRequestMockUrl),
      init
    );

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
    } = request_;

    const rawRequest = rebindJsonMethodAsSummoner(
      new NextRequest(
        normalizeUrlForceTrailingSlashIfPathnameEmpty(url || defaultNextRequestMockUrl),
        {
          body: request_.body,
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
    const isNextRequest = (
      value: unknown
    ): value is InstanceType<typeof NextRequest> => {
      return Boolean(value && typeof value === 'object' && 'nextUrl' in (value as any));
    };
    const nextRequest = isNextRequest(patchedRequest)
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
    const appRouteRouteModule = await mockEnvVariable('NODE_ENV', 'development', () => {
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
    });

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

    let response = rebindJsonMethodAsSummoner(
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

    // Normalize to a plain Response so we can safely attach cookies
    response = await toPlainResponse(response);

    // Normalize HEAD: empty body
    if ((init.method || 'GET').toUpperCase() === 'HEAD') {
      response = new Response(null, {
        status: response.status,
        headers: response.headers
      });
    }

    return (await responsePatcher?.(response)) || response;
  }

  async function runPagesRouter(init: RequestInit): Promise<Response> {
    assert(pagesHandler_ !== undefined);

    const req = new IncomingMessage(new Socket());
    const res = new ServerResponse(req);

    req.method = (init.method || 'GET').toUpperCase();
    req.url = url || defaultNextRequestMockUrl;

    // Set headers
    const headers = new Headers(init.headers);
    (req as any).headers = Object.fromEntries(headers.entries());

    // Allow patchers to mutate req/res first (e.g., modify req.url)
    await Promise.resolve(requestPatcher?.(req as any));
    await Promise.resolve(responsePatcher?.(res as any));

    // Build finalParameters = parsed query (from possibly patched req.url) + params
    // eslint-disable-next-line n/no-deprecated-api
    const { parse: parseUrl } = require('node:url');
    const parsed = parseUrl(req.url || '', true);
    const rawParameters: Record<string, unknown> = {
      ...parsed.query,
      ...params
    };
    const patchedParameters =
      (await Promise.resolve(paramsPatcher?.(rawParameters as any))) || rawParameters;
    const finalParameters = returnUndefinedIfEmptyObject(patchedParameters as any);

    // Buffer body from init using Request to normalize
    const request_ = new Request(
      normalizeUrlForceTrailingSlashIfPathnameEmpty(url || defaultNextRequestMockUrl),
      init
    );
    const bodyArray = new Uint8Array(await request_.arrayBuffer());
    if (bodyArray.byteLength) {
      (req as any).push(Buffer.from(bodyArray));
    }
    (req as any).push(null);

    // Intercept headers and body writes
    const headerMap = new Map<string, string | string[]>();
    const chunks: Buffer[] = [];

    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (name: string, value: number | string | readonly string[]) => {
      headerMap.set(
        name.toLowerCase(),
        Array.isArray(value) ? [...value] : String(value)
      );
      return originalSetHeader(name, value as any);
    };
    res.getHeader = (name: string) => headerMap.get(name.toLowerCase()) as any;
    res.getHeaderNames = () => Array.from(headerMap.keys());
    res.removeHeader = (name: string) => {
      headerMap.delete(name.toLowerCase());
      return undefined as any;
    };

    const originalWrite = res.write.bind(res);
    res.write = (chunk: any, encoding?: any, callback?: any) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding));
      if (typeof callback === 'function') callback();
      return originalWrite.call(res, chunk, encoding, callback);
    };

    const responsePromise = new Promise<Response>((resolve, reject) => {
      const endOrig = res.end.bind(res);
      res.end = (chunk?: any, encoding?: any, callback?: any) => {
        try {
          if (chunk)
            chunks.push(
              Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding)
            );
          const body = Buffer.concat(chunks);
          const status = res.statusCode || 200;
          const headersInit: [string, string | string[]][] = Array.from(
            headerMap.entries()
          );
          const webHeaders = new Headers();
          for (const [k, v] of headersInit) {
            if (Array.isArray(v)) v.forEach((vv) => webHeaders.append(k, vv));
            else webHeaders.set(k, v);
          }
          const response = new Response(body, { status, headers: webHeaders });
          if (typeof callback === 'function') callback();
          resolve(response);
        } catch (error) {
          const error_ = ((): Error => {
            if (error && typeof error === 'object' && 'message' in (error as any)) {
              try {
                // If it quacks like an Error, assume it is
                return error as Error;
              } catch {
                // fall through
              }
            }
            return new Error(String(error));
          })();
          reject(error_);
        }
        return endOrig(chunk, encoding, callback);
      };
    });

    if (typeof apiResolver !== 'function') {
      assert(
        apiResolver[$importFailed],
        'assertion failed unexpectedly: apiResolver was not a function'
      );

      throw apiResolver[$importFailed];
    }

    await apiResolver(
      req as any,
      res as any,
      finalParameters,
      pagesHandler as any,
      {} as any,
      !!rejectOnHandlerError
    ).catch((error: unknown) => handleError(res as any, error, deferredReject));

    let finalResponse = await responsePromise;
    finalResponse = await toPlainResponse(finalResponse);
    if ((init.method || 'GET').toUpperCase() === 'HEAD') {
      finalResponse = new Response(null, {
        status: finalResponse.status,
        headers: finalResponse.headers
      });
    }
    return finalResponse;
  }

  async function toPlainResponse(res: Response): Promise<Response> {
    // If it's already a plain Response without a cookies prop, reuse
    const proto = Object.getPrototypeOf(res);
    const hasCookies =
      Object.prototype.hasOwnProperty.call(res, 'cookies') || 'cookies' in res;
    if (proto?.constructor?.name === 'Response' && !hasCookies) return res;

    // Rewrap by materializing the body
    const clone = res.clone();
    const ab = await clone.arrayBuffer();
    return new Response(ab, { status: res.status, headers: res.headers });
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

// (removed) readableStreamOrNullFromAsyncIterable helper was unused in direct invocation mode

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
