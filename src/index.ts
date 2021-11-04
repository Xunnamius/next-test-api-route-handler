/* eslint-disable @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment */
import listen from 'test-listen';
import fetch from 'isomorphic-unfetch';
import { createServer } from 'http';
import { parse as parseUrl } from 'url';

import type { PromiseValue } from 'type-fest';
import type { NextApiHandler } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

// @ts-ignore: ignore this (conditional) import so bundlers don't choke and die
import type { apiResolver as NextApiResolver } from 'next/dist/server/api-utils';

let apiResolver: typeof NextApiResolver | null = null;

type FetchReturnValue = PromiseValue<ReturnType<typeof fetch>>;
type FetchReturnType<NextResponseJsonType> = Promise<
  Omit<FetchReturnValue, 'json'> & {
    json: (
      ...args: Parameters<FetchReturnValue['json']>
    ) => Promise<NextResponseJsonType>;
  }
>;

type TryImport = ((
  path: string
  // @ts-ignore: this file might not exist in some versions of next
) => (e: Error) => typeof import('next/dist/server/api-utils.js')) & {
  importErrors: Error[];
};

// ? The result of the calling function is memoized, so this function will only
// ? be invoked the first time this script is imported.
/* istanbul ignore next */
const tryImport = ((path: string) => (e: Error) => {
  (tryImport.importErrors = tryImport.importErrors ?? []).push(e);
  return import(path);
}) as unknown as TryImport;

/**
 * The parameters expected by `testApiHandler`.
 */
export type TestParameters<NextResponseJsonType = unknown> = {
  /**
   * A function that receives an `IncomingMessage` object. Use this function to
   * edit the request before it's injected into the handler.
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
   * promise (or async). This function receives one parameter: `fetch`, which is
   * the unfetch package's `fetch(...)` function but with the first parameter
   * omitted.
   */
  test: (obj: {
    fetch: (init?: RequestInit) => FetchReturnType<NextResponseJsonType>;
  }) => Promise<void>;
};

/**
 * Uses Next's internal `apiResolver` to execute api route handlers in a
 * Next-like testing environment.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function testApiHandler<NextResponseJsonType = any>({
  requestPatcher,
  responsePatcher,
  paramsPatcher,
  params,
  url,
  handler,
  test
}: TestParameters<NextResponseJsonType>) {
  let server = null;

  try {
    /* istanbul ignore next */
    if (!apiResolver) {
      // ? The following is for next@>=11.1.0:
      // @ts-ignore: conditional import for earlier next versions
      ({ apiResolver } = await import('next/dist/server/api-utils.js')
        // ? The following is for next@<11.1.0 >=9.0.6:
        .catch(tryImport('next/dist/next-server/server/api-utils.js'))
        // ? The following is for next@<9.0.6 >= 9.0.0:
        .catch(tryImport('next-server/dist/server/api-utils.js'))
        .catch((e) => (tryImport.importErrors.push(e), { apiResolver: null })));

      if (!apiResolver) {
        // prettier-ignore
        throw new Error(
          `failed to import api-utils.js` +
            `\n\n  This is usually caused by:` +
            `\n\n    1. Using npm@<7 and/or node@<15, which doesn't install peer deps automatically (review install instructions)` +
              `\n    2. NTARH and the version of Next.js you installed are actually incompatible (please submit a bug report)` +
            `\n\n  Failed import attempts:` +
            `\n\n    - ${tryImport.importErrors
              .map((e) => e.message.split('imported from')[0].split(`\nRequire`)[0])
              .join('\n    - ')}`
        );
      }
    }

    const localUrl = await listen(
      (server = createServer((req, res) => {
        try {
          /* istanbul ignore next */
          if (typeof apiResolver != 'function') {
            throw new Error(
              'assertion failed unexpectedly: apiResolver was not a function'
            );
          }

          url && (req.url = url);
          requestPatcher && requestPatcher(req);
          responsePatcher && responsePatcher(res);

          const finalParams = { ...parseUrl(req.url || '', true).query, ...params };
          paramsPatcher && paramsPatcher(finalParams);

          /**
           *? From Next.js internals:
           ** apiResolver(
           **    req: IncomingMessage,
           **    res: ServerResponse,
           **    query: any,
           **    resolverModule: any,
           **    apiContext: __ApiPreviewProps,
           **    propagateError: boolean
           ** )
           */
          void apiResolver(
            req,
            res,
            finalParams,
            handler,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            undefined as any,
            false
          );
        } catch (e) {
          /* istanbul ignore next */
          // ? Prevent tests that crash the server from hanging
          !res.writableEnded && res.end();
          /* istanbul ignore next */
          // ? Allow the exception to bubble naturally
          throw e;
        }
      }))
    );

    await test({
      fetch: (init?: RequestInit) =>
        fetch(localUrl, init) as FetchReturnType<NextResponseJsonType>
    });
  } finally {
    server?.close();
  }
}
