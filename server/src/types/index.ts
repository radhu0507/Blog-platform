/**
 * Shared server-side types.
 */

/** The user shape that is safe to send to the client (no password). */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/** What `requireAuth` attaches to `req.user` once the token is verified. */
export interface AuthUser {
  id: string;
  email: string;
}

/** A post plus the bits of extra data our API always returns with it. */
export interface PostWithRelations {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Pick<SafeUser, 'id' | 'name' | 'email'>;
  _count: { comments: number };
}

/** A comment plus its author. */
export interface CommentWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  author: Pick<SafeUser, 'id' | 'name'>;
}