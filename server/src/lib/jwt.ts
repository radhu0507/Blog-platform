import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from './env';

/** How long a freshly issued token stays valid. */
export const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  /** User id. */
  sub: string;
  email: string;
}

/** Creates a signed JWT for the given user id. */
export function signToken(payload: JwtPayload): string {
  return jwt.sign({ email: payload.email }, env.JWT_SECRET, {
    subject: payload.sub,
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Verifies a JWT and returns its payload.
 * Throws when the token is invalid, expired or malformed.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new jwt.JsonWebTokenError('Token payload is invalid');
  }

  return { sub: decoded.sub, email: String(decoded.email ?? '') };
}