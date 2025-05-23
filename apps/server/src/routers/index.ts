
import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { contentRouter } from "./content";
import { blogRouter } from "./blog";

export const appRouter = router({
  getRegistrationStatus: publicProcedure.query(() => {
    return { enabled: process.env.REGISTRATION_ENABLED === "true" };
  }),
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  content: contentRouter,
  blog: blogRouter,
});
export type AppRouter = typeof appRouter;
