import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { checkRateLimit } from "./rate-limit";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Rate-limited public procedure.
 * @param maxRequests - max requests per window
 * @param windowMs - window duration in ms
 * @param prefix - key prefix to namespace the limiter
 */
export function rateLimitedProcedure(maxRequests: number, windowMs: number, prefix: string) {
  return publicProcedure.use(({ ctx, next }) => {
    const key = `${prefix}:${ctx.ip}`;
    const { allowed, retryAfterMs } = checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Too many requests. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
      });
    }

    return next({ ctx });
  });
}
