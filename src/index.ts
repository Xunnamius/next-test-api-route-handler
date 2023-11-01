/* eslint-disable @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment */
import { createServer } from 'node:http';
import { parse as parseUrl } from 'node:url';

import { parse as parseCookieHeader } from 'cookie';
import fetch, { Headers } from 'node-fetch';

import type { IncomingMessage, Server, ServerResponse } from 'http';
import type { NextApiHandler } from 'next';
import type { Response as FetchReturnValue, RequestInit } from 'node-fetch';

import type { apiResolver as NextApiResolver } from 'next/dist/server/api-utils/node/api-resolver';

/**
 * This function is responsible for adding the headers sent along with every
 * fetch request by default. Headers that already exist will not be overwritten.
 *
 * Current default headers:
 *
 * - `x-msw-bypass: true`
 */
const addDefaultHeaders = (headers: Headers) => {
  if (!headers.has('x-msw-bypass')) {
    headers.set('x-msw-bypass', 'true');
  }

  return headers;
};

let apiResolver: typeof NextApiResolver | null = null;

export type FetchReturnType<NextResponseJsonType> = Promise<
  Omit<FetchReturnValue, 'json'> & {
    json: (
      ...args: Parameters<FetchReturnValue['json']>
    ) => Promise<NextResponseJsonType>;
    cookies: ReturnType<typeof parseCookieHeader>[];
  }
>;

type TryImport = ((path: string) => (
  e: Error
) => // @ts-ignore: this file might not exist in some versions of next
Promise<typeof import('next/dist/server/api-utils/node.js')>) & {
  importErrors: Error[];
};

// ? The result of this function is memoized by the caller, so this function
// ? will only be invoked the first time this script is imported.
const tryImport = ((path: string) => (e: Error) => {
  (tryImport.importErrors = tryImport.importErrors ?? []).push(e);
  /* istanbul ignore next */
  if (typeof __webpack_require__ == 'function') {
    return process.env.NODE_ESM
      ? import(/* webpackIgnore: true */ path)
      : __non_webpack_require__(path);
  } else if (typeof require == 'function') {
    // ? Node12 does not support dynamic imports, so fall back to require first
    return require(path);
  } else {
    return import(path);
  }
}) as unknown as TryImport;

const handleError = (
  res: ServerResponse,
  e: unknown,
  deferredReject: ((e: unknown) => unknown) | null
) => {
  // ? Prevent tests that crash the server from hanging
  if (!res.writableEnded) {
    res.end();
  }

  // ? Throwing at the point this function was called would not normally cause
  // ? testApiHandler to reject because createServer (an EventEmitter) only
  // ? accepts non-async event handlers which swallow errors from async
  // ? functions (which is why `void` is used instead of `await` below). So
  // ? we'll have to get creative! How about: defer rejections manually?
  /* istanbul ignore else */
  if (deferredReject) deferredReject(e);
  else throw e;
};

/**
 * The parameters expected by `testApiHandler`.
 */
export type NtarhParameters<NextResponseJsonType = unknown> = {
  /**
   * If `false`, errors thrown from within a handler are kicked up to Next.js's
   * resolver to deal with, which is what would happen in production. Instead,
   * if `true`, the {@link testApiHandler} function will reject immediately.
   *
   * @default false
   */
  rejectOnHandlerError?: boolean;

  /**
   * A function that receives an `IncomingMessage` object. Use this function to
   * edit the request before it's injected into the handler.
   *
   * **Note: all replacement `IncomingMessage.header` names must be lowercase.**
   */
  requestPatcher?: (req: IncomingMessage) => void;
  /**
   * A function that receives a `ServerResponse` object. Use this functions to
   * edit the request before it's injected into the handler.
   */
  responsePatcher?: (res: ServerResponse) => void;
  /**
   * A function that receives an object representing "processed" dynamic routes;
   * _modifications_ to this object are passed directly to the handler. This
   * should not be confused with query string parsing, which is handled
   * automatically.
   */
  paramsPatcher?: (params: Record<string, unknown>) => void;
  /**
   * `params` is passed directly to the handler and represent processed dynamic
   * routes. This should not be confused with query string parsing, which is
   * handled automatically.
   *
   * `params: { id: 'some-id' }` is shorthand for `paramsPatcher: (params) =>
   * (params.id = 'some-id')`. This is most useful for quickly setting many
   * params at once.
   */
  params?: Record<string, string | string[]>;
  /**
   * `url: 'your-url'` is shorthand for `requestPatcher: (req) => (req.url =
   * 'your-url')`
   */
  url?: string;
  /**
   * The actual handler under test. It should be an async function that accepts
   * `NextApiRequest` and `NextApiResult` objects (in that order) as its two
   * parameters.
   */
  handler: NextApiHandler<NextResponseJsonType>;
  /**
   * `test` must be a function that runs your test assertions, returning a
   * promise (or async). This function receives one destructured parameter:
   * `fetch`, which is the unfetch package's `fetch(...)` function but with the
   * first parameter omitted.
   */
  test: (params: {
    fetch: (customInit?: RequestInit) => FetchReturnType<NextResponseJsonType>;
  }) => Promise<void>;
};

/**
 * Uses Next's internal `apiResolver` to execute api route handlers in a
 * Next-like testing environment.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function testApiHandler<NextResponseJsonType = any>({
  rejectOnHandlerError,
  requestPatcher,
  responsePatcher,
  paramsPatcher,
  params,
  url,
  handler,
  test
}: NtarhParameters<NextResponseJsonType>) {
  let server: Server | null = null;
  let deferredReject: ((e?: unknown) => void) | null = null;

  try {
    if (!apiResolver) {
      // ? The following is for next@>=13.5.4:
      ({ apiResolver } = await import('next/dist/server/api-utils/node/api-resolver.js')
        // ? The following is for next@<13.5.4 >=12.1.0:
        .catch(tryImport('next/dist/server/api-utils/node.js'))
        // ? The following is for next@<12.1.0 >=11.1.0:
        .catch(tryImport('next/dist/server/api-utils.js'))
        // ? The following is for next@<11.1.0 >=9.0.6:
        .catch(tryImport('next/dist/next-server/server/api-utils.js'))
        // ? The following is for next@<9.0.6 >= 9.0.0:
        .catch(tryImport('next-server/dist/server/api-utils.js'))
        .catch((e) => (tryImport.importErrors.push(e), { apiResolver: null })));

      if (!apiResolver) {
        const importErrors = tryImport.importErrors
          .map(
            (e) =>
              e.message.split(/(?<=')( imported)? from ('|\S)/)[0].split(`\nRequire`)[0]
          )
          .join('\n    - ');

        tryImport.importErrors = [];
        // prettier-ignore
        throw new Error(
          `next-test-api-route-handler (NTARH) failed to import api-utils.js` +
            `\n\n  This is usually caused by:` +
            `\n\n    1. Using npm@<7 and/or node@<15, which doesn't install peer deps automatically (review install instructions)` +
              `\n    2. NTARH and the version of Next.js you installed are actually incompatible (please submit a bug report)` +
            `\n\n  Failed import attempts:` +
            `\n\n    - ${importErrors}`
        );
      }
    }

    server = createServer((req, res) => {
      try {
        if (typeof apiResolver != 'function') {
          throw new Error(
            'assertion failed unexpectedly: apiResolver was not a function'
          );
        }

        if (url) {
          req.url = url;
        }

        requestPatcher?.(req);
        responsePatcher?.(res);

        const finalParams = { ...parseUrl(req.url || '', true).query, ...params };

        paramsPatcher?.(finalParams);

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
          finalParams,
          handler,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined as any,
          !!rejectOnHandlerError
        ).catch((e: unknown) => handleError(res, e, deferredReject));
      } catch (e) {
        handleError(res, e, deferredReject);
      }
    });

    const port = await new Promise<number>((resolve, reject) => {
      server?.listen(() => {
        const addr = server?.address();

        if (!addr || typeof addr == 'string') {
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
      test({
        fetch: async (customInit?: RequestInit) => {
          const init: RequestInit = {
            ...customInit,
            headers: addDefaultHeaders(new Headers(customInit?.headers))
          };
          return (fetch(localUrl, init) as FetchReturnType<NextResponseJsonType>).then(
            (res) => {
              // ? Lazy load (on demand) the contents of the `cookies` field
              Object.defineProperty(res, 'cookies', {
                configurable: true,
                enumerable: true,
                get: () => {
                  // @ts-expect-error: lazy getter guarantees this will be set
                  delete res.cookies;
                  res.cookies = [res.headers.raw()['set-cookie'] || []]
                    .flat()
                    .map((header) =>
                      Object.entries(parseCookieHeader(header)).reduce(
                        (obj, [k, v]) =>
                          Object.assign(obj, {
                            [String(k)]: v,
                            [String(k).toLowerCase()]: v
                          }),
                        {}
                      )
                    );
                  return res.cookies;
                }
              });
              return res;
            }
          );
        }
      }).then(resolve, reject);
    });
  } finally {
    server?.close();
  }
}
