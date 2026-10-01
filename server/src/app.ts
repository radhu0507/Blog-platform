import cors from 'cors';
import express from 'express';
import { env } from './lib/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes';

export const app = express();

// Only the React dev server is allowed to call this API from a browser.
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);

// Unknown URL -> 404, thrown error -> central handler. Order matters.
app.use(notFound);
app.use(errorHandler);