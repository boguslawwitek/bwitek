if (process.env.NODE_ENV === 'production') {
  // In production, try to load .env.production but don't fail if it doesn't exist
  // Docker-compose environment variables will take precedence anyway
  try {
    const { config } = await import('dotenv');
    config({ path: '.env.production' });
  } catch (error) {
    // .env.production file doesn't exist, rely on system environment variables
    console.log('No .env.production file found, using system environment variables');
  }
} else {
  await import('dotenv/config');
}

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { serveStatic } from '@hono/node-server/serve-static';
import { rssService } from "./services/rss";

const app = new Hono();

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use('/api/uploads/*', serveStatic({
  root: './uploads',
  rewriteRequestPath: (path: string) => path.replace(/^\/api\/uploads/, ''),
}));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

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
  port: process.env.SERVER_PORT || 3000,
  fetch: app.fetch, 
}
