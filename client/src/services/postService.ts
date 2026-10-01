import { request } from './api';
import type { ListPostsResponse, Post } from '../types';

export interface ListPostsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listPosts(params: ListPostsParams = {}): Promise<ListPostsResponse> {
  return request<ListPostsResponse>({
    method: 'GET',
    url: '/posts',
    params: {
      search: params.search?.trim() || undefined,
      page: params.page,
      limit: params.limit,
    },
  });
}

export async function getPost(id: string): Promise<Post> {
  const { post } = await request<{ post: Post }>({ method: 'GET', url: `/posts/${id}` });
  return post;
}

export async function createPost(input: { title: string; content: string }): Promise<Post> {
  const { post } = await request<{ post: Post }>({
    method: 'POST',
    url: '/posts',
    data: input,
  });
  return post;
}

export async function updatePost(
  id: string,
  input: { title: string; content: string },
): Promise<Post> {
  const { post } = await request<{ post: Post }>({
    method: 'PUT',
    url: `/posts/${id}`,
    data: input,
  });
  return post;
}

export async function deletePost(id: string): Promise<void> {
  await request<{ id: string }>({ method: 'DELETE', url: `/posts/${id}` });
}

const MY_POSTS_PAGE_SIZE = 50;

/**
 * Returns every post written by `authorId`, newest first.
 *
 * The API has no "posts by author" endpoint, so this walks the public feed a
 * page at a time and keeps the matching posts. Fine for a small blog - a
 * production app would add a `?authorId=` query parameter instead.
 */
export async function listPostsByAuthor(authorId: string): Promise<Post[]> {
  const firstPage = await listPosts({ page: 1, limit: MY_POSTS_PAGE_SIZE });
  const mine = firstPage.posts.filter((post) => post.authorId === authorId);

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await listPosts({ page, limit: MY_POSTS_PAGE_SIZE });
    mine.push(...nextPage.posts.filter((post) => post.authorId === authorId));
  }

  return mine;
}