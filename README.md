<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![NPM version][badge-npm]][link-npm]
[![semantic-release][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# next-test-api-route-handler

Trying to unit test your [Next.js API route handlers][1]? Want to avoid mucking
around with custom servers and writing boring test infra just to get some unit
tests working? Want your handlers to receive actual [NextApiRequest][2] and
[NextApiResponse][2] objects rather than having to hack something together with
express? Then look no further! 🤩 This package allows you to quickly test your
Next.js API routes/handlers in an isolated Next.js-like context.

`next-test-api-route-handler` uses Next.js's internal API resolver to precisely
emulate API route handling. To guarantee stability, this package is
automatically tested against [each release of Next.js][3]. Go forth and test
confidently!

<div align="center">

✨
<a href="https://github.com/vercel/next.js"><img src="https://api.ergodark.com/badges/is-next-compat" /></a>
✨

</div>

> Looking for a version of this package compatible with an earlier major release
> of Next.js? Breaking changes are documented in [CHANGELOG.md][4].

## Install

> Note: NPM versions >=7 may need `npm install --legacy-peer-deps` until
> [upstream peer dependency problems are resolved][npm-v7-bc].

```shell
npm install --save-dev next-test-api-route-handler
```

<details><summary><strong>[additional details]</strong></summary>

> Note: **typical users don't need to read through this!** This information is
> primarily useful for those attempting to bundle this package or for those who
> have an opinion on ESM versus CJS.

This is a [dual CJS2/ES module][dual-module] package. That means this package
exposes both CJS2 and ESM entry points.

Loading this package via `require(...)` will cause Node to use the [CJS2
bundle][cjs2] entry point, disable [tree shaking][tree-shaking] in Webpack 4,
and lead to larger bundles in Webpack 5. Alternatively, loading this package via
`import { ... } from ...` or `import(...)` will cause Node to use the ESM entry
point in [versions that support it][node-esm-support] and in Webpack. Using the
`import` syntax is the modern, preferred choice.

For backwards compatibility with Webpack 4 and Node versions < 14,
[`package.json`][package-json] retains the [`module`][module-key] key, which
points to the ESM entry point, and the [`main`][exports-main-key] key, which
points to both the ESM and CJS2 entry points implicitly (no file extension). For
Webpack 5 and Node versions >= 14, [`package.json`][package-json] includes the
[`exports`][exports-main-key] key, which points to both entry points explicitly.

Though [`package.json`][package-json] includes
[`{ "type": "commonjs"}`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. [`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

Additionally, this package does not maintain shared state and so does not
exhibit the [dual package hazard][hazard].

</details>

## Usage

```TypeScript
// ESM
import { testApiHandler } from 'next-test-api-route-handler'
```

```JavaScript
// CJS
const { testApiHandler } = require('next-test-api-route-handler');
```

Quick start:

```TypeScript
// File: test/unit.test.js
import * as endpoint from '../pages/api/your-endpoint';
import { testApiHandler } from 'next-test-api-route-handler';

import type { WithConfig } from '@ergodark/next-types';

// Import the handler under test from the pages/api directory and respect the
// Next.js config object if it's exported
const endpoint: WithConfig<typeof Endpoint.default> = Endpoint.default;
endpoint.config = Endpoint.config;

await testApiHandler({
  requestPatcher: (req) => (req.headers = { key: process.env.SPECIAL_TOKEN }),
  handler: endpoint,
  test: async ({ fetch }) => {
    const res = await fetch({ method: 'POST', body: 'data' });
    console.log(await res.json()); // ◄ outputs: '{hello: 'world'}'
  }
});
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

`requestPatcher` is a function that receives an [IncomingMessage][5]. Use this
function to modify the request before it's injected into Next.js's resolver.

`responsePatcher` is a function that receives a [ServerResponse][6]. Use this
function to modify the response before it's injected into Next.js's resolver.

`params` is an object representing "processed" dynamic routes, e.g. testing a
handler that expects `/api/user/:id` requires `params: { id: ... }`. This should
not be confused with requiring query string parameters, which are parsed out
from the url and added to the params object automatically.

`handler` is the actual route handler under test (usually imported from
`pages/api/*`). It should be an async function that accepts [NextApiRequest][2]
and [NextApiResponse][2] objects as its two parameters.

`test` is a function that returns a promise (or async) where test assertions can
be run. This function receives one parameter: `fetch`, which is a simple
[unfetch][7] instance (**note that the _url parameter_, i.e. the first parameter
in [`fetch(...)`][8], is omitted**). Use this to send HTTP requests to the
handler under test.

## Real-World Examples

### Testing an Unreliable API Handler @ `pages/api/unreliable`

Suppose we have an API endpoint we use to test our application's error handling.
The endpoint responds with status code `HTTP 200` for every request except the
10th, where status code `HTTP 555` is returned instead.

How might we test that this endpoint responds with `HTTP 555` once for every
nine `HTTP 200` responses?

```TypeScript
import * as UnreliableHandler from '../pages/api/unreliable'
import { testApiHandler } from 'next-test-api-route-handler'
import { shuffle } from 'fast-shuffle'
import array from 'array-range'

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
        ...array(expectedReqPerError - 1).map(_ => getStatus(fetch({ method: getMethod() }))),
        getStatus(fetch({ method: getMethod() })),
        ...array(expectedReqPerError - 1).map(_ => getStatus(fetch({ method: getMethod() }))),
        getStatus(fetch({ method: getMethod() }))
      ].map(p => p.then(s => s, _ => null)));

      process.env.REQUESTS_PER_CONTRIVED_ERROR = '0';

      // Run 10 requests with REQUESTS_PER_CONTRIVED_ERROR = '0' and
      // record the results
      const results2 = await Promise.all([
        ...array(expectedReqPerError).map(_ => getStatus(fetch({ method: getMethod() }))),
      ].map(p => p.then(s => s, _ => null)));

      // We expect results1 to be an array with eighteen `200`s and two
      // `555`s in any order

      // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
      // because responses could be received out of order
      expect(results1).toIncludeSameMembers([
        ...array(expectedReqPerError - 1).map(_ => 200),
        555,
        ...array(expectedReqPerError - 1).map(_ => 200),
        555
      ]);

      // We expect results2 to be an array with ten `200`s

      expect(results2).toStrictEqual([
        ...array(expectedReqPerError).map(_ => 200),
      ]);
    }
  });
});
```

### Testing a Flight Search API Handler @ `pages/api/v3/flights/search`

Suppose we have an _authenticated_ API endpoint our application uses to search
for flights. The endpoint responds with an array of flights satisfying the
query.

How might we test that this endpoint returns flights in our database as
expected?

```TypeScript
import * as V3FlightsSearchHandler from '../pages/api/v3/flights/search'
import { testApiHandler } from 'next-test-api-route-handler'
import { DUMMY_API_KEY as KEY, getFlightData, RESULT_SIZE } from '../backend'
import array from 'array-range'

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
      const responses = await Promise.all(array(8).map(_ => {
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

Check out [the tests][9] for more examples.

## Documentation

Project documentation can be found under [`docs/`][docs].

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://api.ergodark.com/badges/blm 'Join the movement!'
[link-blm]: https://secure.actblue.com/donate/ms_blm_homepage_2019
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2021
  'Is this package maintained?'
[link-repo]: https://github.com/xunnamius/next-test-api-route-handler
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/next-test-api-route-handler
  'When was the last commit to the official repo?'
[badge-issues]:
  https://isitmaintained.com/badge/open/Xunnamius/next-test-api-route-handler.svg
  'Number of known issues with this package'
[link-issues]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/next-test-api-route-handler
  'Number of open pull requests'
[link-pulls]: https://github.com/xunnamius/next-test-api-route-handler/pulls
[badge-codecov]:
  https://codecov.io/gh/Xunnamius/next-test-api-route-handler/branch/main/graph/badge.svg?token=HWRIOBAAPW
  'Is this package well-tested?'
[link-codecov]: https://codecov.io/gh/Xunnamius/next-test-api-route-handler
[badge-license]:
  https://img.shields.io/npm/l/next-test-api-route-handler
  "This package's source license"
[link-license]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/LICENSE
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/next-test-api-route-handler
  'Install this package using npm or yarn!'
[link-npm]: https://www.npmjs.com/package/next-test-api-route-handler
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[package-json]: package.json
[docs]: docs
[choose-new-issue]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues/new/choose
[pr-compare]: https://github.com/Xunnamius/next-test-api-route-handler/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[cjs2]: https://webpack.js.org/configuration/output/#module-definition-systems
[dual-module]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#dual-commonjses-module-packages
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[hazard]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#dual-package-hazard
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[module-key]: https://webpack.js.org/guides/author-libraries/#final-steps
[node-esm-support]:
  https://medium.com/%40nodejs/node-js-version-14-available-now-8170d384567e#2368
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[1]: https://nextjs.org/docs/api-routes/introduction
[2]: https://nextjs.org/docs/basic-features/typescript#api-routes
[3]: https://github.com/vercel/next.js/releases
[4]: CHANGELOG.md
[npm-v7-bc]:
  https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/#user-content-breaking-changes
[5]: https://nodejs.org/api/http.html#http_class_http_incomingmessage
[6]: https://nodejs.org/api/http.html#http_class_http_serverresponse
[7]: https://www.npmjs.com/package/isomorphic-unfetch
[8]: https://github.com/developit/unfetch#examples--demos
[9]: test
