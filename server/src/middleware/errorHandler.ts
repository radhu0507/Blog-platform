import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { ApiError } from '../lib/ApiError';

interface ErrorBody {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

/**
 * The single place where errors become HTTP responses.
 *
 * Errors we throw on purpose (`ApiError`) keep their message. Everything else
 * is logged for the developer and replaced by a generic message so database
 * details, stack traces and secrets never reach the client.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // The response already started - nothing useful left to do.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Something went wrong on our side. Please try again.';
  let errors: { field: string; message: string }[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Please fix the highlighted fields.';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Your session is invalid. Please sign in again.';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      message = 'An account with that email already exists.';
      errors = [{ field: 'email', message: 'This email is already registered.' }];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested resource was not found.';
    } else {
      console.error('Prisma error:', err.code, err.message);
    }
  } else {
    console.error('Unhandled error:', err);
  }

  const body: ErrorBody = { success: false, message };
  if (errors) body.errors = errors;

  return res.status(statusCode).json(body);
};