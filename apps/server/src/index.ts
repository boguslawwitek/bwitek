import './env';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 ? parseInt(args[portIndex + 1]) : null;
const serverPort = cliPort || process.env.SERVER_PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  console.error('\x1b[31m%s\x1b[0m', 'FATAL: CORS_ORIGIN environment variable is not set. Refusing to start.');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', `Server running at ${process.env.BETTER_AUTH_URL || `http://localhost${serverPort}`}`);

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { serveStatic } from '@hono/node-server/serve-static';
import { rssService } from "./services/rss";
import { checkRateLimit } from "./lib/rate-limit";

const app = new Hono();

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

app.use(secureHeaders({
  crossOriginResourcePolicy: 'cross-origin',
}));

app.use(
  "/*",
  cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use('/api/uploads/*', serveStatic({
  root: './uploads',
  rewriteRequestPath: (path: string) => path.replace(/^\/api\/uploads/, ''),
}));

// Rate limit auth endpoints: 10 requests per 15 minutes per IP
app.on(["POST", "GET"], "/api/auth/**", (c, next) => {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(`auth:${ip}`, 10, 15 * 60 * 1000);

  if (!allowed) {
    return c.json(
      { error: `Too many requests. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.` },
      429,
    );
  }

  return auth.handler(c.req.raw);
});

app.use("/trpc/*", trpcServer({
  router: appRouter,
  createContext: (_opts, context) => {
    return createContext({ context });
  },
}));

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// RSS endpoints
app.get("/rss/pl.xml", async (c) => {
  try {
    const lastModified = await rssService.getLastModified('pl');
    const etag = rssService.generateETag(lastModified, 'pl');

    if (c.req.header('if-none-match') === etag) {
      return c.newResponse('', 304);
    }

    const rssXml = await rssService.generateRSSFeed({ language: 'pl' });
    return c.text(rssXml, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'ETag': etag,
      'Last-Modified': lastModified.toUTCString()
    });
  } catch (error) {
    console.error('Error generating Polish RSS feed:', error);
    return c.text('Error generating RSS feed', 500);
  }
});

app.get("/rss/en.xml", async (c) => {
  try {
    const lastModified = await rssService.getLastModified('en');
    const etag = rssService.generateETag(lastModified, 'en');

    if (c.req.header('if-none-match') === etag) {
      return c.newResponse('', 304);
    }

    const rssXml = await rssService.generateRSSFeed({ language: 'en' });
    return c.text(rssXml, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'ETag': etag,
      'Last-Modified': lastModified.toUTCString()
    });
  } catch (error) {
    console.error('Error generating English RSS feed:', error);
    return c.text('Error generating RSS feed', 500);
  }
});

app.get("/rss.xml", async (c) => {
  try {
    const lastModified = await rssService.getLastModified('pl');
    const etag = rssService.generateETag(lastModified, 'pl');

    if (c.req.header('if-none-match') === etag) {
      return c.newResponse('', 304);
    }

    const rssXml = await rssService.generateRSSFeed({ language: 'pl' });
    return c.text(rssXml, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'ETag': etag,
      'Last-Modified': lastModified.toUTCString()
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return c.text('Error generating RSS feed', 500);
  }
});

export default {
  port: serverPort,
  fetch: app.fetch,
}
