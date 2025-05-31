import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { contentRouter } from "./content";
import { blogRouter } from "./blog";
import { uploadRouter } from "./upload";
import { mailRouter } from "./mail";
import { commentsRouter } from "./comments";
import { newsletterRouter } from "./newsletter";

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
  upload: uploadRouter,
  mail: mailRouter,
  comments: commentsRouter,
  newsletter: newsletterRouter,
});
export type AppRouter = typeof appRouter;
