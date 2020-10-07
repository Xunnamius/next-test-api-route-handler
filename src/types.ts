import fetch from 'isomorphic-unfetch'
import { NextApiRequest, NextApiResponse } from 'next'

import type { IncomingMessage, ServerResponse } from 'http'

export type TestParams = { fetch: (init?: RequestInit) => ReturnType<typeof fetch> };

export type TesApiHanParams = {
    test: (obj: TestParams) => Promise<void>,
    params?: Record<string, unknown>,
    requestPatcher?: (req: IncomingMessage) => void,
    responsePatcher?: (res: ServerResponse) => void,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
};
