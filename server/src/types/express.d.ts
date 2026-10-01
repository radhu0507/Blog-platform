import type { AuthUser } from './index';

/**
 * Teaches Express about the `user` property that our auth middleware adds to
 * every authenticated request. This file must be a module (hence `export {}`).
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Present only on routes that run `requireAuth`. */
      user?: AuthUser;
    }
  }
}

export {};