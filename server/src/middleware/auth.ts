import type { Request, RequestHandler } from 'express';
import { ApiError } from '../lib/ApiError';
import { verifyToken } from '../lib/jwt';
import type { AuthUser } from '../types';

/**
 * Rejects the request unless it carries a valid `Authorization: Bearer <jwt>`
 * header. On success `req.user` is populated.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return next(ApiError.unauthorized('You must be signed in to do that.'));
  }

  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return next(ApiError.unauthorized('Malformed Authorization header. Expected "Bearer <token>".'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    // Never leak why the token failed - expired, tampered with or garbage are
    // all the same problem from the client's point of view.
    return next(ApiError.unauthorized('Your session is invalid or has expired. Please sign in again.'));
  }
};

/** Reads `req.user`, throwing a 401 if `requireAuth` did not run. */
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw ApiError.unauthorized('You must be signed in to do that.');
  }
  return req.user;
}