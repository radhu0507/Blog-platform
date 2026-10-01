import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/format';
import * as postService from '../services/postService';
import { getErrorMessage } from '../types';
import type { Post } from '../types';

function commentCountLabel(count: number): string {
  if (count === 0) return 'No comments';
  return count === 1 ? '1 comment' : `${count} comments`;
}

/** Protected page: the signed-in user's own posts. */
export function MyPosts() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadMyPosts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const mine = await postService.listPostsByAuthor(user.id);
      setPosts(mine);
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not load your posts.'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMyPosts();
  }, [loadMyPosts]);

  async function confirmDelete() {
    if (!postToDelete) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await postService.deletePost(postToDelete.id);
      setPosts((previous) => previous.filter((post) => post.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (caught) {
      setDeleteError(getErrorMessage(caught, 'Could not delete this post.'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="container-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Posts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Everything you have published, newest first.
          </p>
        </div>

        <Link to="/posts/new" className="btn btn-primary">
          New post
        </Link>
      </div>

      {deleteError ? (
        <div className="mt-5">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {isLoading ? (
          <LoadingBlock label="Loading your posts..." />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : posts.length === 0 ? (
          <EmptyState
            title="You have not written anything yet"
            description="Your posts will be listed here once you publish your first one."
            action={
              <Link to="/posts/new" className="btn btn-primary">
                Write your first post
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      <Link
                        to={`/posts/${post.id}`}
                        className="transition-colors hover:text-indigo-700"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      <span aria-hidden="true">&middot;</span>
                      <span>{commentCountLabel(post._count.comments)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link to={`/posts/${post.id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                    <Link to={`/posts/${post.id}/edit`} className="btn btn-secondary btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeleteError(null);
                        setPostToDelete(post);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={postToDelete !== null}
        title="Delete this post?"
        message={
          postToDelete
            ? `"${postToDelete.title}" and all of its comments will be permanently removed.`
            : ''
        }
        busy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
}