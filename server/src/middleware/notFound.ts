import type { RequestHandler } from 'express';
import { ApiError } from '../lib/ApiError';

/** Catch-all for unknown URLs. Runs after every router. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}.`));
};