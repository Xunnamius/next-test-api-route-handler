[![npm version](https://badge.fury.io/js/next-test-api-route-handler.svg)](https://badge.fury.io/js/next-test-api-route-handler)

# next-test-api-route-handler

Trying to unit test your [Next.js API route
handlers](https://nextjs.org/docs/api-routes/introduction)? Want to avoid
mucking around with custom servers and writing boring test infra just to get
some unit tests working? Want your handlers to receive actual
[NextApiRequest](https://github.com/vercel/next.js/blob/241f38eaa8aa2199360dc28d76759c936f16cdd6/packages/next/next-server/lib/utils.ts#L194)
and
[NextApiResponse](https://github.com/vercel/next.js/blob/241f38eaa8aa2199360dc28d76759c936f16cdd6/packages/next/next-server/lib/utils.ts#L194)
objects rather than having to hack something together with express? Then look no
further! This package allows you to test your Next.js API routes/handlers in an
isolated Next.js-like environment simply, quickly, and without hassle.

One day, Next.js might expose an API for testing our handlers (or at least
generating proper NextApiRequest and NextApiResponse objects). Until then,
there's `next-test-api-route-handler`! 🎉🎉🎉

This package requires Next.js and ES2015/TypeScript.

> This package uses Next.js's internal API resolver to precisely emulate API
> route handling. Since this is not a public or documented interface, the
> version of Next.js this package depends on is locked to `9.5.4-canary.24`.
> This is to ensure the resolver is always available with the interface we
> expect. [This is not a problem unless there is a significant change to API
> route handling in
> Next.js](https://github.com/vercel/next.js/blame/v9.5.4-canary.24/packages/next/next-server/server/api-utils.ts#L23),
> in which case this package will be updated to match (issues and PRs welcome).

## Install

```sh
npm install next-test-api-route-handler
```

## Usage

```TypeScript
import { testApiHandler } from 'next-test-api-route-handler'
```

If you're using TypeScript, [this package's types](src/types.ts) are also
exported:

```TypeScript
import type { TestParams } from 'next-test-api-route-handler'
```

The interface for `testApiHandler` looks like this:

```TypeScript
testApiHandler(
    requestPatcher?: (req: IncomingMessage) => void,
    responsePatcher?: (res: ServerResponse) => void,
    params?: Record<string, unknown>,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    test: (obj: TestParams) => Promise<void>,
)
```

`requestPatcher` is a function that receives an
[IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage).
Use this function to modify the request before it's injected into Next.js's
resolver.

`responsePatcher` is a function that receives an
[ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse).
Use this function to modify the response before it's injected into Next.js's
resolver.

`params` is an object representing "processed" dynamic routes, e.g. testing a
handler that expects `/api/user/:id` requires `params: { id: ...}`. This should
not be confused with requiring query string parameters, which are parsed out
automatically from the url.

`handler` is the actual route handler under test (usually imported from
`pages/api/*`). It should be an async function that accepts
[NextApiRequest](https://github.com/vercel/next.js/blob/241f38eaa8aa2199360dc28d76759c936f16cdd6/packages/next/next-server/lib/utils.ts#L194)
and
[NextApiResponse](https://github.com/vercel/next.js/blob/241f38eaa8aa2199360dc28d76759c936f16cdd6/packages/next/next-server/lib/utils.ts#L194)
objects as its two parameters.

`test` is a function that returns a promise (or async) where test assertions can
be run. This function receives one parameter: `fetch`, which is a simple
[unfetch](https://www.npmjs.com/package/isomorphic-unfetch) instance (**note
that the url parameter (the first parameter) in
[`fetch(...)`](https://github.com/developit/unfetch#examples--demos) is
omitted**). Use this to send HTTP requests to the handler under test.

## Examples

### Testing an unreliable API handler @ `pages/api/unreliable`

Suppose we have an API endpoint we use to test our application's error handling.
The endpoint responds with status code `HTTP 200` for every request except the
10th, where status code `HTTP 555` is returned instead.

How might we test that this endpoint responds with `HTTP 555` once for every
nine `HTTP 200` responses?

```TypeScript
import * as UnreliableHandler from '../pages/api/unreliable'
import { testApiHandler } from 'next-test-endpoint'
import { shuffle } from 'fast-shuffle'

import type { WithConfig } from '@ergodark/next-types'
import type { TestParams } from 'next-test-api-route-handler'

// Import the handler under test from the pages/api directory and respect the
// Next.js config object if it's exported
const unreliableHandler: WithConfig<typeof UnreliableHandler.default> = UnreliableHandler.default;
unreliableHandler.config = UnreliableHandler.config;

it('injects contrived errors at the required rate', async () => {
    expect.hasAssertions();

    // Signal to the endpoint (which is configurable) that there should be 1
    // error among every 10 requests
    process.env.REQUESTS_PER_CONTRIVED_ERROR = '10';

    const expectedReqPerError = parseInt(process.env.REQUESTS_PER_CONTRIVED_ERROR);

    // Returns one of ['GET', 'POST', 'PUT', 'DELETE'] at random
    const getMethod = () => shuffle(['GET', 'POST', 'PUT', 'DELETE'])[0];

    // Returns the status code from a response object
    const getStatus = async (res: Promise<Response>) => (await res).status;

    await testApiHandler({
        handler: unreliableHandler,
        test: async ({ fetch }: TestParams) => {
            // Run 20 requests with REQUESTS_PER_CONTRIVED_ERROR = '10' and
            // record the results
            const results1 = await Promise.all([
                ...[...Array(expectedReqPerError - 1)].map(_ => getStatus(fetch({ method: getMethod() }))),
                getStatus(fetch({ method: getMethod() })),
                ...[...Array(expectedReqPerError - 1)].map(_ => getStatus(fetch({ method: getMethod() }))),
                getStatus(fetch({ method: getMethod() }))
            ].map(p => p.then(s => s, _ => null)));

            process.env.REQUESTS_PER_CONTRIVED_ERROR = '0';

            // Run 10 requests with REQUESTS_PER_CONTRIVED_ERROR = '0' and
            // record the results
            const results2 = await Promise.all([
                ...[...Array(expectedReqPerError)].map(_ => getStatus(fetch({ method: getMethod() }))),
            ].map(p => p.then(s => s, _ => null)));

            // We expect results1 to be an array with eighteen `200`s and two
            // `555`s in any order

            // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
            // because responses could be received out of order
            expect(results1).toIncludeSameMembers([
                ...[...Array(expectedReqPerError - 1)].map(_ => 200),
                555,
                ...[...Array(expectedReqPerError - 1)].map(_ => 200),
                555
            ]);

            // We expect results2 to be an array with ten `200`s

            expect(results2).toStrictEqual([
                ...[...Array(expectedReqPerError)].map(_ => 200),
            ]);
        }
    });
});
```

### Testing a flight search API handler @ `pages/api/v3/flights/search`

Suppose we have an *authenticated* API endpoint our application uses to search
for flights. The endpoint responds with an array of flights satisfying the
query.

How might we test that this endpoint returns flights in our database as
expected?

```TypeScript
import * as V3FlightsSearchHandler from '../pages/api/v3/flights/search'
import { testApiHandler } from 'next-test-endpoint'
import { DUMMY_API_KEY as KEY, getFlightData, RESULT_SIZE } from '../backend'

import type { WithConfig } from '@ergodark/next-types'
import type { TestParams } from 'next-test-api-route-handler'

// Import the handler under test from the pages/api directory and respect the
// Next.js config object if it's exported
const v3FlightsSearchHandler: WithConfig<typeof V3FlightsSearchHandler.default> = V3FlightsSearchHandler.default;
v3FlightsSearchHandler.config = V3FlightsSearchHandler.config;

it('returns expected public flights with respect to match', async () => {
    expect.hasAssertions();

    // Get the flight data currently in the test database
    const flights = getFlightData();

    // Take any JSON object and stringify it into a URL-ready string
    const encode = (o: Record<string, unknown>) => encodeURIComponent(JSON.stringify(o));

    // This function will return in order the URIs we're interested in testing
    // against our handler. Query strings are parsed automatically, though we
    // also could have used `params` or `fetch({ ... })` itself instead.
    //
    // Example URI for `https://google.com/search?params=yes` would be
    // `/search?params=yes`
    const genUrl = function*() {
        yield `/?match=${encode({ airline: 'Spirit' })}`; // i.e. we want all the flights matching Spirit airlines!
        yield `/?match=${encode({ type: 'departure' })}`;
        yield `/?match=${encode({ landingAt: 'F1A' })}`;
        yield `/?match=${encode({ seatPrice: 500 })}`;
        yield `/?match=${encode({ seatPrice: { $gt: 500 } })}`;
        yield `/?match=${encode({ seatPrice: { $gte: 500 } })}`;
        yield `/?match=${encode({ seatPrice: { $lt: 500 } })}`;
        yield `/?match=${encode({ seatPrice: { $lte: 500 } })}`;
    }();

    await testApiHandler({
        // Patch the request object to include our dummy API key
        requestPatcher: req => { req.url = genUrl.next().value || undefined },

        handler: v3FlightsSearchHandler,

        test: async ({ fetch }) => {
            // 8 URLS from genUrl means 8 calls to fetch:
            const responses = await Promise.all([...Array(8)].map(_ => {
                return fetch({ headers: { KEY } }).then(r => r.ok ? r.json() : r.status);
            }));

            // We expect all of the responses to be 200

            expect(responses.some(o => !o?.success)).toBe(false);

            // We expect the array of flights returned to match our
            // expectations given we already know what dummy data will be
            // returned:

            // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
            // because responses could be received out of order
            expect(responses.map(r => r.flights)).toIncludeSameMembers([
                flights.filter(f => f.airline == 'Spirit').slice(0, RESULT_SIZE),
                flights.filter(f => f.type == 'departure').slice(0, RESULT_SIZE),
                flights.filter(f => f.landingAt == 'F1A').slice(0, RESULT_SIZE),
                flights.filter(f => f.seatPrice == 500).slice(0, RESULT_SIZE),
                flights.filter(f => f.seatPrice > 500).slice(0, RESULT_SIZE),
                flights.filter(f => f.seatPrice >= 500).slice(0, RESULT_SIZE),
                flights.filter(f => f.seatPrice < 500).slice(0, RESULT_SIZE),
                flights.filter(f => f.seatPrice <= 500).slice(0, RESULT_SIZE),
            ]);
        }
    });

    // We expect these two to fail with 400 errors

    await testApiHandler({
        handler: v3FlightsSearchHandler,
        requestPatcher: req => { req.url = `/?match=${encode({ ffms: { $eq: 500 }})}` },
        test: async ({ fetch }) => expect((await fetch({ headers: { KEY } })).status).toBe(400)
    });

    await testApiHandler({
        handler: v3FlightsSearchHandler,
        requestPatcher: req => { req.url = `/?match=${encode({ bad: 500 })}` },
        test: async ({ fetch }) => expect((await fetch({ headers: { KEY } })).status).toBe(400)
    });
});
```

See [test/index.test.ts](test/index.test.ts) for more examples.

## Documentation

Documentation can be found under [`docs/`](docs/README.md) and can be built with
`npm run build-docs`.

## Contributing

Issues and pull requests are welcome! In lieu of a formal styleguide, take care
to maintain the existing coding style.

Add unit tests for any new or changed functionality. Please lint and test your
code!

## Release History

* 1.0.x Initial release

