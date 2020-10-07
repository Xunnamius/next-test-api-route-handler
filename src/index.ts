import listen from 'test-listen'
import fetch from 'isomorphic-unfetch'
import { createServer } from 'http'
import { parse as parseUri } from 'url'
import { apiResolver } from 'next/dist/next-server/server/api-utils'

import type { TesApiHanParams } from './types'

export * from './types';

/**
 * Uses Next's internal `apiResolver` to execute api route handlers in a
 * Next-like testing environment.
 *
 * @param test should be a function that returns a promise (or async) where test
 * assertions can be run. This function receives one parameter: fetch, which is
 * unfetch's `fetch(...)` function but with the first parameter omitted.
 *
 * @param params are passed directly to the api handler and represent processed
 * dynamic routes. This should not be confused with query string parsing, which
 * is handled automatically.
 *
 * @param requestPatcher/responsePatcher are functions that receive an
 * IncomingMessage and ServerResponse object respectively. Use these functions
 * to edit the request and response before they're injected into the api
 * handler.
 *
 * @param handler is the actual api handler under test. It should be an async
 * function that accepts NextApiRequest and NextApiResult objects (in that
 * order) as its two parameters.
 */
export async function testApiHandler({ test, params, requestPatcher, responsePatcher, handler }: TesApiHanParams) {
    let server = null;

    try {
        const url = await listen(server = createServer((req, res) => {
            requestPatcher && requestPatcher(req);
            responsePatcher && responsePatcher(res);

            /**
             *? 9.5.4-canary.24
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
            return apiResolver(
                req,
                res,
                { ...parseUri(req.url || '', true).query, ...params },
                handler,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                undefined as any,
                true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                undefined as any);
        }));

        await test({ fetch: (init?: RequestInit) => fetch(url, init) });
    }

    finally {
        server?.close();
    }
}
