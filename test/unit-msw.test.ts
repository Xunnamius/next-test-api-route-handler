// * These tests ensure NTARH and MSW integrate as expected

import { HttpResponse, http, passthrough } from 'msw';
import { setupServer } from 'msw/node';
import { testApiHandler } from 'universe/index';

const server = setupServer(
  http.all('*', async ({ request: req, params }) => {
    const { method, headers } = req;
    const body = await req.text();

    return HttpResponse.json(
      { method, headers: Array.from(headers), params, body },
      {
        status: body.startsWith('status=')
          ? Number.parseInt(body.split('status=').at(-1) || '200')
          : 200
      }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => server.close());

it('bypasses msw by default', async () => {
  expect.hasAssertions();

  await testApiHandler({
    rejectOnHandlerError: true,
    handler(_, res) {
      res.status(200).send({ from: 'ntarh' });
    },
    async test({ fetch }) {
      const res = await fetch({ method: 'POST' });
      const json = await res.json();

      expect(json).toStrictEqual({ from: 'ntarh' });
    }
  });
});

it('does not bypass msw if header is explicitly disabled (README example)', async () => {
  expect.hasAssertions();

  // e.g. https://xunn.at/gg => https://www.google.com/search?q=next-test-api-route-handler
  // shortId would be "gg"
  // realLink would be https://www.google.com/search?q=next-test-api-route-handler

  const { shortId, realLink } = getUriEntry();
  const realUrl = new URL(realLink);

  await testApiHandler({
    handler,
    params: { shortId },
    test: async ({ fetch }) => {
      server.use(
        http.get('*', async ({ request }) => {
          return request.url === realUrl.href
            ? HttpResponse.json({ it: 'worked' }, { status: 200 })
            : passthrough();
        })
      );

      const res = await fetch({
        headers: { 'x-msw-intention': 'none' } // <==
      });

      await expect(res.json()).resolves.toMatchObject({ it: 'worked' });
      expect(res.status).toBe(200);
    }
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(_: any, res: any) {
  return res.status(200).send(await (await fetch(getUriEntry().realLink)).json());
}

function getUriEntry() {
  return {
    shortId: 'gg',
    realLink: 'https://www.google.com/search?q=next-test-api-route-handler'
  };
}
