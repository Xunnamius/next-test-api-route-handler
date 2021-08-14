/* eslint-disable import/no-unresolved, @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment */
import listen from 'test-listen';
import fetch from 'isomorphic-unfetch';
import { createServer } from 'http';
import { parse as parseUrl } from 'url';

import type { NextApiHandler } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * The parameters expected by `testApiHandler`.
 */
export type Parameters<NextApiHandlerType = unknown> = {
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
  handler: NextApiHandler<NextApiHandlerType>;
  /**
   * `test` must be a function that runs your test assertions, returning a
   * promise (or async). This function receives one parameter: `fetch`, which is
   * the unfetch package's `fetch(...)` function but with the first parameter
   * omitted.
   */
  test: (obj: {
    fetch: (init?: RequestInit) => ReturnType<typeof fetch>;
  }) => Promise<void>;
};

/**
 * Uses Next's internal `apiResolver` to execute api route handlers in a
 * Next-like testing environment.
 */
export async function testApiHandler<NextApiHandlerType = unknown>({
  requestPatcher,
  responsePatcher,
  paramsPatcher,
  params,
  url,
  handler,
  test
}: Parameters<NextApiHandlerType>) {
  let server = null;

  try {
    /* eslint-disable import/no-unresolved, @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment */
    // ? The following is for next@>=11.1.0:
    // @ts-ignore: conditional import for earlier next versions
    const { apiResolver } = await import('next/dist/server/api-utils.js')
      // ? The following is for next@<11.1.0 >=10:
      // @ts-ignore: conditional import for earlier next versions
      .catch(() => import('next/dist/next-server/server/api-utils.js'))
      // ? The following is for next@<10:
      // @ts-ignore: conditional import for earlier next versions
      .catch(() => import('next-server/dist/server/api-utils.js'))
      /* eslint-enable import/no-unresolved */
      .catch(() => {
        throw new Error(
          'dependency resolution failed: NTARH and the installed version of Next.js are incompatible'
        );
      });

    const localUrl = await listen(
      (server = createServer((req, res) => {
        url && (req.url = url);
        requestPatcher && requestPatcher(req);
        responsePatcher && responsePatcher(res);

        const finalParams = { ...parseUrl(req.url || '', true).query, ...params };
        paramsPatcher && paramsPatcher(finalParams);

        /**
         *? From next internals:
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
          true
        );
      }))
    );

    await test({ fetch: (init?: RequestInit) => fetch(localUrl, init) });
  } finally {
    server?.close();
  }
}
