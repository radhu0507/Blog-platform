import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Wraps an async route handler so a rejected promise reaches Express'
 * error handler instead of hanging the request.
 *
 * (Express 5 also forwards rejected promises automatically - this keeps the
 * handlers safe if you ever downgrade to Express 4.)
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/** Sends every successful response in the same shape. */
export function sendSuccess<T>(res: Response, statusCode: number, message: string, data: T) {
  const body: SuccessBody<T> = { success: true, message, data };
  return res.status(statusCode).json(body);
}

/**
 * Reads a route parameter (`:id`, `:postId`, ...) as a plain string.
 *
 * Express 5 types params as `string | string[]` because `*` wildcards can match
 * several segments. Our routes only ever capture a single segment, so this
 * helper keeps the type clean without casts at every call site.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  const single = Array.isArray(value) ? value[0] : value;

  return typeof single === 'string' ? single : '';
}