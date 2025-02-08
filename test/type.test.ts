import { NextResponse } from 'next/server';
import { describe, expect, it } from 'tstyche';

import { testApiHandler } from 'universe';

import type { NextRequest } from 'next/server';
import type { NtarhInitAppRouter } from 'universe';

describe('::testApiHandler', () => {
  describe('<app router>', () => {
    it('supports type generics', async () => {
      await testApiHandler<{ a: number }>({
        appHandler: {
          async GET() {
            // ? We shouldn't be type checking this deep
            return Response.json({ b: 1 });
          }
        },
        test: async ({ fetch }) => {
          expect(await (await fetch()).json()).type.toHaveProperty('a');
          expect(await (await fetch()).json()).type.not.toHaveProperty('b');
        }
      });
    });

    it('does not throw any AppRouteUserlandModule-related type errors', async () => {
      expect({
        async GET(_req: NextRequest, _params: { params: { recipeId: string } }) {
          return NextResponse.json({});
        }
      }).type.toBeAssignableTo<NtarhInitAppRouter['appHandler']>();

      expect({
        async LOL() {
          return NextResponse.json({});
        },
        async GET(_req: NextRequest, _params: { params: { recipeId: string } }) {
          return NextResponse.json({});
        }
      }).type.not.toBeAssignableTo<NtarhInitAppRouter['appHandler']>();
    });
  });

  describe('<pages router>', () => {
    it('supports type generics', async () => {
      await testApiHandler<{ a: number }>({
        pagesHandler: async (_, res) => {
          // ? Formerly we would expect an error to be thrown here, but in
          // ? NTARH@4 we've relaxed the type checking so that only fetch::json
          // ? is affected. I believe this leads to more accurate and more
          // ? useful type checking for NTARH users.
          res.send({ b: 1 });
        },
        test: async ({ fetch }) => {
          expect(await (await fetch()).json()).type.toHaveProperty('a');
          expect(await (await fetch()).json()).type.not.toHaveProperty('b');
        }
      });
    });
  });
});
