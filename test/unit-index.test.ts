import { testApiHandler } from '../src/index';

import type { NextApiRequest, NextApiResponse } from 'next';

const getHandler = (status?: number) => async (
  _: NextApiRequest,
  res: NextApiResponse
) => {
  res.status(status ?? 200).send({ hello: 'world' });
};

describe('next-test-api-route [UNIT-INDEX]', () => {
  describe('::testApiHandler', () => {
    it('functions with minimal args', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: getHandler(),
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(200);
          expect(await (await fetch()).json()).toStrictEqual({ hello: 'world' });
        }
      });

      await testApiHandler({
        handler: getHandler(404),
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(404);
          expect(await (await fetch()).json()).toStrictEqual({ hello: 'world' });
        }
      });
    });

    it('respects changes introduced through request patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        requestPatcher: (req) => (req.headers.key = 'secret'),

        handler: async (req: NextApiRequest, res: NextApiResponse) => {
          res.status(500).send({ data: req.headers.key });
        },

        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(500);
          expect(await (await fetch()).json()).toStrictEqual({ data: 'secret' });
        }
      });
    });

    it('respects changes introduced through response patcher', async () => {
      expect.hasAssertions();

      await testApiHandler({
        responsePatcher: (res) => (res.statusCode = 404),
        handler: async (_: NextApiRequest, res: NextApiResponse) => res.send({}),

        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(404);
          expect(await (await fetch()).json()).toStrictEqual({});
        }
      });
    });

    it('respects params object', async () => {
      expect.hasAssertions();

      await testApiHandler({
        params: { a: '1' },
        requestPatcher: (req) => (req.url = '/api/handler?b=2&c=3'),

        handler: async (req: NextApiRequest, res: NextApiResponse) => {
          expect(req.query).toStrictEqual({ a: '1', b: '2', c: '3' });
          res.send({});
        },

        test: async ({ fetch }) => void (await fetch())
      });
    });

    it("respects route handler's config property", async () => {
      expect.hasAssertions();

      const handler: ReturnType<typeof getHandler> & {
        config?: Record<string, unknown>;
      } = getHandler();
      // See https://nextjs.org/docs/api-routes/api-middlewares#custom-config
      handler.config = { api: { bodyParser: { sizeLimit: 1 /* bytes */ } } };

      await testApiHandler({
        handler,
        test: async ({ fetch }) => {
          expect((await fetch()).status).toBe(200);
          expect((await fetch({ method: 'POST', body: 'more than 1 byte' })).status).toBe(
            413
          );
        }
      });
    });
  });
});
