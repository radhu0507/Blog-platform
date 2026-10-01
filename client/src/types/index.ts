/** Shapes shared by the API and the UI. Mirrors the Prisma models. */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthorSummary {
  id: string;
  name: string;
  email?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: AuthorSummary;
  _count: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  postId: string;
  author: Pick<AuthorSummary, 'id' | 'name'>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPostsResponse {
  posts: Post[];
  pagination: Pagination;
}

/** Field name -> message, used to render validation errors under inputs. */
export type FieldErrors = Record<string, string>;

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

/** Every non-2xx response from the API, normalised into one readable shape. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Narrowing helper for `catch` blocks. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** A friendlier fallback message for anything that is not an ApiError. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  return isApiError(error) ? error.message : fallback;
}