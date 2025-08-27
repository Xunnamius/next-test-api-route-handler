import { isolatedImport } from 'testverse:util.ts';

const importNtarh = () =>
  isolatedImport<typeof import('universe')>('universe').testApiHandler;

describe('direct invocation (no HTTP server)', () => {
  it('executes handlers without starting an HTTP server; basic response and cookies work', async () => {
    expect.hasAssertions();

    const http = require('node:http');
    const spy = jest.spyOn(http, 'createServer');

    await expect(
      importNtarh()({
        pagesHandler: async (_req, res) => {
          res.setHeader('Set-Cookie', ['__has=yes; Path=/']);
          res.status(200).json({ ok: true });
        },
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(spy).not.toHaveBeenCalled();
          expect(res.ok).toBeTrue();
          expect(res.cookies[0]?.__has).toBe('yes');
          await expect(res.json()).resolves.toStrictEqual({ ok: true });
        }
      })
    ).resolves.toBeUndefined();

    spy.mockRestore();
  });

  it('handles HEAD responses with empty bodies (pages router)', async () => {
    expect.hasAssertions();

    await expect(
      importNtarh()({
        pagesHandler: async (_req, res) => {
          res.status(200).send('should not be visible');
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'HEAD' });
          await expect(res.text()).resolves.toBe('');
        }
      })
    ).resolves.toBeUndefined();
  });

  it('handles HEAD responses with empty bodies (app router)', async () => {
    expect.hasAssertions();

    await expect(
      importNtarh()({
        appHandler: {
          async HEAD() {
            return new Response('should not be visible');
          }
        },
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'HEAD' });
          await expect(res.text()).resolves.toBe('');
        }
      })
    ).resolves.toBeUndefined();
  });
});
