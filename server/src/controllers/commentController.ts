import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, getParam, sendSuccess } from '../lib/http';
import { getAuthUser } from '../middleware/auth';
import * as commentService from '../services/commentService';

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, 'Comment must be at least 2 characters.')
    .max(1000, 'Comment must be at most 1000 characters.'),
});

/** GET /api/posts/:postId/comments */
export const listByPost = asyncHandler(async (req: Request, res: Response) => {
  const comments = await commentService.listCommentsByPost(getParam(req, 'postId'));

  return sendSuccess(res, 200, 'Here are the comments.', { comments, total: comments.length });
});

/** POST /api/posts/:postId/comments */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const { content } = req.body as z.infer<typeof commentSchema>;

  const comment = await commentService.createComment(getParam(req, 'postId'), currentUser.id, content);

  return sendSuccess(res, 201, 'Your comment has been added.', { comment });
});

/** PUT /api/comments/:id */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const { content } = req.body as z.infer<typeof commentSchema>;

  const comment = await commentService.updateComment(getParam(req, 'id'), currentUser.id, content);

  return sendSuccess(res, 200, 'Your comment has been updated.', { comment });
});

/** DELETE /api/comments/:id */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);

  await commentService.deleteComment(getParam(req, 'id'), currentUser.id);

  return sendSuccess(res, 200, 'Your comment has been deleted.', { id: getParam(req, 'id') });
});