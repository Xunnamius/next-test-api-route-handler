<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![Codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![Tree shaking support][badge-tree-shaking]][link-bundlephobia]
[![Compressed package size][badge-size]][link-bundlephobia]
[![NPM version][badge-npm]][link-npm]
[![Uses Semantic Release!][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# next-test-api-route-handler

Trying to unit test your [Next.js API route handlers][1]? Want to avoid mucking
around with custom servers and writing boring test infra just to get some unit
tests working? Want your handlers to receive actual [NextApiRequest][2] and
[NextApiResponse][2] objects rather than having to hack something together with
express? Then look no further! 🤩

`next-test-api-route-handler` (NTARH) uses Next.js's internal API resolver to
precisely emulate API route handling. To guarantee stability, this package is
[automatically tested][13] against [each release of Next.js][3]. Go forth and
test confidently!

<div align="center">

✨ <a href="https://github.com/vercel/next.js"><img
src="https://api.ergodark.com/badges/is-next-compat" /></a> ✨

</div>

## Install

### Step One: Install NTARH

```Shell
npm install --save-dev next-test-api-route-handler
```

### Step Two: Install Peer Dependencies

If you are [using `npm@<7` or `node@<15`][25], you must install Next.js _and its
peer dependencies_ manually. This is because [`npm@<7` does not install peer
dependencies by default][26]. **If you're using a modern version of NPM, you can
skip this step.**

```Shell
npm install --save-dev next@latest react
```

> If you're also using an older version of Next.js, ensure you install the [peer
> dependencies (like `react`) that your specific Next.js version requires][27]!

## Legacy Next.js Support

As of version _`2.1.0`_, NTARH is fully backwards compatible with Next.js going
_allll_ the way back to `next@9.0.0` [when API routes were first
introduced][19]!

If you're working with `next@<9.0.6` (so: [before `next-server` was merged into
`next`][18]), you might need to install `next-server` manually:

```Shell
npm install --save-dev next-server
```

## Usage

```TypeScript
// ESM
import { testApiHandler } from 'next-test-api-route-handler';
```

```Javascript
// CJS
const { testApiHandler } = require('next-test-api-route-handler');
```

Quick start:

```TypeScript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the pages/api directory
import endpoint, { config } from '../pages/api/your-endpoint';
import type { PageConfig } from 'next';

// Respect the Next.js config object if it's exported
const handler: typeof endpoint & { config?: PageConfig } = endpoint;
handler.config = config;

await testApiHandler({
  handler,
  requestPatcher: (req) => (req.headers = { key: process.env.SPECIAL_TOKEN }),
  test: async ({ fetch }) => {
    const res = await fetch({ method: 'POST', body: 'data' });
    console.log(await res.json()); // ◄ outputs: "{hello: 'world'}"
  }
});

// NTARH also supports typed response data via TypeScript generics:
await testApiHandler<{ hello: string }>({
  // The next line would cause TypeScript to complain:
  // handler: (_, res) => res.status(200).send({ hello: false }),
  handler: (_, res) => res.status(200).send({ hello: 'world' }),
  requestPatcher: (req) => (req.headers = { key: process.env.SPECIAL_TOKEN }),
  test: async ({ fetch }) => {
    const res = await fetch({ method: 'POST', body: 'data' });
    // The next line would cause TypeScript to complain:
    // const { goodbye } = await res.json();
    const { hello } = await res.json();
    console.log(hello); // ◄ outputs: "world"
  }
});
```

The interface for `testApiHandler` without generics looks like this:

```TypeScript
async function testApiHandler({
  requestPatcher,
  responsePatcher,
  paramsPatcher,
  params,
  url,
  handler,
  test
}: {
  requestPatcher?: (req: IncomingMessage) => void;
  responsePatcher?: (res: ServerResponse) => void;
  paramsPatcher?: (params: Record<string, unknown>) => void;
  params?: Record<string, unknown>;
  url?: string;
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  test: ({
    fetch: (init?: RequestInit) => ReturnType<typeof fetch>;
  }) => Promise<void>;
});
```

### `requestPatcher`

A function that receives an [IncomingMessage][5]. Use this function to modify
the request before it's injected into Next.js's resolver. To just set the
request url, e.g. `requestPatcher: (req) => (req.url = '/my-url?some=query')`,
use the `url` shorthand, e.g. `url: '/my-url?some=query'`.

> More often than not, [manually setting the request url is unnecessary][20].
> Only set the url if [your handler expects it][21] or [you want to use
> automatic query string parsing instead of `params`/`paramsPatcher`][22].

### `responsePatcher`

A function that receives a [ServerResponse][6]. Use this function to modify the
response before it's injected into Next.js's resolver.

### `paramsPatcher`

A function that receives an object representing "processed" dynamic routes, e.g.
testing a handler that expects `/api/user/:id` requires
`paramPatcher: (params) => (params.id = 'test-id')`. Route parameters can also
be passed using the `params` shorthand, e.g. `params: { id: 'test-id', ... }`.
If both `paramsPatcher` and the `params` shorthand are used, `paramsPatcher`
will receive an object like `{ ...queryStringURLParams, ...params }`.

> Route parameters should not be confused with [query string parameters][14],
> which are automatically parsed out from the url and added to the params object
> before `paramsPatcher` is evaluated.

### `handler`

The actual route handler under test (usually imported from `pages/api/*`). It
should be an async function that accepts [NextApiRequest][2] and
[NextApiResponse][2] objects as its two parameters.

### `test`

A function that returns a promise (or async) where test assertions can be run.
This function receives one parameter: `fetch`, which is a simple [unfetch][7]
instance (**note that the _url parameter_, i.e. the first parameter in
[`fetch(...)`][8], is omitted**). Use this to send HTTP requests to the handler
under test.

##### `response.cookies`

As of version `2.3.0`, the response object returned by `fetch()` includes a
non-standard _cookies_ field containing an array of objects representing
[`set-cookie` response header(s)][23] parsed by [the `cookie` package][24]. Use
the _cookies_ field to easily access a response's cookie data in your tests.

Example using [`jest`][16]:

```Typescript
import { testApiHandler } from 'next-test-api-route-handler';

it('does what I want', async () => {
  await testApiHandler({
    handler: async (_req, res) => {
      // NOTE: multiple calls to setHeader('Set-Cookie', ...) overwrite previous
      res.setHeader('Set-Cookie', [
        serialize('access_token', '1234', { expires: new Date() }),
        serialize('refresh_token', '5678')
      ]).status(200).send();
    },
    test: async ({ fetch }) => {
      const res = await fetch();
      expect(res.cookies).toStrictEqual([
        expect.objectContaining({
          access_token: '1234',
          // NOTE: keys are all lowercased!
          expires: expect.any(String) // NOTE: "expires" instead of "Expires"
        }),
        expect.objectContaining({ refresh_token: '5678' })
      ]);
    }
  });
});
```

## Real-World Examples

### Testing Next.js's Official Apollo Example @ `pages/api/graphql`

You can easily run this example yourself by copying and pasting the following
commands into your terminal.

> The following should be run in a nix-like environment. On Windows, that's
> [WSL][17]. Requires `curl`, `node`, and `git`.

```Bash
git clone --depth=1 https://github.com/vercel/next.js /tmp/ntarh-test
cd /tmp/ntarh-test/examples/api-routes-apollo-server-and-client
npm install
npm install next-test-api-route-handler jest babel-jest @babel/core @babel/preset-env graphql-tools
# You could test with an older version of Next.js if you want, e.g.:
# npm install next@9.0.6 --force
# Or even older:
# npm install next@9.0.0 next-server --force
echo 'module.exports={"presets":["next/babel"]};' > babel.config.js
mkdir test
curl -o test/my.test.js https://raw.githubusercontent.com/Xunnamius/next-test-api-route-handler/main/apollo_test_raw
npx jest
```

The above script will clone [the Next.js repository][10], install NTARH and
configure dependencies, download [the following script][15], and run it with
[jest][16].

> **Note that passing the [route configuration object][11] (imported below as
> `config`) through to NTARH and setting `request.url` to the proper value is
> [crucial][12] when testing Apollo endpoints!**

```TypeScript
/* File: examples/api-routes-apollo-server-and-client/tests/my.test.js */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the pages/api directory
import handler, { config } from '../pages/api/graphql';
// Respect the Next.js config object if it's exported
handler.config = config;

describe('my-test', () => {
  it('does what I want 1', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler,
      url: '/api/graphql', // Set the request url to the path graphql expects
      test: async ({ fetch }) => {
        const query = `query ViewerQuery {
          viewer {
            id
            name
            status
          }
        }`;

        const res = await fetch({
          method: 'POST',
          headers: {
            'content-type': 'application/json' // Must use correct content type
          },
          body: JSON.stringify({
            query
          })
        });

        expect(await res.json()).toStrictEqual({
          data: { viewer: { id: '1', name: 'John Smith', status: 'cached' } }
        });
      }
    });
  });

  it('does what I want 2', async () => {
    // Exactly the same as the above...
  });

  it('does what I want 3', async () => {
    // Exactly the same as the above...
  });
});
```

### Testing an Unreliable API Handler @ `pages/api/unreliable`

Suppose we have an API endpoint we use to test our application's error handling.
The endpoint responds with status code `HTTP 200` for every request except the
10th, where status code `HTTP 555` is returned instead.

How might we [test][16] that this endpoint responds with `HTTP 555` once for
every nine `HTTP 200` responses?

```TypeScript
/* File: test/unit.test.ts */

// Import the handler under test from the pages/api directory
import endpoint, { config } from '../pages/api/unreliable';
import { testApiHandler } from 'next-test-api-route-handler';

import type { PageConfig } from 'next';

const expectedReqPerError = 10;

// Respect the Next.js config object if it's exported
const handler: typeof endpoint & { config?: PageConfig } = endpoint;
handler.config = config;

it('injects contrived errors at the required rate', async () => {
  expect.hasAssertions();

  // Signal to the endpoint (which is configurable) that there should be 1
  // error among every 10 requests
  process.env.REQUESTS_PER_CONTRIVED_ERROR = expectedReqPerError.toString();

  await testApiHandler({
    handler,
    test: async ({ fetch }) => {
      // Run 20 requests with REQUESTS_PER_CONTRIVED_ERROR = '10' and
      // record the results
      const results1 = await Promise.all(
        [
          ...Array.from({ length: expectedReqPerError - 1 }).map(() =>
            fetch({ method: 'GET' })
          ),
          fetch({ method: 'POST' }),
          ...Array.from({ length: expectedReqPerError - 1 }).map(() =>
            fetch({ method: 'PUT' })
          ),
          fetch({ method: 'DELETE' })
        ].map((p) => p.then((r) => r.status))
      );

      process.env.REQUESTS_PER_CONTRIVED_ERROR = '0';

      // Run 10 requests with REQUESTS_PER_CONTRIVED_ERROR = '0' and record the
      // results
      const results2 = await Promise.all(
        Array.from({ length: expectedReqPerError }).map(() =>
          fetch().then((r) => r.status)
        )
      );

      // We expect results1 to be an array with eighteen `200`s and two
      // `555`s in any order
      //
      // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
      // because responses could be received out of order
      expect(results1).toIncludeSameMembers([
        ...Array.from({ length: expectedReqPerError - 1 }).map(() => 200),
        555,
        ...Array.from({ length: expectedReqPerError - 1 }).map(() => 200),
        555
      ]);

      // We expect results2 to be an array with ten `200`s
      expect(results2).toStrictEqual([
        ...Array.from({ length: expectedReqPerError }).map(() => 200)
      ]);
    }
  });
});

```

### Testing a Flight Search API Handler @ `pages/api/v3/flights/search`

Suppose we have an _authenticated_ API endpoint our application uses to search
for flights. The endpoint responds with an array of flights satisfying the
query.

How might we [test][16] that this endpoint returns flights in our database as
expected?

```TypeScript
/* File: test/unit.test.ts */

import endpoint, { config } from '../pages/api/v3/flights/search';
import { testApiHandler } from 'next-test-api-route-handler';
import { DUMMY_API_KEY as KEY, getFlightData, RESULT_SIZE } from '../backend';

import type { PageConfig } from 'next';

// Respect the Next.js config object if it's exported
const handler: typeof endpoint & { config?: PageConfig } = endpoint;
handler.config = config;

it('returns expected public flights with respect to match', async () => {
  expect.hasAssertions();

  // Get the flight data currently in the test database
  const expectedFlights = getFlightData();

  // Take any JSON object and stringify it into a URL-ready string
  const encode = (o: Record<string, unknown>) =>
    encodeURIComponent(JSON.stringify(o));

  // This function will return in order the URIs we're interested in testing
  // against our handler. Query strings are parsed by NTARH automatically.
  //
  // NOTE: setting the request url manually using encode(), while valid, is
  // unnecessary here; we could have used `params` or `paramPatcher` to do this
  // more easily without explicitly setting a dummy request url.
  //
  // Example URI for `https://site.io/path?param=yes` would be `/path?param=yes`
  const genUrl = (function* () {
    // For example, the first should match all the flights from Spirit airlines!
    yield `/?match=${encode({ airline: 'Spirit' })}`;
    yield `/?match=${encode({ type: 'departure' })}`;
    yield `/?match=${encode({ landingAt: 'F1A' })}`;
    yield `/?match=${encode({ seatPrice: 500 })}`;
    yield `/?match=${encode({ seatPrice: { $gt: 500 } })}`;
    yield `/?match=${encode({ seatPrice: { $gte: 500 } })}`;
    yield `/?match=${encode({ seatPrice: { $lt: 500 } })}`;
    yield `/?match=${encode({ seatPrice: { $lte: 500 } })}`;
  })();

  await testApiHandler({
    // Patch the request object to include our dummy URI
    requestPatcher: (req) => {
      req.url = genUrl.next().value || undefined;
      // Could have done this instead of `fetch({ headers: { KEY }})` below:
      // req.headers = { KEY };
    },

    handler,

    test: async ({ fetch }) => {
      // 8 URLS from genUrl means 8 calls to fetch:
      const responses = await Promise.all(
        Array.from({ length: 8 }).map(() =>
          fetch({ headers: { KEY } }).then(async (r) => [
            r.status,
            await r.json()
          ])
        )
      );

      // We expect all of the responses to be 200
      expect(responses.some(([status]) => status != 200)).toBe(false);

      // We expect the array of flights returned to match our
      // expectations given we already know what dummy data will be
      // returned:

      // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
      // because responses could be received out of order
      expect(responses.map(([, r]) => r.flights)).toIncludeSameMembers([
        expectedFlights
          .filter((f) => f.airline == 'Spirit')
          .slice(0, RESULT_SIZE),
        expectedFlights
          .filter((f) => f.type == 'departure')
          .slice(0, RESULT_SIZE),
        expectedFlights
          .filter((f) => f.landingAt == 'F1A')
          .slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice == 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice > 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice >= 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice < 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice <= 500).slice(0, RESULT_SIZE)
      ]);
    }
  });

  // We expect these two to fail with 400 errors

  await testApiHandler({
    handler,
    url: `/?match=${encode({ ffms: { $eq: 500 } })}`,
    test: async ({ fetch }) =>
      expect((await fetch({ headers: { KEY } })).status).toBe(400)
  });

  await testApiHandler({
    handler,
    url: `/?match=${encode({ bad: 500 })}`,
    test: async ({ fetch }) =>
      expect((await fetch({ headers: { KEY } })).status).toBe(400)
  });
});
```

Check out [the tests][9] for more examples.

## Documentation

> Further documentation can be found under [`docs/`][docs].

This is a [dual CJS2/ES module][dual-module] package. That means this package
exposes both CJS2 and ESM entry points.

Loading this package via `require(...)` will cause Node and Webpack to use the
[CJS2 bundle][cjs2] entry point, disable [tree shaking][tree-shaking] in Webpack
4, and lead to larger bundles in Webpack 5. Alternatively, loading this package
via `import { ... } from ...` or `import(...)` will cause Node to use the ESM
entry point in [versions that support it][node-esm-support], as will Webpack.
Using the `import` syntax is the modern, preferred choice.

For backwards compatibility with Webpack 4 (_compat with Webpack 4 is not
guaranteed!_) and Node versions < 14, [`package.json`][package-json] retains the
[`module`][module-key] key, which points to the ESM entry point, and the
[`main`][exports-main-key] key, which points to the CJS2 entry point explicitly
(using the .js file extension). For Webpack 5 and Node versions >= 14,
[`package.json`][package-json] includes the [`exports`][exports-main-key] key,
which points to both entry points explicitly.

Though [`package.json`][package-json] includes
[`{ "type": "commonjs"}`][local-pkg], note that the ESM entry points are ES
module (`.mjs`) files. [`package.json`][package-json] also includes the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

Additionally, this package does not maintain shared state and so does not
exhibit the [dual package hazard][hazard].

### License

[![FOSSA analysis][badge-fossa]][link-fossa]

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
  'Latest commit timestamp'
[badge-issues]:
  https://img.shields.io/github/issues/Xunnamius/next-test-api-route-handler
  'Open issues'
[link-issues]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/next-test-api-route-handler
  'Open pull requests'
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
[badge-fossa]:
  https://app.fossa.com/api/projects/git%2Bgithub.com%2FXunnamius%2Fnext-test-api-route-handler.svg?type=large
  "Analysis of this package's license obligations"
[link-fossa]:
  https://app.fossa.com/projects/git%2Bgithub.com%2FXunnamius%2Fnext-test-api-route-handler
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/next-test-api-route-handler
  'Install this package using npm or yarn!'
[link-npm]: https://www.npmjs.com/package/next-test-api-route-handler
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[badge-size]: https://badgen.net/bundlephobia/minzip/next-test-api-route-handler
[badge-tree-shaking]:
  https://badgen.net/bundlephobia/tree-shaking/next-test-api-route-handler
  'Is this package optimized for Webpack?'
[link-bundlephobia]:
  https://bundlephobia.com/result?p=next-test-api-route-handler
  'Package size (minified and gzipped)'
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
[5]: https://nodejs.org/api/http.html#http_class_http_incomingmessage
[6]: https://nodejs.org/api/http.html#http_class_http_serverresponse
[7]: https://www.npmjs.com/package/isomorphic-unfetch
[8]: https://github.com/developit/unfetch#examples--demos
[9]: test/unit-index.test.ts
[10]: https://github.com/vercel/next.js
[11]: https://nextjs.org/docs/api-routes/api-middlewares#custom-config
[12]: https://github.com/Xunnamius/next-test-api-route-handler/issues/56
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/actions/workflows/is-next-compat.yml
[14]: https://en.wikipedia.org/wiki/Query_string
[15]: ./apollo_test_raw
[16]: https://www.npmjs.com/package/jest
[17]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[18]: https://github.com/vercel/next.js/pull/8613
[19]: https://nextjs.org/blog/next-9
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues/303#issuecomment-903344572
[21]: #testing-nextjss-official-apollo-example--pagesapigraphql
[22]: #testing-a-flight-search-api-handler--pagesapiv3flightssearch
[23]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
[24]: https://www.npmjs.com/package/cookie
[25]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues/378#issuecomment-956932193
[26]:
  https://github.blog/2021-02-02-npm-7-is-now-generally-available/#peer-dependencies
[27]:
  https://github.com/vercel/next.js/blob/v9.0.0/packages/next/package.json#L106-L109
