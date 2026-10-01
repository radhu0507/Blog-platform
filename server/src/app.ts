import fs from 'fs';
import path from 'path';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import express from 'express';
import { env } from './lib/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes';

export const app = express();

// PaaS hosts terminate TLS and forward the real client IP in X-Forwarded-For,
// so `secure` cookies and IP-based checks only work if we trust one hop.
app.set('trust proxy', 1);

// Only the React dev server is allowed to call this API from a browser.
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);

// In production this single service also serves the built React app, so there is
// one origin and no CORS in play. `notFound` below must stay last: anything that
// reaches it is a genuine miss and becomes a JSON 404.
if (env.isProduction) {
  const clientDist = path.resolve(__dirname, '..', '..', 'client', 'dist');
  const indexHtml = path.join(clientDist, 'index.html');

  if (fs.existsSync(indexHtml)) {
    // Hashed assets can be cached forever; index.html must not be cached or
    // clients keep loading stale asset filenames after a deploy.
    app.use(
      express.static(clientDist, {
        index: 'index.html',
        maxAge: '1y',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );

    // Client-side routing fallback: deep links like /posts/abc must return the
    // SPA so React Router can take over.
    //
    // Deliberately written as a pathless `app.use` rather than a wildcard route:
    // Express 5 uses path-to-regexp v8, where a bare '*' is invalid and throws at
    // startup, and where a wildcard placed after `/api` would still match
    // unmatched API paths. The guards below make it impossible for the SPA to
    // swallow an API request or a missing asset.
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/api' || req.path.startsWith('/api/')) {
        return next();
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      if (!req.accepts('html')) {
        return next();
      }
      // A last segment containing a dot is a file request (a hashed asset, an
      // icon, a stylesheet). `Accept: */*` satisfies the check above, so without
      // this a missing asset would be answered with index.html and a 200 - which
      // breaks a client holding a stale index.html referencing a deleted file.
      const lastSegment = req.path.slice(req.path.lastIndexOf('/') + 1);
      if (lastSegment.includes('.')) {
        return next();
      }
      res.sendFile(indexHtml, (err) => {
        if (err) next(err);
      });
    });

    console.log(`[api] Serving built client from ${clientDist}`);
  } else {
    console.warn(
      `[api] ${indexHtml} not found - run "npm run build --workspace client" before starting.`,
    );
  }
}

// Unknown URL -> 404, thrown error -> central handler. Order matters.
app.use(notFound);
app.use(errorHandler);