import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, getParam, sendSuccess } from '../lib/http';
import { getAuthUser } from '../middleware/auth';
import * as postService from '../services/postService';

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(140, 'Title must be at most 140 characters.'),
  content: z
    .string()
    .trim()
    .min(10, 'Content must be at least 10 characters.')
    .max(50_000, 'Content must be at most 50000 characters.'),
});

/**
 * Reads `?search`, `?page` and `?limit` from the query string.
 * Values arrive as strings, so they need coercing before use.
 */
function readListQuery(query: Request['query']) {
  const first = Number.parseInt(String(query.page ?? '1'), 10);
  const second = Number.parseInt(String(query.limit ?? '10'), 10);

  return {
    search: typeof query.search === 'string' ? query.search : undefined,
    page: Number.isFinite(first) ? first : 1,
    limit: Number.isFinite(second) ? second : 10,
  };
}

/** GET /api/posts */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.listPosts(readListQuery(req.query));

  return sendSuccess(res, 200, 'Here are the latest posts.', result);
});

/** GET /api/posts/:id */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostById(getParam(req, 'id'));

  return sendSuccess(res, 200, 'Here is your post.', { post });
});

/** POST /api/posts */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const { title, content } = req.body as z.infer<typeof postSchema>;

  const post = await postService.createPost(currentUser.id, { title, content });

  return sendSuccess(res, 201, 'Your post has been published.', { post });
});

/** PUT /api/posts/:id */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const { title, content } = req.body as z.infer<typeof postSchema>;

  const post = await postService.updatePost(getParam(req, 'id'), currentUser.id, { title, content });

  return sendSuccess(res, 200, 'Your post has been updated.', { post });
});

/** DELETE /api/posts/:id */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);

  await postService.deletePost(getParam(req, 'id'), currentUser.id);

  return sendSuccess(res, 200, 'Your post has been deleted.', { id: getParam(req, 'id') });
});