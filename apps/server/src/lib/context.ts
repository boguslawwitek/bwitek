import type { Context as HonoContext } from "hono";
import { auth } from "./auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const ip =
    context.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    context.req.header('x-real-ip') ||
    'unknown';
  const userAgent = context.req.header('user-agent') || 'unknown';

  return {
    session,
    ip,
    userAgent,
  };
}


export type Context = Awaited<ReturnType<typeof createContext>>;
