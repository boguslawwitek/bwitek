
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";

const registrationEnabled = process.env.REGISTRATION_ENABLED === "true";
const corsOrigin = process.env.CORS_ORIGIN;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: schema,
  }),
  trustedOrigins: corsOrigin ? [corsOrigin] : [],
  emailAndPassword: {
    enabled: true,
    registration: {
      enabled: registrationEnabled
    },
    minPasswordLength: 10,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    cookiePrefix: "bwitek",
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: "lax",
    },
  },
});

