import { request } from './api';
import type { Comment } from '../types';

export async function listComments(postId: string): Promise<Comment[]> {
  const { comments } = await request<{ comments: Comment[]; total: number }>({
    method: 'GET',
    url: `/posts/${postId}/comments`,
  });
  return comments;
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const { comment } = await request<{ comment: Comment }>({
    method: 'POST',
    url: `/posts/${postId}/comments`,
    data: { content },
  });
  return comment;
}

export async function updateComment(id: string, content: string): Promise<Comment> {
  const { comment } = await request<{ comment: Comment }>({
    method: 'PUT',
    url: `/comments/${id}`,
    data: { content },
  });
  return comment;
}

export async function deleteComment(id: string): Promise<void> {
  await request<{ id: string }>({ method: 'DELETE', url: `/comments/${id}` });
}