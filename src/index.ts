import listen from 'test-listen';
import fetch from 'isomorphic-unfetch';
import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { apiResolver } from 'next/dist/next-server/server/api-utils.js';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Uses Next's internal `apiResolver` to execute api route handlers in a
 * Next-like testing environment.
 *
 * `requestPatcher/responsePatcher` are functions that receive an
 * IncomingMessage and ServerResponse object respectively. Use these functions
 * to edit the request and response before they're injected into the api
 * handler.
 *
 * `params` are passed directly to the api handler and represent processed
 * dynamic routes. This should not be confused with query string parsing, which
 * is handled automatically.
 *
 * `handler` is the actual api handler under test. It should be an async
 * function that accepts NextApiRequest and NextApiResult objects (in that
 * order) as its two parameters.
 *
 * `test` should be a function that returns a promise (or async) where test
 * assertions can be run. This function receives one parameter: fetch, which is
 * unfetch's `fetch(...)` function but with the first parameter omitted.
 */
export async function testApiHandler({
  requestPatcher,
  responsePatcher,
  params,
  handler,
  test
}: {
  requestPatcher?: (req: IncomingMessage) => void;
  responsePatcher?: (res: ServerResponse) => void;
  params?: Record<string, unknown>;
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  test: (obj: {
    fetch: (init?: RequestInit) => ReturnType<typeof fetch>;
  }) => Promise<void>;
}) {
  let server = null;

  try {
    const localUrl = await listen(
      (server = createServer((req, res) => {
        requestPatcher && requestPatcher(req);
        responsePatcher && responsePatcher(res);

        /**
         *? From next internals:
         ** apiResolver(
         **    req: IncomingMessage,
         **    res: ServerResponse,
         **    query: any,
         **    resolverModule: any,
         **    apiContext: __ApiPreviewProps,
         **    propagateError: boolean,
         **    onError?: ({ err }: { err: any }) => Promise<void>
         ** )
         */
        void apiResolver(
          req,
          res,
          { ...parseUrl(req.url || '', true).query, ...params },
          handler,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined as any,
          true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined as any
        );
      }))
    );

    await test({ fetch: (init?: RequestInit) => fetch(localUrl, init) });
  } finally {
    server?.close();
  }
}
