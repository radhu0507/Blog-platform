import { ApiError } from '../lib/ApiError';
import { prisma } from '../lib/prisma';
import type { PostWithRelations } from '../types';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/** Every post we send includes its author and how many comments it has. */
const postInclude = {
  author: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} as const;

export interface ListPostsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListPostsResult {
  posts: PostWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostInput {
  title: string;
  content: string;
}

/** The blog feed: newest first, with optional title search. */
export async function listPosts({
  search,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
}: ListPostsOptions): Promise<ListPostsResult> {
  const currentPage = Math.max(1, page);
  const pageSize = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);

  const where = search?.trim()
    ? { title: { contains: search.trim(), mode: 'insensitive' as const } }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getPostById(postId: string): Promise<PostWithRelations> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude,
  });

  if (!post) {
    throw ApiError.notFound('That post does not exist.');
  }

  return post;
}

export async function createPost(authorId: string, { title, content }: PostInput): Promise<PostWithRelations> {
  return prisma.post.create({
    data: { title, content, authorId },
    include: postInclude,
  });
}

/**
 * Loads a post and makes sure `userId` owns it.
 *
 * This is the check that stops someone editing or deleting another person's
 * post by calling the API directly, not just by clicking buttons in the UI.
 */
async function assertPostOwnership(postId: string, userId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw ApiError.notFound('That post does not exist.');
  }

  if (post.authorId !== userId) {
    throw ApiError.forbidden('You can only change your own posts.');
  }
}

export async function updatePost(
  postId: string,
  userId: string,
  { title, content }: PostInput,
): Promise<PostWithRelations> {
  await assertPostOwnership(postId, userId);

  // `updatedAt` is maintained automatically by Prisma (@updatedAt).
  return prisma.post.update({
    where: { id: postId },
    data: { title, content },
    include: postInclude,
  });
}

/** Deletes a post. Its comments go with it via the ON DELETE CASCADE rule. */
export async function deletePost(postId: string, userId: string): Promise<{ id: string }> {
  await assertPostOwnership(postId, userId);

  return prisma.post.delete({ where: { id: postId }, select: { id: true } });
}