import { ApiError } from '../lib/ApiError';
import { prisma } from '../lib/prisma';
import type { CommentWithAuthor } from '../types';

const commentInclude = {
  author: { select: { id: true, name: true } },
} as const;

/** Comments for one post, oldest first so the thread reads chronologically. */
export async function listCommentsByPost(postId: string): Promise<CommentWithAuthor[]> {
  const postExists = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!postExists) {
    throw ApiError.notFound('That post does not exist.');
  }

  return prisma.comment.findMany({
    where: { postId },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<CommentWithAuthor> {
  const postExists = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!postExists) {
    throw ApiError.notFound('That post does not exist.');
  }

  return prisma.comment.create({
    data: { content, postId, authorId },
    include: commentInclude,
  });
}

/** Same ownership guard as posts: only the comment's author may change it. */
async function assertCommentOwnership(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    throw ApiError.notFound('That comment does not exist.');
  }

  if (comment.authorId !== userId) {
    throw ApiError.forbidden('You can only change your own comments.');
  }
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
): Promise<CommentWithAuthor> {
  await assertCommentOwnership(commentId, userId);

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: commentInclude,
  });
}

export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<{ id: string }> {
  await assertCommentOwnership(commentId, userId);

  return prisma.comment.delete({ where: { id: commentId }, select: { id: true } });
}