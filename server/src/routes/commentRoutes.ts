import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

/**
 * Comments live under two different paths in the API:
 *   /api/posts/:postId/comments  -> read / create
 *   /api/comments/:id            -> update / delete
 * so this file exports a router for each.
 */

/**
 * Mounted at /api/posts/:postId/comments.
 *
 * `mergeParams` is required: without it Express does not pass the parent
 * router's `:postId` down into this router, so `req.params.postId` is empty
 * and every comment request 404s.
 */
export const postCommentsRouter = Router({ mergeParams: true });

postCommentsRouter.get('/', commentController.listByPost);
postCommentsRouter.post(
  '/',
  requireAuth,
  validateBody(commentController.commentSchema),
  commentController.create,
);

/** Mounted at /api/comments */
export const commentsRouter = Router();

commentsRouter.put(
  '/:id',
  requireAuth,
  validateBody(commentController.commentSchema),
  commentController.update,
);
commentsRouter.delete('/:id', requireAuth, commentController.remove);