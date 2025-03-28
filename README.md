<!-- symbiote-template-region-start 1 -->

<p align="center" width="100%">
  <img width="300" src="https://raw.githubusercontent.com/Xunnamius/next-test-api-route-handler/refs/heads/main/logo.png">
</p>

<p align="center" width="100%">
<!-- symbiote-template-region-end -->
Confidently test your Next.js API routes in an isolated Next-like environment
<!-- symbiote-template-region-start 2 -->
</p>

<hr />

<div align="center">

[![Black Lives Matter!][x-badge-blm-image]][x-badge-blm-link]
[![Last commit timestamp][x-badge-lastcommit-image]][x-badge-repo-link]
[![Codecov][x-badge-codecov-image]][x-badge-codecov-link]
[![Source license][x-badge-license-image]][x-badge-license-link]
[![Uses Semantic Release!][x-badge-semanticrelease-image]][x-badge-semanticrelease-link]

[![NPM version][x-badge-npm-image]][x-badge-npm-link]
[![Monthly Downloads][x-badge-downloads-image]][x-badge-downloads-link]

</div>

<br />

# next-test-api-route-handler

<!-- symbiote-template-region-end -->

**Trying to unit test your Next.js API routes?** Tired of hacking something
together with express or node-mocks-http or writing a bunch of boring dummy
infra just to get some passing tests? And what does a "passing test" mean anyway
when your handlers aren't receiving _actual_ [`NextRequest`][1] objects and
aren't being run by Next.js itself?

> Next.js patches the global `fetch` function, for instance. If your tests
> aren't doing the same, you're making space for bugs!

Is it vexing that everything explodes when your [App Router][2] handlers call
`headers()` or `cookies()` or any of the other route-specific [helper
functions][3]? Or maybe you want your [Pages Router][4] handlers to receive
_actual_ [`NextApiRequest`][5] and [`NextApiResponse`][5] objects?

Sound interesting? Then want no longer! 🤩

[`next-test-api-route-handler`][x-badge-repo-link] (NTARH) uses Next.js's
internal resolvers to precisely emulate route handling. To guarantee stability,
this package is [automatically tested][6] against [each release of Next.js][7]
and Node.js. Go forth and test confidently!

<br />

<div align="center">

✨ <a href="https://github.com/vercel/next.js"><img
src="https://xunn.at/ntarh-compat" /></a> ✨

<sub>Note that App Router support begins with `next@14.0.4` ([why?][8])</sub>

</div>

<br />

<!-- symbiote-template-region-start 3 -->

---

<!-- remark-ignore-start -->
<!-- symbiote-template-region-end -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
  - [Quick Start: App Router](#quick-start-app-router)
  - [Quick Start: Edge Runtime](#quick-start-edge-runtime)
  - [Quick Start: Pages Router](#quick-start-pages-router)
- [API](#api)
  - [`appHandler`](#apphandler)
  - [`pagesHandler`](#pageshandler)
  - [`test`](#test)
  - [`rejectOnHandlerError`](#rejectonhandlererror)
  - [`requestPatcher` (`url`)](#requestpatcher-url)
  - [`responsePatcher`](#responsepatcher)
  - [`paramsPatcher` (`params`)](#paramspatcher-params)
- [Examples](#examples)
  - [Using the App Router](#using-the-app-router)
  - [Using the Pages Router](#using-the-pages-router)
- [Appendix](#appendix)
  - [Limitations with App Router and Edge Runtime Emulation](#limitations-with-app-router-and-edge-runtime-emulation)
  - [Legacy Runtime Support](#legacy-runtime-support)
  - [Jsdom Support](#jsdom-support)
  - [Inspiration](#inspiration)
  - [Published Package Details](#published-package-details)
  - [License](#license)
- [Contributing and Support](#contributing-and-support)
  - [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- symbiote-template-region-start 4 -->
<!-- remark-ignore-end -->

<br />

## Install

<!-- symbiote-template-region-end -->

To install:

```shell
npm install --save-dev next-test-api-route-handler
```

> See [the appendix][9] for legacy Next.js support options.

> Also see [the appendix][10] if you're using `jest` and
> `jest-environment-jsdom`.

<br />

## Usage

> [!IMPORTANT]
>
> **NTARH must always be the first import in your test file.** This is due to
> the way Next.js is written and distributed. See [the appendix][11] for
> technical details.

```typescript
// ESM
import { testApiHandler } from 'next-test-api-route-handler'; // ◄ Must be first

... all other imports ...
```

```javascript
// CJS
const { testApiHandler } = require('next-test-api-route-handler'); // ◄ Must be first

... all other imports ...
```

If you're using fancy import sorting like [eslint-plugin-import's "order"
rule][102], import NTARH as a [side-effect][x-pkg-side-effects-key] first, then
perform the real import later:

```javascript
import 'next-test-api-route-handler';

... all other imports ordered before NTARH ...
import { testApiHandler } from 'next-test-api-route-handler';
... all other imports ordered after NTARH ...
```

### Quick Start: App Router

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler'; // ◄ Must be first import
// Import the handler under test from the app directory
import * as appHandler from '../app/your-endpoint/route';

it('does what I want', async () => {
  await testApiHandler({
    appHandler,
    // requestPatcher is optional
    requestPatcher(request) {
      request.headers.set('key', process.env.SPECIAL_TOKEN);
    },
    // responsePatcher is optional
    async responsePatcher(response) {
      const json = await response.json();
      return Response.json(
        json.apiSuccess ? { hello: 'world!' } : { goodbye: 'cruel world' }
      );
    },
    async test({ fetch }) {
      const res = await fetch({ method: 'POST', body: 'dummy-data' });
      await expect(res.json()).resolves.toStrictEqual({ hello: 'world!' }); // ◄ Passes!
    }
  });
});
```

### Quick Start: Edge Runtime

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler'; // ◄ Must be first import
// Import the handler under test from the app directory
import * as edgeHandler from '../app/your-edge-endpoint/route';

it('does what I want', async function () {
  // NTARH supports optionally typed response data via TypeScript generics:
  await testApiHandler<{ success: boolean }>({
    // Only appHandler supports edge functions. The pagesHandler prop does not!
    appHandler: edgeHandler,
    // requestPatcher is optional
    requestPatcher(request) {
      return new Request(request, {
        body: dummyReadableStream,
        duplex: 'half'
      });
    },
    async test({ fetch }) {
      // The next line would cause TypeScript to complain:
      // const { luck: success } = await (await fetch()).json();
      await expect((await fetch()).json()).resolves.toStrictEqual({
        success: true // ◄ Passes!
      });
    }
  });
});
```

### Quick Start: Pages Router

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler'; // ◄ Must be first import
// Import the handler under test and its config from the pages/api directory
import * as pagesHandler from '../pages/api/your-endpoint';

it('does what I want', async () => {
  // NTARH supports optionally typed response data via TypeScript generics:
  await testApiHandler<{ hello: string }>({
    pagesHandler,
    requestPatcher: (req) => {
      req.headers = { key: process.env.SPECIAL_TOKEN };
    },
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'POST', body: 'data' });
      // The next line would cause TypeScript to complain:
      // const { goodbye: hello } = await res.json();
      const { hello } = await res.json();
      expect(hello).toBe('world'); // ◄ Passes!
    }
  });
});
```

<br />

## API

NTARH exports a single function, `testApiHandler(options)`, that accepts an
`options` object as its only parameter.

At minimum, `options` must contain the following properties:

- At least one of the `appHandler` or `pagesHandler` options, but not both.
- The `test` option.

For example:

> [!CAUTION]
>
> Ensuring `testApiHandler` is imported [_before_][12] any Next.js package (like
> `'next/headers'` below) is crucial to the proper function of NTARH. Doing
> otherwise will result in undefined behavior.

```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import { headers } from 'next/headers';

await testApiHandler({
  appHandler: {
    dynamic: 'force-dynamic',
    async GET(_request) {
      return Response.json(
        {
          // Yep, those fancy helper functions work too!
          hello: (await headers()).get('x-hello')
        },
        { status: 200 }
      );
    }
  },
  async test({ fetch }) {
    await expect(
      (await fetch({ headers: { 'x-hello': 'world' } })).json()
    ).resolves.toStrictEqual({
      hello: 'world'
    });
  }
});
```

<br />

### `appHandler`

> ⪢ API reference: [`appHandler`][13]

The actual route handler under test (usually imported from `app/*`). It should
be an object and/or exported module containing one or more [valid uppercase HTTP
method names][14] as keys, each with an [async handling function][15] that
accepts a [`NextRequest`][1] and ["segment data"][16] (i.e. `{ params }`) as its
two parameters. The object or module can also export [other configuration
settings recognized by Next.js][17].

```typescript
await testApiHandler({
  params: { id: 5 },
  appHandler: {
    async POST(request, { params: { id } }) {
      return Response.json(
        { special: request.headers.get('x-special-header'), id },
        { status: 200 }
      );
    }
  },
  async test({ fetch }) {
    expect((await fetch({ method: 'POST' })).status).toBe(200);

    const result2 = await fetch({
      method: 'POST',
      headers: { 'x-special-header': 'x' }
    });

    expect(result2.json()).toStrictEqual({ special: 'x', id: 5 });
  }
});
```

See also: [`rejectOnHandlerError`][18] and the section [Working Around Next.js
`fetch` Patching][19].

<br />

### `pagesHandler`

> ⪢ API reference: [`pagesHandler`][20]

The actual route handler under test (usually imported from `pages/api/*`). It
should be an async function that accepts [`NextApiRequest`][5] and
[`NextApiResponse`][5] objects as its two parameters.

```typescript
await testApiHandler({
  params: { id: 5 },
  pagesHandler: (req, res) => res.status(200).send({ id: req.query.id }),
  test: async ({ fetch }) =>
    expect((await fetch({ method: 'POST' })).json()).resolves.toStrictEqual({
      id: 5
    })
});
```

See also: [`rejectOnHandlerError`][18].

<br />

### `test`

> ⪢ API reference: [`test`][21]

An async or promise-returning function wherein test assertions can be run. This
function receives one destructured parameter: `fetch`, which is a wrapper around
Node's [global fetch][22] function. Use this to send HTTP requests to the
handler under test.

> [!CAUTION]
>
> Note that `fetch`'s `resource` parameter, _i.e. [the first parameter in
> `fetch(...)`][23]_, is omitted.

#### ⚙ Handling Redirections

Starting with version `4.0.4`, NTARH sets the [`fetch(...)` `options`][24]
parameter's [`redirect` property to `'manual'`][25] by default. This prevents
the WHATWG/undici `fetch` function from throwing a
`fetch failed`/`redirect count exceeded` error.

If you want to change this value, call `fetch` with your own custom `options`
parameter, e.g. `fetch({ redirect: 'error' })`.

#### ⚙ Compatibility with Mock Service Worker

Starting with version `4.0.0`, NTARH ships with [Mock Service Worker (msw)][26]
support by adding the [`x-msw-intention: "bypass"`][27] and
`x-msw-bypass: "true"` headers to all requests.

If necessary, you can override this behavior by setting the appropriate headers
to some other value (e.g. `"none"`) via `fetch`'s `customInit` parameter (not
`requestPatcher`). This comes in handy when testing functionality like
[arbitrary response redirection][28] (or via the [Pages Router][29]).

For example:

```typescript
import { testApiHandler } from 'next-test-api-route-handler';
import { http, passthrough, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(/* ... */);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => server.close());

it('redirects a shortened URL to the real URL', async () => {
  expect.hasAssertions();

  // e.g. https://xunn.at/gg => https://www.google.com/search?q=next-test-api-route-handler
  // shortId would be "gg"
  // realLink would be https://www.google.com/search?q=next-test-api-route-handler

  const { shortId, realLink } = getUriEntry();
  const realUrl = new URL(realLink);

  await testApiHandler({
    appHandler,
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
```

#### ⚙ `response.cookies`

As of version `2.3.0`, the response object returned by `fetch()` includes a
non-standard _cookies_ field containing an array of objects representing
[`set-cookie` response header(s)][30] parsed by [the `cookie` package][31]. Use
the _cookies_ field to easily access a response's cookie data in your tests.

Here's an example taken straight from the [unit tests][32]:

```typescript
import { testApiHandler } from 'next-test-api-route-handler';

it('handles multiple set-cookie headers', async () => {
  expect.hasAssertions();

  await testApiHandler({
    pagesHandler: (_, res) => {
      // Multiple calls to setHeader('Set-Cookie', ...) overwrite previous, so
      // we have to set the Set-Cookie header properly
      res
        .setHeader('Set-Cookie', [
          serializeCookieHeader('access_token', '1234', {
            expires: new Date()
          }),
          serializeCookieHeader('REFRESH_TOKEN', '5678')
        ])
        .status(200)
        .send({});
    },
    test: async ({ fetch }) => {
      expect((await fetch()).status).toBe(200);
      await expect((await fetch()).json()).resolves.toStrictEqual({});
      expect((await fetch()).cookies).toStrictEqual([
        {
          access_token: '1234',
          // Lowercased cookie property keys are available
          expires: expect.any(String),
          // Raw cookie property keys are also available
          Expires: expect.any(String)
        },
        { refresh_token: '5678', REFRESH_TOKEN: '5678' }
      ]);
    }
  });
});
```

<br />

### `rejectOnHandlerError`

> ⪢ API reference: [`rejectOnHandlerError`][33]

As of version `2.3.0`, unhandled errors in the `pagesHandler`/`appHandler`
function are kicked up to Next.js to handle.

> [!IMPORTANT]
>
> **This means `testApiHandler` will NOT reject or throw if an unhandled error
> occurs in `pagesHandler`/`appHandler`, which typically includes failing
> `expect()` assertions.**

Instead, the response returned by `fetch()` in your `test` function will have a
`HTTP 500` status [thanks to how Next.js deals with unhandled errors in
production][34]. Prior to `2.3.0`, NTARH's behavior on unhandled errors and
elsewhere was inconsistent. Version `3.0.0` further improved error handling,
ensuring no errors slip by uncaught.

To guard against false negatives, you can do either of the following:

1. Make sure the status of the `fetch()` response is what you're expecting:

```typescript
const res = await fetch();
...
// For this test, a 403 status is what we wanted
expect(res.status).toBe(403);
...
const res2 = await fetch();
...
// Later, we expect an "unhandled" error
expect(res2.status).toBe(500);
```

2. If you're using version `>=3.0.0`, you can use `rejectOnHandlerError` to tell
   NTARH to intercept unhandled handler errors and reject the promise returned
   by `testApiHandler` _instead_ of relying on Next.js to respond with
   `HTTP 500`. This is especially useful if you have `expect()` assertions
   _inside_ your handler function:

```typescript
await expect(
  testApiHandler({
    rejectOnHandlerError: true, // <==
    pagesHandler: (_req, res) => {
      res.status(200);
      throw new Error('bad bad not good');
    },
    test: async ({ fetch }) => {
      const res = await fetch();
      // By default, res.status would be 500...
      //expect(res.status).toBe(500);
    }
  })
  // ...but since we used rejectOnHandlerError, the whole promise rejects
  // instead
).rejects.toThrow('bad not good');

await testApiHandler({
  rejectOnHandlerError: true, // <==
  appHandler: {
    async GET(request) {
      // Suppose this expectation fails
      await expect(backend.getSomeStuff(request)).resolves.toStrictEqual(
        someStuff
      );

      return new Response(null, { status: 200 });
    }
  },
  test: async ({ fetch }) => {
    await fetch();
    // By default, res.status would be 500 due to the failing expect(). If we
    // don't also expect() a non-500 response status here, the failing
    // expectation in the handler will be swallowed and the test will pass
    // (a false negative).
  }
});
// ...but since we used rejectOnHandlerError, the whole promise rejects
// and it is reported that the test failed, which is probably what you wanted.
```

<br />

### `requestPatcher` (`url`)

> [!TIP]
>
> Manually setting the request url is usually unnecessary. Only set the url if
> [your handler expects it][35] or [you want to rely on query string parsing
> instead of `params`/`paramsPatcher`][36].

#### 💎 Using `appHandler`

> ⪢ API reference: [`requestPatcher`][37], [`url`][38]

`requestPatcher` is a function that receives a [`NextRequest`][1] object and
returns a [`Request`][39] instance. Use this function to edit the request
_before_ it's injected into the handler.

> [!CAUTION]
>
> Be wary returning a brand new request from `requestPatcher` (i.e.
> `new NextRequest(newUrl)` instead of `new NextRequest(newUrl, oldRequest)`),
> especially one that is missing standard headers added by `fetch(...)`. If
> you're getting strange JSON-related errors or hanging tests, ensure this is
> not the cause.

The returned [`Request`][39] instance will be wrapped with [`NextRequest`][1] if
it is not already an instance of [`NextRequest`][1], i.e.:

```typescript
const returnedRequest = (await requestPatcher?.(request)) || request;
const nextRequest = new NextRequest(returnedRequest, { ... });
```

If you're only setting the request url, use the `url` shorthand instead:

```typescript
await testApiHandler({
  // requestPatcher: (request) => new Request('ntarh:///my-url?some=query', request),
  url: '/my-url?some=query'
});
```

> [!NOTE]
>
> Unlike the Pages Router's `NextApiRequest` type, the App Router's
> `NextRequest` class [does not support relative URLs][40]. Therefore, whenever
> you pass a relative url string via the `url` shorthand (e.g.
> `{ url: '/my-url?some=query' }`), NTARH will wrap that url like so:
> `new URL(url, 'ntarh://')`. In this case, your requests will have urls like
> `ntarh:///my-url?some=query`.

##### URL Normalization

By default, when initializing the `NextRequest` object passed to your handler,
if a URL with an empty `pathname` is encountered, NTARH sets said URL's
`pathname` to `"/"` on your behalf. Additionally, if said URL is missing `host`
and/or `protocol`, NTARH sets `host` to `""` and `protocol` to `"ntarh:"`.

If you want your handler to receive the URL string and resulting
`NextRequest::nextUrl` object exactly as you've typed it, use `requestPatcher`,
which is executed after NTARH does URL normalization.

#### 🔷 Using `pagesHandler`

> ⪢ API reference: [`requestPatcher`][41], [`url`][42]

`requestPatcher` is a function that receives an [`IncomingMessage`][43]. Use
this function to modify the request _before_ it's injected into Next.js's
resolver.

If you're only setting the request url, use the `url` shorthand instead:

```typescript
await testApiHandler({
  // requestPatcher: (req) => { req.url = '/my-url?some=query'; }
  url: '/my-url?some=query'
});
```

Note that, unlike with [the `URL` class][44], the `url` string can be relative.

<br />

### `responsePatcher`

#### 💎 Using `appHandler`

> ⪢ API reference: [`responsePatcher`][45]

`responsePatcher` is a function that receives the [`Response`][46] object
returned from `appHandler` and returns a [`Response`][46] instance. Use this
function to edit the response _after_ your handler runs but _before_ it's
processed by the server.

#### 🔷 Using `pagesHandler`

> ⪢ API reference: [`responsePatcher`][47]

`responsePatcher` is a function that receives a [`ServerResponse`][48] object.
Use this function to edit the response _before_ it's injected into the handler.

<br />

### `paramsPatcher` (`params`)

`paramsPatcher` is a function that receives an object representing "processed"
[dynamic segments][49] (aka: routes, slugs).

For example, to test a handler normally accessible from `/api/user/:id` requires
passing that handler a value for the "id" dynamic segment:

```typescript
await testApiHandler({
  paramsPatcher(params) {
    params.id = 'test-id';
  }
});
```

Or:

```typescript
await testApiHandler({
  paramsPatcher: (params) => ({ id: 'test-id' })
});
```

Parameters can also be passed using the `params` shorthand:

```typescript
await testApiHandler({
  params: {
    id: 'test-id'
  }
});
```

> [!TIP]
>
> Due to its simplicity, favor the `params` shorthand over `paramsPatcher`.

#### 💎 Using `appHandler`

> ⪢ API reference: [`paramsPatcher`][50], [`params`][51]

> [!IMPORTANT]
>
> Note that, starting with `next@15`, the `params` object passed to handlers via
> the context parameter [is now a (Frankensteinian) promise][52]. This means
> tests like `expect(params).toStrictEqual(...)` will no longer work unless
> `params` is first `await`-ed. More information [here][53].

If both `paramsPatcher` and the `params` shorthand are used, `paramsPatcher`
will receive `params` as its first argument.

> Route parameters should not be confused with [query string parameters][54],
> which are automatically parsed out from the url and made available via the
> [`NextRequest`][1] argument passed to your handler.

#### 🔷 Using `pagesHandler`

> ⪢ API reference: [`paramsPatcher`][55], [`params`][56]

If both `paramsPatcher` and the `params` shorthand are used, `paramsPatcher`
will receive an object like `{ ...queryStringURLParams, ...params }` as its
first argument.

> Route parameters should not be confused with [query string parameters][54],
> which are automatically parsed out from the url and added to the `params`
> object before `paramsPatcher` is evaluated.

<br />

## Examples

What follows are several examples that demonstrate using NTARH with the [App
Router][57] and the [Pages Router][58].

Check out [the tests][59] for even more examples.

<br />

### Using the App Router

These examples use Next.js's [App Router][60] API.

#### Testing Apollo's Official Next.js Integration @ `app/api/graphql`

This example is based on [the official Apollo Next.js App Router
integration][61]. You can run it yourself by copying and pasting the following
commands into your terminal.

> The following should be run in a nix-like environment. On Windows, that's
> [WSL][62]. Requires `curl`, `node`, and `git`.

```bash
mkdir -p /tmp/ntarh-test/test
cd /tmp/ntarh-test
npm install --force next @apollo/server @as-integrations/next graphql-tag next-test-api-route-handler jest babel-jest @babel/core @babel/preset-env
echo 'module.exports={presets:["@babel/preset-env"]};' > babel.config.js
mkdir -p app/api/graphql
curl -o app/api/graphql/route.js https://raw.githubusercontent.com/Xunnamius/next-test-api-route-handler/main/apollo_test_raw_app_route
curl -o test/integration.test.js https://raw.githubusercontent.com/Xunnamius/next-test-api-route-handler/main/apollo_test_raw_app_test
npx jest
```

This script creates a new temporary directory, installs NTARH and configures
dependencies, downloads the [app route][63] and [jest test][64] files shown
below, and runs the test using [jest][65].

The following is our new app route:

```typescript
/* File: app/api/graphql/route.js */

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';

const resolvers = {
  Query: {
    hello: () => 'world'
  }
};

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  resolvers,
  typeDefs
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
```

And with the following jest test, we ensure our route integrates with Apollo
correctly:

```typescript
/* File: tests/integration.test.js */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the app/api directory
import * as appHandler from '../app/api/graphql/route';

describe('my-test (app router)', () => {
  it('does what I want 1', async () => {
    expect.hasAssertions();

    await testApiHandler({
      appHandler,
      test: async ({ fetch }) => {
        const query = `query { hello }`;

        const res = await fetch({
          method: 'POST',
          headers: {
            'content-type': 'application/json' // Must use correct content type
          },
          body: JSON.stringify({ query })
        });

        await expect(res.json()).resolves.toStrictEqual({
          data: { hello: 'world' }
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

#### Testing Clerk's Official Next.js Integration @ `app/api/authed`

Suppose we created a new _authenticated_ API endpoint at `app/api/authed` by
[cloning the Clerk App Router demo repo][66] and following [Clerk's quick-start
guide for Next.js][67]:

```typescript
/* File: app/api/authed/route.ts */

import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  return Response.json({ isAuthed: !!userId, userId });
}
```

How might we test that this endpoint functions as we expect?

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../app/api/authed/route';

import type { auth } from '@clerk/nextjs';

let mockedClerkAuthReturnValue: Partial<ReturnType<typeof auth>> | undefined =
  undefined;

jest.mock('@clerk/nextjs', () => {
  return {
    auth() {
      return mockedClerkAuthReturnValue;
    }
  };
});

afterEach(() => {
  mockedClerkAuthReturnValue = undefined;
});

it('returns isAuthed: true and a userId when authenticated', async () => {
  expect.hasAssertions();

  mockedClerkAuthReturnValue = { userId: 'winning' };

  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      await expect((await fetch()).json()).resolves.toStrictEqual({
        isAuthed: true,
        userId: 'winning'
      });
    }
  });
});

it('returns isAuthed: false and nothing else when unauthenticated', async () => {
  expect.hasAssertions();

  mockedClerkAuthReturnValue = { userId: null };

  await testApiHandler({
    appHandler,
    test: async ({ fetch }) => {
      await expect((await fetch()).json()).resolves.toStrictEqual({
        isAuthed: false,
        userId: null
      });
    }
  });
});
```

If you're feeling more adventurous, you can transform this unit test into an
_integration_ test (like the Apollo example above) by calling Clerk's
[`authMiddleware`][68] function in `appHandler` instead of mocking
`@clerk/nextjs`:

```typescript
// This integration test also requires your Clerk dashboard is setup in test
// mode and your Clerk secret key information is available in process.env. Said
// information must be available BEFORE any Clerk packages are imported! You
// will also have to setup authMiddleware properly in ../middleware.ts

/* ... same imports as before ... */
// Also import our Next.js middleware
import { default as middleware } from '../middleware';
// And we want to keep our types as tight as we can too
import type { NextRequest } from 'next/server';

const DUMMY_CLERK_USER_ID = 'user_2aqlGWnjdTRRbbBk9OdBHHbniyK';

it('returns isAuthed: true and a userId when authenticated', async () => {
  expect.hasAssertions();

  await testApiHandler({
    rejectOnHandlerError: true,
    // You may want to alter the default URL pathname like below if your Clerk
    // middleware is using path-based filtering. By default, the pathname
    // will always be '/' because 'ntarh://testApiHandler/' is the default url
    url: 'ntarh://app/api/authed',
    appHandler: {
      get GET() {
        return async function (...args: Parameters<typeof appHandler.GET>) {
          const request = args.at(0) as unknown as NextRequest;
          const middlewareResponse = await middleware(request, {
            /* ... */
          });

          // Make sure we're not being redirected to the sign in page since
          // this is a publicly available endpoint
          expect(middlewareResponse.headers.get('location')).toBeNull();
          expect(middlewareResponse.ok).toBe(true);

          const handlerResponse = await appHandler.GET(...args);

          // You could run some expectations here (since rejectOnHandlerError is
          // true), or you can run your remaining expectations in the test
          // function below. Either way is fine.

          return handlerResponse;
        };
      }
    },
    test: async ({ fetch }) => {
      await expect((await fetch()).json()).resolves.toStrictEqual({
        isAuthed: true,
        userId: DUMMY_CLERK_USER_ID
      });
    }
  });
});

/* ... */
```

You can also try calling [`authMiddleware`][68] in `requestPatcher`; however,
Clerk's middleware does its magic by importing the `headers` helper function
from `'next/headers'`, and **only functions invoked within `appHandler` have
access to the storage context that allows Next.js's helper functions to work**.
For insight into what you'd need to do to make [`authMiddleware`][68] callable
in `requestPatcher`, check out [Clerk's own tests][69].

#### Testing an Unreliable Handler on the Edge @ `app/api/unreliable`

Suppose we have an API endpoint we use to test our application's error handling.
The endpoint responds with status code `HTTP 200` for every request except the
10th, where status code `HTTP 555` is returned instead.

How might we test that this endpoint responds with `HTTP 555` once for every
nine `HTTP 200` responses?

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the app/api directory
import * as edgeHandler from '../app/api/unreliable';

const expectedReqPerError = 10;

it('injects contrived errors at the required rate', async () => {
  expect.hasAssertions();

  // Signal to the edge endpoint (which is configurable) that there should be 1
  // error among every 10 requests
  process.env.REQUESTS_PER_CONTRIVED_ERROR = expectedReqPerError.toString();

  await testApiHandler({
    appHandler: edgeHandler,
    requestPatcher(request) {
      // Our edge handler expects Next.js to provide geo and ip data with the
      // request, so let's add some. This is also where you'd mock/emulate the
      // effects of any Next.js middleware
      //
      // IMPORTANT: starting with next@15, geo/ip have been removed from
      // NextRequest and were functionally replaced by @vercel/function
      // https://github.com/vercel/next.js/pull/68379
      // https://nextjs.org/docs/app/building-your-application/upgrading/version-15#nextrequest-geolocation
      return new NextRequest(request, {
        geo: { city: 'Chicago', country: 'United States' },
        ip: '110.10.77.7'
      });
    },
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

<br />

### Using the Pages Router

These examples use Next.js's [Pages Router][70] API.

#### Testing Next.js's Official Apollo Example @ `pages/api/graphql`

This example uses the [official Next.js Apollo demo][71]. You can easily run it
yourself by copying and pasting the following commands into your terminal.

> The following should be run in a nix-like environment. On Windows, that's
> [WSL][62]. Requires `curl`, `node`, and `git`.

```bash
git clone --depth=1 https://github.com/vercel/next.js /tmp/ntarh-test
cd /tmp/ntarh-test/examples/api-routes-apollo-server-and-client
npm install --force
npm install --force next-test-api-route-handler jest babel-jest @babel/core @babel/preset-env
# You could test with an older version of Next.js if you want, e.g.:
# npm install --force next@9.0.6
# Or even older:
# npm install --force next@9.0.0 next-server
echo 'module.exports={presets:["@babel/preset-env"]};' > babel.config.js
mkdir test
curl -o test/integration.test.js https://raw.githubusercontent.com/Xunnamius/next-test-api-route-handler/main/apollo_test_raw
npx jest
```

This script clones [the Next.js repository][72], installs NTARH and configures
dependencies, downloads the [jest test][73] file shown below, and runs it using
[jest][65] to ensure our route integrates with Apollo correctly.

> [!IMPORTANT]
>
> Note that passing the [route configuration object][74] (imported below as
> `config`) through to NTARH and setting `request.url` to the proper value [may
> be necessary][75] when testing Apollo endpoints using the Pages Router.

```typescript
/* File: examples/api-routes-apollo-server-and-client/tests/integration.test.js */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the pages/api directory
import * as pagesHandler from '../pages/api/graphql';

describe('my-test (pages router)', () => {
  it('does what I want 1', async () => {
    expect.hasAssertions();

    await testApiHandler({
      pagesHandler,
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
          body: JSON.stringify({ query })
        });

        await expect(res.json()).resolves.toStrictEqual({
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

#### Testing an Authenticated Flight Search Handler @ `pages/api/v3/flights/search`

Suppose we have an _authenticated_ API endpoint our application uses to search
for flights. The endpoint responds with an array of flights satisfying the
query.

How might we test that this endpoint returns flights in our database as
expected?

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler';
import { DUMMY_API_KEY as KEY, getFlightData, RESULT_SIZE } from '../backend';
import * as pagesHandler from '../pages/api/v3/flights/search';

import type { PageConfig } from 'next';

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
  // unnecessary here; we could have used `params` or `paramsPatcher` to do this
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

    pagesHandler,

    test: async ({ fetch }) => {
      // 8 URLs from genUrl means 8 calls to fetch:
      const responses = await Promise.all(
        Array.from({ length: 8 }).map(() =>
          fetch({ headers: { KEY } }).then(async (r) => [
            r.status,
            await r.json()
          ])
        )
      );

      // We expect all of the responses to be 200
      expect(responses.some(([status]) => status !== 200)).toBe(false);

      // We expect the array of flights returned to match our
      // expectations given we already know what dummy data will be
      // returned:

      // https://github.com/jest-community/jest-extended#toincludesamemembersmembers
      // because responses could be received out of order
      expect(responses.map(([, r]) => r.flights)).toIncludeSameMembers([
        expectedFlights
          .filter((f) => f.airline === 'Spirit')
          .slice(0, RESULT_SIZE),
        expectedFlights
          .filter((f) => f.type === 'departure')
          .slice(0, RESULT_SIZE),
        expectedFlights
          .filter((f) => f.landingAt === 'F1A')
          .slice(0, RESULT_SIZE),
        expectedFlights
          .filter((f) => f.seatPrice === 500)
          .slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice > 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice >= 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice < 500).slice(0, RESULT_SIZE),
        expectedFlights.filter((f) => f.seatPrice <= 500).slice(0, RESULT_SIZE)
      ]);
    }
  });

  // We expect these two to fail with 400 errors

  await testApiHandler({
    pagesHandler,
    url: `/?match=${encode({ ffms: { $eq: 500 } })}`,
    test: async ({ fetch }) =>
      expect((await fetch({ headers: { KEY } })).status).toBe(400)
  });

  await testApiHandler({
    pagesHandler,
    url: `/?match=${encode({ bad: 500 })}`,
    test: async ({ fetch }) =>
      expect((await fetch({ headers: { KEY } })).status).toBe(400)
  });
});
```

#### Testing an Unreliable Handler @ `pages/api/unreliable`

Suppose we have an API endpoint we use to test our application's error handling.
The endpoint responds with status code `HTTP 200` for every request except the
10th, where status code `HTTP 555` is returned instead.

How might we test that this endpoint responds with `HTTP 555` once for every
nine `HTTP 200` responses?

```typescript
/* File: test/unit.test.ts */

import { testApiHandler } from 'next-test-api-route-handler';
// Import the handler under test from the pages/api directory
import * as pagesHandler from '../pages/api/unreliable';

const expectedReqPerError = 10;

it('injects contrived errors at the required rate', async () => {
  expect.hasAssertions();

  // Signal to the endpoint (which is configurable) that there should be 1
  // error among every 10 requests
  process.env.REQUESTS_PER_CONTRIVED_ERROR = expectedReqPerError.toString();

  await testApiHandler({
    pagesHandler,
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

<br />

<!-- symbiote-template-region-start 5 -->

## Appendix

<!-- symbiote-template-region-end -->

Further documentation can be found under [`docs/`][x-repo-docs].

### Limitations with App Router and Edge Runtime Emulation

Since NTARH is meant for unit testing API routes rather than faithfully
recreating Next.js functionality, NTARH's feature set comes with some caveats.
Namely: no Next.js features will be available that are external to processing
API routes and executing their handlers. This includes [middleware][76] and
`NextResponse.next` (see [`requestPatcher`][77] if you need to mutate the
`Request` before it gets to the handler under test), [metadata][78], [static
assets][79], [OpenTelemetry][80] and [instrumentation][81], [caching][82],
[styling][83], [server actions and mutations][84], [helper functions][3]
(except: `cookies`, `fetch` (global), `headers`, `NextRequest`, `NextResponse`,
`notFound`, `permanentRedirect`, `redirect`, and `userAgent`), and anything
related to React or [components][85].

NTARH is for testing your API route handlers only.

Further, any support NTARH appears to have for any "[edge runtime][86]" (or any
other runtime) beyond what is provided by [`AppRouteRouteModule`][87] is merely
cosmetic. **Your tests will always run in Node.js** (or your runner of choice)
and never in a different runtime, realm, or VM. This means unit testing like
with NTARH must be done in addition to, and not in lieu of, more holistic
testing practices (e.g. [end-to-end][88]).

If you're having trouble with your App Router and/or Edge Runtime routes,
consider [opening a new issue][x-repo-choose-new-issue]!

> Also note that Next.js's middleware **only supports the Edge runtime**, even
> if the Next.js application is being run entirely by Node.js. This is an
> artificial constraint imposed by Next.js; when running the middleware locally
> (via `npm run dev` or something similar), the middleware will still run on
> Node.js.
>
> Next.js's middleware limitation is discussed at length [here][89].

#### Working around the App Router Patching the Global `fetch` Function

Next.js's current App Router implementation mutates the global `fetch` function,
redefining it entirely. This can cause [problems][90] in testing environments
where the global `fetch` is to be mocked by something else.

Internally, NTARH sidesteps this issue entirely by caching the value of
`globalThis.fetch` upon import. This also means NTARH completely sidesteps other
tools that rely on interception through rewriting the global `fetch` function,
such as [Mock Service Worker (MSW)][91]. We still include the MSW bypass headers
with NTARH requests since we cannot guarantee that NTARH will not be imported
_after_ MSW has finished patching global `fetch`.

Similarly, it is impossible for NTARH to meaningfully track mutations to the
global `fetch` function; NTARH cannot tell the difference between Next.js
overwriting `fetch` and, say, a Jest spy overwriting `fetch`. Therefore, **NTARH
does not restore the cached `fetch` after the function returns.**

If Next.js's patching of `fetch` is causing trouble for you, you can do what
NTARH does: capture the current global `fetch` (perhaps after setting up MSW)
and then restore it after each test:

```typescript
const originalGlobalFetch = fetch;

afterEach(function () {
  // Undo what Next.js does to the global fetch function
  globalThis.fetch = originalGlobalFetch;
});
```

#### Working around Global `AsyncLocalStorage` Availability

`AppRouteRouteModule` and its dependents want `AsyncLocalStorage` to be
available globally and _immediately_. Unfortunately, Node.js does not place
`AsyncLocalStorage` in `globalThis` natively.

NTARH handles this by ensuring `AsyncLocalStorage` is added to `globalThis`
before Next.js needs it. This is why [NTARH should always be the very first
import in any test file][12].

<br />

### Legacy Runtime Support

As of version `4.0.0`, NTARH supports both the App Router (for `next@>=14.0.4`)
and the "legacy" Pages Router Next.js APIs. However, due to the code churn with
`next@13`, NTARH's support for the App Router begins at `next@14.0.4`. See
[here][8] and [here][92] for more information.

Additionally, as of version `2.1.0`, NTARH's Pages Router support is fully
backwards compatible with Next.js going _allll_ the way back to `next@9.0.0`
[when API routes were first introduced][93]!

If you're working with the Pages Router and `next@<9.0.6` (so: [before
`next-server` was merged into `next`][94]), you might need to install
`next-server` manually:

```shell
npm install --save-dev next-server
```

Similarly, if you are using `npm@<7` or `node@<15`, you must install Next.js
_and its peer dependencies_ manually. This is because [`npm@<7` does not install
peer dependencies by default][95].

```shell
npm install --save-dev next@latest react
```

> If you're also using an older version of Next.js, ensure you install the [peer
> dependencies (like `react`) that your specific Next.js version requires][96]!

<br />

### Jsdom Support

Note that [jsdom does not support global fetch natively][97]. This should not be
an issue, however, since neither your API code nor your API test code should be
executed in a browser-like environment.

For projects configured to use jsdom by default, you can use an annotation to
switch environments only in the files housing your API tests:

```typescript
/**
 * @jest-environment node
 */
// ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆

import { testApiHandler } from 'next-test-api-route-handler';

test('use the node test environment for all tests in this file', () => {
  //...
});
```

If you're dead set on using jsdom over the node testing environment with NTARH,
see [here][98] and [here][99] for workarounds.

<br />

### Inspiration

I'm constantly creating things with Next.js. Most of these applications have a
major API component. Unfortunately, Next.js doesn't make unit testing your APIs
very easy. After a while, I noticed some conventions forming around how I liked
to test my APIs and NTARH was born 🙂

Of course, this all was back before the app router or edge routes existed. NTARH
got app router and edge route support in version 4.

My hope is that NTARH gets obsoleted because Vercel provided developers with
some officially supported tooling/hooks for _lightweight_ route execution where
handlers are passed fully initialized instances of
`NextRequest`/`NextResponse`/`NextApiRequest`/`NextApiResponse` without
ballooning the execution time of the tests. That is: no spinning up the entire
Next.js runtime just to run a single test in isolation.

It doesn't seem like it'd be such a lift to surface a wrapped version of the
Pages Router's [`apiResolver`][100] function and a pared-down subclass of the
App Router's [`AppRouteRouteModule`][87], both accessible with something like
`import { ... } from 'next/test'`. This is essentially what NTARH does.

<br />

#### History: The Very _Very_ First Version of Ntarh

Was looking over some ancient Next.js projects and found some of the very first
versions of what would eventually become NTARH. My inner code hoarder requires I
note this code's existence somewhere.

Oh how far we've come 🙂

![alt text][101]

<br />

<!-- symbiote-template-region-start 6 -->

### Published Package Details

This is a [CJS2 package][x-pkg-cjs-mojito] with statically-analyzable exports
built by Babel for use in Node.js versions that are not end-of-life. For
TypeScript users, this package supports both `"Node10"` and `"Node16"` module
resolution strategies.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 7 -->

<details><summary>Expand details</summary>

That means both CJS2 (via `require(...)`) and ESM (via `import { ... } from ...`
or `await import(...)`) source will load this package from the same entry points
when using Node. This has several benefits, the foremost being: less code
shipped/smaller package size, avoiding [dual package
hazard][x-pkg-dual-package-hazard] entirely, distributables are not
packed/bundled/uglified, a drastically less complex build process, and CJS
consumers aren't shafted.

Each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][x-repo-package-json] object includes one or more [export
conditions][x-pkg-exports-conditions]. These entries may or may not include: an
[`exports[ENTRY].types`][x-pkg-exports-types-key] condition pointing to a type
declaration file for TypeScript and IDEs, a
[`exports[ENTRY].module`][x-pkg-exports-module-key] condition pointing to
(usually ESM) source for Webpack/Rollup, a `exports[ENTRY].node` and/or
`exports[ENTRY].default` condition pointing to (usually CJS2) source for Node.js
`require`/`import` and for browsers and other environments, and [other
conditions][x-pkg-exports-conditions] not enumerated here. Check the
[package.json][x-repo-package-json] file to see which export conditions are
supported.

Note that, regardless of the [`{ "type": "..." }`][x-pkg-type] specified in
[`package.json`][x-repo-package-json], any JavaScript files written in ESM
syntax (including distributables) will always have the `.mjs` extension. Note
also that [`package.json`][x-repo-package-json] may include the
[`sideEffects`][x-pkg-side-effects-key] key, which is almost always `false` for
optimal [tree shaking][x-pkg-tree-shaking] where appropriate.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 8 -->

</details>

### License

<!-- symbiote-template-region-end -->

See [LICENSE][x-repo-license].

<!-- symbiote-template-region-start 9 -->

## Contributing and Support

**[New issues][x-repo-choose-new-issue] and [pull requests][x-repo-pr-compare]
are always welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟
this project][x-badge-repo-link] to let me know you found it useful! ✊🏿 Or [buy
me a beer][x-repo-sponsor], I'd appreciate it. Thank you!

See [CONTRIBUTING.md][x-repo-contributing] and [SUPPORT.md][x-repo-support] for
more information.

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start 10 -->

### Contributors

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start root-package-only -->
<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-40-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- remark-ignore-end -->

Thanks goes to these wonderful people ([emoji
key][x-repo-all-contributors-emojis]):

<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://xunn.io/"><img src="https://avatars.githubusercontent.com/u/656017?v=4?s=100" width="100px;" alt="Bernard"/><br /><sub><b>Bernard</b></sub></a><br /><a href="#infra-Xunnamius" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=Xunnamius" title="Code">💻</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=Xunnamius" title="Documentation">📖</a> <a href="#maintenance-Xunnamius" title="Maintenance">🚧</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=Xunnamius" title="Tests">⚠️</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/pulls?q=is%3Apr+reviewed-by%3AXunnamius" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://www.linkedin.com/in/kevinjennison/"><img src="https://avatars.githubusercontent.com/u/5924325?v=4?s=100" width="100px;" alt="Kevin Jennison"/><br /><sub><b>Kevin Jennison</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=kmjennison" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/jonkers3"><img src="https://avatars.githubusercontent.com/u/100176328?v=4?s=100" width="100px;" alt="jonkers3"/><br /><sub><b>jonkers3</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=jonkers3" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://valentin-hervieu.fr/"><img src="https://avatars.githubusercontent.com/u/2678610?v=4?s=100" width="100px;" alt="Valentin Hervieu"/><br /><sub><b>Valentin Hervieu</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=ValentinH" title="Code">💻</a> <a href="#ideas-ValentinH" title="Ideas, Planning, & Feedback">🤔</a> <a href="#research-ValentinH" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=ValentinH" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://danawoodman.com/"><img src="https://avatars.githubusercontent.com/u/157695?v=4?s=100" width="100px;" alt="Dana Woodman"/><br /><sub><b>Dana Woodman</b></sub></a><br /><a href="#infra-danawoodman" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/rhys-e"><img src="https://avatars.githubusercontent.com/u/1895732?v=4?s=100" width="100px;" alt="Rhys"/><br /><sub><b>Rhys</b></sub></a><br /><a href="#ideas-rhys-e" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://prakharshukla.dev/"><img src="https://avatars.githubusercontent.com/u/39938009?v=4?s=100" width="100px;" alt="Prakhar Shukla"/><br /><sub><b>Prakhar Shukla</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Aimprakharshukla" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/jakejones2"><img src="https://avatars.githubusercontent.com/u/126596149?v=4?s=100" width="100px;" alt="Jake Jones"/><br /><sub><b>Jake Jones</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Ajakejones2" title="Bug reports">🐛</a> <a href="#ideas-jakejones2" title="Ideas, Planning, & Feedback">🤔</a> <a href="#research-jakejones2" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/desclapez"><img src="https://avatars.githubusercontent.com/u/562849?v=4?s=100" width="100px;" alt="Diego Esclapez"/><br /><sub><b>Diego Esclapez</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Adesclapez" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/k2xl"><img src="https://avatars.githubusercontent.com/u/965260?v=4?s=100" width="100px;" alt="k2xl"/><br /><sub><b>k2xl</b></sub></a><br /><a href="#research-k2xl" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/machineghost"><img src="https://avatars.githubusercontent.com/u/448908?v=4?s=100" width="100px;" alt="Jeremy Walker"/><br /><sub><b>Jeremy Walker</b></sub></a><br /><a href="#example-machineghost" title="Examples">💡</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/adrian-kriegel"><img src="https://avatars.githubusercontent.com/u/23387365?v=4?s=100" width="100px;" alt="Adrian Kriegel"/><br /><sub><b>Adrian Kriegel</b></sub></a><br /><a href="#example-adrian-kriegel" title="Examples">💡</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="http://hems.io/"><img src="https://avatars.githubusercontent.com/u/27327?v=4?s=100" width="100px;" alt="hems.io"/><br /><sub><b>hems.io</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Ahems" title="Bug reports">🐛</a> <a href="#research-hems" title="Research">🔬</a> <a href="#ideas-hems" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-hems" title="Examples">💡</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/steve-taylor"><img src="https://avatars.githubusercontent.com/u/1135589?v=4?s=100" width="100px;" alt="Steve Taylor"/><br /><sub><b>Steve Taylor</b></sub></a><br /><a href="#ideas-steve-taylor" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/willnix86"><img src="https://avatars.githubusercontent.com/u/33470216?v=4?s=100" width="100px;" alt="Will Nixon"/><br /><sub><b>Will Nixon</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Awillnix86" title="Bug reports">🐛</a> <a href="#research-willnix86" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/sebpowell"><img src="https://avatars.githubusercontent.com/u/1786366?v=4?s=100" width="100px;" alt="Sebastien Powell"/><br /><sub><b>Sebastien Powell</b></sub></a><br /><a href="#example-sebpowell" title="Examples">💡</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/zero734kr"><img src="https://avatars.githubusercontent.com/u/51540538?v=4?s=100" width="100px;" alt="Hajin Lim"/><br /><sub><b>Hajin Lim</b></sub></a><br /><a href="#ideas-zero734kr" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://meetjane.dev/"><img src="https://avatars.githubusercontent.com/u/47473728?v=4?s=100" width="100px;" alt="Jane"/><br /><sub><b>Jane</b></sub></a><br /><a href="#example-sustainjane98" title="Examples">💡</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://janhesters.com/"><img src="https://avatars.githubusercontent.com/u/31096420?v=4?s=100" width="100px;" alt="Jan Hesters"/><br /><sub><b>Jan Hesters</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Ajanhesters" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://bencesomogyi.com/"><img src="https://avatars.githubusercontent.com/u/10220181?v=4?s=100" width="100px;" alt="Bence Somogyi"/><br /><sub><b>Bence Somogyi</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Asomogyibence" title="Bug reports">🐛</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=somogyibence" title="Code">💻</a> <a href="#research-somogyibence" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=somogyibence" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/tolivturnstile"><img src="https://avatars.githubusercontent.com/u/121887214?v=4?s=100" width="100px;" alt="Tony"/><br /><sub><b>Tony</b></sub></a><br /><a href="#research-tolivturnstile" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/Jokinen"><img src="https://avatars.githubusercontent.com/u/9090689?v=4?s=100" width="100px;" alt="Jaakko Jokinen"/><br /><sub><b>Jaakko Jokinen</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3AJokinen" title="Bug reports">🐛</a> <a href="#research-Jokinen" title="Research">🔬</a> <a href="#ideas-Jokinen" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://arun.blog/"><img src="https://avatars.githubusercontent.com/u/18581859?v=4?s=100" width="100px;" alt="Arun Sathiya"/><br /><sub><b>Arun Sathiya</b></sub></a><br /><a href="#research-arunsathiya" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=arunsathiya" title="Code">💻</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/scottsymm"><img src="https://avatars.githubusercontent.com/u/274599?v=4?s=100" width="100px;" alt="Scott Symmank"/><br /><sub><b>Scott Symmank</b></sub></a><br /><a href="#research-scottsymm" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Ascottsymm" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/matiasdecarli"><img src="https://avatars.githubusercontent.com/u/2442390?v=4?s=100" width="100px;" alt="Matias De Carli"/><br /><sub><b>Matias De Carli</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=matiasdecarli" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/kingstarfly"><img src="https://avatars.githubusercontent.com/u/38955962?v=4?s=100" width="100px;" alt="Xing Xiang"/><br /><sub><b>Xing Xiang</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=kingstarfly" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://www.kaarlej.com/"><img src="https://avatars.githubusercontent.com/u/117437182?v=4?s=100" width="100px;" alt="Kaarle Järvinen"/><br /><sub><b>Kaarle Järvinen</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3AKaarleJ" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://rorysaur.blog/"><img src="https://avatars.githubusercontent.com/u/4686089?v=4?s=100" width="100px;" alt="Rory Ou"/><br /><sub><b>Rory Ou</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Arorysaur" title="Bug reports">🐛</a> <a href="#research-rorysaur" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=rorysaur" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://twitter.com/snaka"><img src="https://avatars.githubusercontent.com/u/19329?v=4?s=100" width="100px;" alt="Shinji Nakamatsu"/><br /><sub><b>Shinji Nakamatsu</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=snaka" title="Documentation">📖</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Asnaka" title="Bug reports">🐛</a> <a href="#research-snaka" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://davidmytton.blog/"><img src="https://avatars.githubusercontent.com/u/117833?v=4?s=100" width="100px;" alt="David Mytton"/><br /><sub><b>David Mytton</b></sub></a><br /><a href="#research-davidmytton" title="Research">🔬</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Adavidmytton" title="Bug reports">🐛</a> <a href="#data-davidmytton" title="Data">🔣</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/danactive"><img src="https://avatars.githubusercontent.com/u/1093286?v=4?s=100" width="100px;" alt="Dan BROOKS"/><br /><sub><b>Dan BROOKS</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=danactive" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/rosswilson2306"><img src="https://avatars.githubusercontent.com/u/71711192?v=4?s=100" width="100px;" alt="Ross Wilson"/><br /><sub><b>Ross Wilson</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Arosswilson2306" title="Bug reports">🐛</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=rosswilson2306" title="Code">💻</a> <a href="#research-rosswilson2306" title="Research">🔬</a> <a href="#ideas-rosswilson2306" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/bobf"><img src="https://avatars.githubusercontent.com/u/18470?v=4?s=100" width="100px;" alt="bobf"/><br /><sub><b>bobf</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Abobf" title="Bug reports">🐛</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=bobf" title="Code">💻</a> <a href="#research-bobf" title="Research">🔬</a> <a href="#ideas-bobf" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://www.joshmengerink.nl/"><img src="https://avatars.githubusercontent.com/u/10478429?v=4?s=100" width="100px;" alt="Josh"/><br /><sub><b>Josh</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Alordphnx" title="Bug reports">🐛</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=lordphnx" title="Code">💻</a> <a href="#research-lordphnx" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://vexquisit.com/"><img src="https://avatars.githubusercontent.com/u/215671?v=4?s=100" width="100px;" alt="David Heidrich"/><br /><sub><b>David Heidrich</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3ABowlingX" title="Bug reports">🐛</a> <a href="https://github.com/Xunnamius/next-test-api-route-handler/commits?author=BowlingX" title="Code">💻</a> <a href="#research-BowlingX" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/clueleaf"><img src="https://avatars.githubusercontent.com/u/10379303?v=4?s=100" width="100px;" alt="clueleaf"/><br /><sub><b>clueleaf</b></sub></a><br /><a href="#security-clueleaf" title="Security">🛡️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/danstarns"><img src="https://avatars.githubusercontent.com/u/35999252?v=4?s=100" width="100px;" alt="Daniel Starns"/><br /><sub><b>Daniel Starns</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Adanstarns" title="Bug reports">🐛</a> <a href="#ideas-danstarns" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://columkelly.com/"><img src="https://avatars.githubusercontent.com/u/98435978?v=4?s=100" width="100px;" alt="Colum Kelly"/><br /><sub><b>Colum Kelly</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Acolumk1" title="Bug reports">🐛</a> <a href="#research-columk1" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/Oakyden"><img src="https://avatars.githubusercontent.com/u/35015858?v=4?s=100" width="100px;" alt="Oak"/><br /><sub><b>Oak</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3AOakyden" title="Bug reports">🐛</a> <a href="#research-Oakyden" title="Research">🔬</a></td>
      <td align="center" valign="top" width="16.66%"><a href="https://camronflanders.com/"><img src="https://avatars.githubusercontent.com/u/27292?v=4?s=100" width="100px;" alt="Camron Flanders"/><br /><sub><b>Camron Flanders</b></sub></a><br /><a href="https://github.com/Xunnamius/next-test-api-route-handler/issues?q=author%3Acamflan" title="Bug reports">🐛</a> <a href="#research-camflan" title="Research">🔬</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="6">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- remark-ignore-end -->

This project follows the [all-contributors][x-repo-all-contributors]
specification. Contributions of any kind welcome!

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start workspace-package-only -->
<!-- (section elided by symbiote) -->
<!-- symbiote-template-region-end -->

[x-badge-blm-image]: https://xunn.at/badge-blm 'Join the movement!'
[x-badge-blm-link]: https://xunn.at/donate-blm
[x-badge-codecov-image]:
  https://img.shields.io/codecov/c/github/Xunnamius/next-test-api-route-handler/main?style=flat-square&token=HWRIOBAAPW&flag=package.main_root
  'Is this package well-tested?'
[x-badge-codecov-link]:
  https://codecov.io/gh/Xunnamius/next-test-api-route-handler
[x-badge-downloads-image]:
  https://img.shields.io/npm/dm/next-test-api-route-handler?style=flat-square
  'Number of times this package has been downloaded per month'
[x-badge-downloads-link]: https://npmtrends.com/next-test-api-route-handler
[x-badge-lastcommit-image]:
  https://img.shields.io/github/last-commit/Xunnamius/next-test-api-route-handler?style=flat-square
  'Latest commit timestamp'
[x-badge-license-image]:
  https://img.shields.io/npm/l/next-test-api-route-handler?style=flat-square
  "This package's source license"
[x-badge-license-link]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/LICENSE
[x-badge-npm-image]:
  https://xunn.at/npm-pkg-version/next-test-api-route-handler
  'Install this package using npm or yarn!'
[x-badge-npm-link]: https://npm.im/next-test-api-route-handler
[x-badge-repo-link]: https://github.com/Xunnamius/next-test-api-route-handler
[x-badge-semanticrelease-image]:
  https://xunn.at/badge-semantic-release
  'This repo practices continuous integration and deployment!'
[x-badge-semanticrelease-link]:
  https://github.com/semantic-release/semantic-release
[x-pkg-cjs-mojito]:
  https://dev.to/jakobjingleheimer/configuring-commonjs-es-modules-for-nodejs-12ed#publish-only-a-cjs-distribution-with-property-exports
[x-pkg-dual-package-hazard]:
  https://nodejs.org/api/packages.html#dual-package-hazard
[x-pkg-exports-conditions]:
  https://webpack.js.org/guides/package-exports#reference-syntax
[x-pkg-exports-module-key]:
  https://webpack.js.org/guides/package-exports#providing-commonjs-and-esm-version-stateless
[x-pkg-exports-types-key]:
  https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta#packagejson-exports-imports-and-self-referencing
[x-pkg-side-effects-key]:
  https://webpack.js.org/guides/tree-shaking#mark-the-file-as-side-effect-free
[x-pkg-tree-shaking]: https://webpack.js.org/guides/tree-shaking
[x-pkg-type]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[x-repo-all-contributors]: https://github.com/all-contributors/all-contributors
[x-repo-all-contributors-emojis]: https://allcontributors.org/docs/en/emoji-key
[x-repo-choose-new-issue]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues/new/choose
[x-repo-contributing]: /CONTRIBUTING.md
[x-repo-docs]: docs
[x-repo-license]: ./LICENSE
[x-repo-package-json]: package.json
[x-repo-pr-compare]:
  https://github.com/Xunnamius/next-test-api-route-handler/compare
[x-repo-sponsor]: https://github.com/sponsors/Xunnamius
[x-repo-support]: /.github/SUPPORT.md
[1]: https://nextjs.org/docs/app/api-reference/functions/next-request
[2]: https://nextjs.org/docs/app/building-your-application/routing
[3]: https://nextjs.org/docs/app/api-reference/functions
[4]: https://nextjs.org/docs/api-routes/introduction
[5]: https://nextjs.org/docs/basic-features/typescript#api-routes
[6]:
  https://github.com/Xunnamius/next-test-api-route-handler/actions/workflows/is-next-compat.yml
[7]: https://github.com/vercel/next.js/releases
[8]:
  https://github.com/Xunnamius/next-test-api-route-handler/issues/999#issuecomment-1956787672
[9]: #legacy-runtime-support
[10]: #jsdom-support
[11]: #working-around-global-asynclocalstorage-availability
[12]: #usage
[13]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#appHandler
[14]:
  https://github.com/vercel/next.js/blob/0aa0179246d4e59f74cd1d62e3beb8e9b670fc4e/packages/next/src/server/web/http.ts#L5
[15]:
  https://github.com/vercel/next.js/blob/0aa0179246d4e59f74cd1d62e3beb8e9b670fc4e/packages/next/src/server/future/route-modules/app-route/module.ts#L75
[16]:
  https://github.com/vercel/next.js/blob/0aa0179246d4e59f74cd1d62e3beb8e9b670fc4e/packages/next/src/server/future/route-modules/app-route/module.ts#L84
[17]:
  https://github.com/vercel/next.js/blob/0aa0179246d4e59f74cd1d62e3beb8e9b670fc4e/packages/next/src/server/future/route-modules/app-route/module.ts#L100C4-L100C4
[18]: #rejectonhandlererror
[19]: #working-around-the-app-router-patching-the-global-fetch-function
[20]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#pagesHandler
[21]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInit.md#test
[22]: https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch
[23]: https://developer.mozilla.org/en-US/docs/Web/API/fetch#resource
[24]: https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
[25]: https://developer.mozilla.org/en-US/docs/Web/API/fetch#redirect
[26]: https://mswjs.io
[27]:
  https://github.com/mswjs/msw/blob/a037e3a3f4f4d4cc712d2b3867b3410e4bcfaad6/src/core/bypass.ts#L33C29-L33C44
[28]: https://nextjs.org/docs/app/api-reference/functions/redirect
[29]:
  https://nextjs.org/docs/pages/building-your-application/routing/api-routes#redirects-to-a-specified-path-or-url
[30]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
[31]: https://www.npmjs.com/package/cookie
[32]: ./test/unit-index.test.ts
[33]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInit.md#rejectOnHandlerError
[34]:
  https://github.com/vercel/next.js/blob/f4e49377ac3ca2807f773bc1dcd5375c89bde9ef/packages/next/server/api-utils.ts#L134
[35]: #testing-nextjss-official-apollo-example--pagesapigraphql
[36]: #testing-an-authenticated-flight-search-handler--pagesapiv3flightssearch
[37]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#requestpatcher
[38]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#url
[39]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[40]: https://nextjs.org/docs/messages/middleware-relative-urls
[41]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#requestpatcher
[42]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#url
[43]: https://nodejs.org/api/http.html#http_class_http_incomingmessage
[44]: https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#url
[45]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#responsePatcher
[46]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[47]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#responsePatcher
[48]: https://nodejs.org/api/http.html#http_class_http_serverresponse
[49]:
  https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
[50]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#paramsPatcher
[51]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitAppRouter.md#params
[52]: https://github.com/vercel/next.js/pull/70568
[53]:
  https://nextjs.org/docs/app/building-your-application/upgrading/version-15#params--searchparams
[54]: https://en.wikipedia.org/wiki/Query_string
[55]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#paramsPatcher
[56]:
  https://github.com/Xunnamius/next-test-api-route-handler/blob/main/docs/src/interfaces/NtarhInitPagesRouter.md#params
[57]: #using-the-app-router
[58]: #using-the-pages-router
[59]: test/unit-index.test.ts
[60]: https://nextjs.org/docs/app
[61]:
  https://www.npmjs.com/package/@as-integrations/next/v/3.0.0#app-router-route-handlers
[62]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[63]: ./apollo_test_raw_app_route
[64]: ./apollo_test_raw_app_test
[65]: https://www.npmjs.com/package/jest
[66]: https://github.com/clerk/clerk-nextjs-demo-app-router
[67]: https://clerk.com/docs/quickstarts/nextjs
[68]: https://clerk.com/docs/references/nextjs/auth-middleware
[69]:
  https://github.com/clerk/javascript/blob/434a96ebefc550b726b417788b7bae9e41791408/packages/nextjs/src/server/authMiddleware.test.ts#L4
[70]: https://nextjs.org/docs/pages
[71]:
  https://github.com/vercel/next.js/tree/deprecated-main/examples/api-routes-apollo-server-and-client
[72]: https://github.com/vercel/next.js
[73]: ./apollo_test_raw
[74]: https://nextjs.org/docs/api-routes/api-middlewares#custom-config
[75]: https://github.com/Xunnamius/next-test-api-route-handler/issues/56
[76]: https://nextjs.org/docs/app/building-your-application/routing/middleware
[77]: #requestpatcher-url
[78]: https://nextjs.org/docs/app/building-your-application/optimizing#metadata
[79]:
  https://nextjs.org/docs/app/building-your-application/optimizing#static-assets
[80]:
  https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry
[81]:
  https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
[82]: https://nextjs.org/docs/app/building-your-application/caching
[83]: https://nextjs.org/docs/app/building-your-application/styling
[84]:
  https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
[85]: https://nextjs.org/docs/app/api-reference/components
[86]:
  https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#runtime
[87]:
  https://github.com/vercel/next.js/blob/0aa0179246d4e59f74cd1d62e3beb8e9b670fc4e/packages/next/src/server/future/route-modules/app-route/module.ts#L118C24-L118C24
[88]:
  https://nextjs.org/docs/app/building-your-application/testing#types-of-tests
[89]: https://github.com/vercel/next.js/discussions/46722
[90]: https://github.com/mswjs/msw/issues/1644
[91]: https://github.com/mswjs/msw
[92]: https://github.com/Xunnamius/next-test-api-route-handler/discussions/953
[93]: https://nextjs.org/blog/next-9
[94]: https://github.com/vercel/next.js/pull/8613
[95]:
  https://github.blog/2021-02-02-npm-7-is-now-generally-available#peer-dependencies
[96]:
  https://github.com/vercel/next.js/blob/v9.0.0/packages/next/package.json#L106-L109
[97]: https://github.com/jestjs/jest/issues/13834#issuecomment-1407375787
[98]: https://github.com/jsdom/jsdom/issues/1724
[99]:
  https://stackoverflow.com/questions/74945569/cannot-access-built-in-node-js-fetch-function-from-jest-tests
[100]:
  https://github.com/vercel/next.js/blob/90f95399ddfd036624c69b09910f40fa36c00ac2/packages/next/src/server/api-utils/node/api-resolver.ts#L321
[101]: ./very-first-version-of-ntarh.png
[102]:
  https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#limitations-of---fix
