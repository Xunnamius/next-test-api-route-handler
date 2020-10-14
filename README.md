[![Join the movement!](https://api.ergodark.com/badges/blm)](https://m4bl.org/take-action)
[![This package works with Next.js versions up to and including this one](https://api.ergodark.com/badges/is-next-compat)](https://www.npmjs.com/package/next-test-api-route-handler)
[![This package uses an internal API feature from this specific version of Next.js](https://api.ergodark.com/badges/next-lock-version)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View this project on GitHub](https://img.shields.io/maintenance/active/2020)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View this project on GitHub](https://img.shields.io/github/last-commit/xunnamius/next-test-api-route-handler/develop)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View this project's open issues on GitHub](https://img.shields.io/github/issues/xunnamius/next-test-api-route-handler)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View this project's open pull requests on GitHub](https://img.shields.io/github/issues-pr/xunnamius/next-test-api-route-handler)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View the status of this project's dependencies on DavidDM](https://img.shields.io/david/xunnamius/next-test-api-route-handler)](https://david-dm.org/xunnamius/next-test-api-route-handler)
[![View this project on NPM](https://img.shields.io/npm/l/next-test-api-route-handler)](https://www.npmjs.com/package/next-test-api-route-handler)
[![View this project on NPM](https://api.ergodark.com/badges/npm-pkg-version/next-test-api-route-handler)](https://www.npmjs.com/package/next-test-api-route-handler)

# next-test-api-route-handler

Trying to unit test your [Next.js API route
handlers](https://nextjs.org/docs/api-routes/introduction)? Want to avoid
mucking around with custom servers and writing boring test infra just to get
some unit tests working? Want your handlers to receive actual
[NextApiRequest](https://nextjs.org/docs/basic-features/typescript#api-routes)
and
[NextApiResponse](https://nextjs.org/docs/basic-features/typescript#api-routes)
objects rather than having to hack something together with express? Then look no
further! This package allows you to test your Next.js API routes/handlers in an
isolated Next.js-like environment simply, quickly, and without hassle.

One day, Next.js might expose an API for testing our handlers (or at least
generating proper NextApiRequest and NextApiResponse objects). Until then,
there's `next-test-api-route-handler`! 🎉🎉🎉

> This package uses Next.js's internal API resolver to precisely emulate API
> route handling. Since this is not a public or documented interface, the next
> dependency is locked to [![This package uses an internal API feature from this
> specific version of
> Next.js](https://img.shields.io/npm/dependency-version/next-test-api-route-handler/next?label=next)](https://www.npmjs.com/package/next-test-api-route-handler).
> This package is automatically tested for compatibility with [each full release
> of Next.js](https://github.com/vercel/next.js/releases): [![This package works
> with Next.js versions up to and including this
> one](https://api.ergodark.com/badges/is-next-compat)](https://www.npmjs.com/package/next-test-api-route-handler).
> Any incompatibilities, albeit rare, will be fixed as they are detected.

If you're looking for a version of `next-test-api-route-handler` that works with
some long-ago previous version of Next.js, consult [CHANGELOG.md](CHANGELOG.md).

## Install

```sh
npm install next-test-api-route-handler
```

## Usage

```TypeScript
import { testApiHandler } from 'next-test-api-route-handler'
```

The interface for `testApiHandler` looks like this:

```TypeScript
async function testApiHandler({ requestPatcher, responsePatcher, params, handler, test }: {
    requestPatcher?: (req: IncomingMessage) => void,
    responsePatcher?: (res: ServerResponse) => void,
    params?: Record<string, unknown>,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
    test: (obj: { fetch: (init?: RequestInit) => ReturnType<typeof fetch> }) => Promise<void>,
})
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
from the url and added to the params object automatically.

`handler` is the actual route handler under test (usually imported from
`pages/api/*`). It should be an async function that accepts
[NextApiRequest](https://nextjs.org/docs/basic-features/typescript#api-routes)
and
[NextApiResponse](https://nextjs.org/docs/basic-features/typescript#api-routes)
objects as its two parameters.

`test` is a function that returns a promise (or async) where test assertions can
be run. This function receives one parameter: `fetch`, which is a simple
[unfetch](https://www.npmjs.com/package/isomorphic-unfetch) instance (**note
that the *url parameter*, i.e. the first parameter in
[`fetch(...)`](https://github.com/developit/unfetch#examples--demos), is
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
import { testApiHandler } from 'next-test-api-route-handler'
import { shuffle } from 'fast-shuffle'

import type { WithConfig } from '@ergodark/next-types'

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
        test: async ({ fetch }) => {
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
import { testApiHandler } from 'next-test-api-route-handler'
import { DUMMY_API_KEY as KEY, getFlightData, RESULT_SIZE } from '../backend'

import type { WithConfig } from '@ergodark/next-types'

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
        yield `/?match=${encode({ seatPrice: { $gt: 500 }})}`;
        yield `/?match=${encode({ seatPrice: { $gte: 500 }})}`;
        yield `/?match=${encode({ seatPrice: { $lt: 500 }})}`;
        yield `/?match=${encode({ seatPrice: { $lte: 500 }})}`;
    }();

    await testApiHandler({
        // Patch the request object to include our dummy URI
        requestPatcher: req => {
            req.url = genUrl.next().value || undefined;
            // Could have done this instead of fetch({ headers: { KEY }}) below:
            // req.headers = { KEY };
        },

        handler: v3FlightsSearchHandler,

        test: async ({ fetch }) => {
            // 8 URLS from genUrl means 8 calls to fetch:
            const responses = await Promise.all([...Array(8)].map(_ => {
                return fetch({ headers: { KEY }}).then(r => r.ok ? r.json() : r.status);
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
        test: async ({ fetch }) => expect((await fetch({ headers: { KEY }})).status).toBe(400)
    });

    await testApiHandler({
        handler: v3FlightsSearchHandler,
        requestPatcher: req => { req.url = `/?match=${encode({ bad: 500 })}` },
        test: async ({ fetch }) => expect((await fetch({ headers: { KEY }})).status).toBe(400)
    });
});
```

See [test/index.test.ts](test/index.test.ts) for more examples.

## Documentation

Documentation can be found under [`docs/`](docs/README.md) and can be built with
`npm run build-docs`.

## Contributing

**New issues and pull requests are always welcome and greatly appreciated!** If
you submit a pull request, take care to maintain the existing coding style and
add unit tests for any new or changed functionality. Please lint and test your
code, of course!

Use `npm run build` to compile `src/` into `dist/`, which is what makes it into
the published package. Use `npm run build-docs` to re-build the documentation.
Use `npm test` to run the unit tests, `npm run check-build` to run the e2e
tests, and `check-types` to run a type check. Use `npm run list-tasks` to list
all available run scripts.

Note that using the NPM run scripts to build the documentation and
distributables requires a linux-like development environment. None of the run
scripts are likely to work on non-POSIX environments. If you're on Windows, use
[WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

This package is published using
[publish-please](https://www.npmjs.com/package/publish-please) via `npx
publish-please`.

## Release history

See [CHANGELOG.md](CHANGELOG.md).
