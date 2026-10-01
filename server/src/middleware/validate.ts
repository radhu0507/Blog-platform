import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/ApiError';

/**
 * Validates and replaces `req.body` with the parsed result.
 *
 * Validation failures become a 400 with one entry per bad field so the
 * frontend can show the messages next to the right inputs.
 */
export const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      return next(ApiError.badRequest('Please fix the highlighted fields.', errors));
    }

    req.body = result.data;
    return next();
  };