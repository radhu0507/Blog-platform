import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as commentService from '../services/commentService';
import { getErrorMessage } from '../types';
import type { Comment } from '../types';
import { Alert } from './Alert';
import { CommentItem } from './CommentItem';
import { LoadingBlock } from './Spinner';

interface CommentSectionProps {
  postId: string;
  /** Keeps the post header's comment count in sync as comments change. */
  onCountChange: (count: number) => void;
}

/**
 * Loads and manages the comments for one post.
 *
 * Reading is public; writing requires a signed-in user, so signed-out visitors
 * get a prompt linking to the login page instead of a comment box.
 */
export function CommentSection({ postId, onCountChange }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const loaded = await commentService.listComments(postId);
      setComments(loaded);
      onCountChange(loaded.length);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load comments.'));
    } finally {
      setIsLoading(false);
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function handleAddComment() {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const created = await commentService.createComment(postId, draft);
      setComments((previous) => [...previous, created]);
      onCountChange(comments.length + 1);
      setDraft('');
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not add your comment.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpdated(updated: Comment) {
    setComments((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
  }

  function handleDeleted(commentId: string) {
    const next = comments.filter((item) => item.id !== commentId);
    setComments(next);
    onCountChange(next.length);
  }

  return (
    <section className="mt-10" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
        Comments {comments.length > 0 ? <span className="text-slate-400">({comments.length})</span> : null}
      </h2>

      {/* New comment */}
      <div className="mt-4">
        {isAuthenticated ? (
          <div className="card p-4">
            <label className="label" htmlFor="new-comment">
              Leave a comment as {user?.name}
            </label>
            <textarea
              id="new-comment"
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Share your thoughts..."
              disabled={isSubmitting}
              className="input resize-y font-sans"
            />

            {submitError ? (
              <div className="mt-3">
                <Alert variant="error">{submitError}</Alert>
              </div>
            ) : null}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddComment}
                disabled={isSubmitting || draft.trim().length === 0}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-slate-600">Sign in to join the conversation.</p>
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="btn btn-primary btn-sm"
            >
              Log in to comment
            </Link>
          </div>
        )}
      </div>

      {/* Comment list */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingBlock label="Loading comments..." />
        ) : loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <ul className="card divide-y divide-slate-100 px-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canManage={user?.id === comment.authorId}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}