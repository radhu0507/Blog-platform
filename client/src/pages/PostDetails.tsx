import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { CommentSection } from '../components/CommentSection';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingBlock } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime, getInitials } from '../lib/format';
import * as postService from '../services/postService';
import { getErrorMessage, isApiError } from '../types';
import type { Post } from '../types';

export function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadPost() {
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);

      try {
        const loaded = await postService.getPost(id as string);
        if (cancelled) return;

        setPost(loaded);
        setCommentCount(loaded._count.comments);
      } catch (caught) {
        if (cancelled) return;

        // A missing post is a normal outcome, not a crash.
        if (isApiError(caught) && caught.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(getErrorMessage(caught, 'Could not load this post.'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!post) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await postService.deletePost(post.id);
      navigate('/', { replace: true });
    } catch (caught) {
      setDeleteError(getErrorMessage(caught, 'Could not delete this post.'));
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container-page">
        <LoadingBlock label="Loading post..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-page">
        <EmptyState
          title="Post not found"
          description="This post may have been deleted, or the link might be wrong."
          action={
            <Link to="/" className="btn btn-primary">
              Back to all posts
            </Link>
          }
        />
      </div>
    );
  }

  if (loadError || !post) {
    return (
      <div className="container-page">
        <Alert variant="error">{loadError ?? 'Could not load this post.'}</Alert>
      </div>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const wasEdited = post.updatedAt !== post.createdAt;

  return (
    <div className="container-page">
      <Link to="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
        &larr; Back to posts
      </Link>

      <article className="mt-4">
        <header className="card p-6 sm:p-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
              >
                {getInitials(post.author.name)}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">{post.author.name}</p>
                <p className="text-xs text-slate-500">
                  <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
                  {wasEdited ? ' - edited' : ''}
                </p>
              </div>
            </div>

            {/* Only the author sees these, and the API enforces it too. */}
            {isAuthor ? (
              <div className="flex items-center gap-2">
                <Link to={`/posts/${post.id}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="card mt-5 p-6 sm:p-8">
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
            {post.content}
          </div>
        </div>
      </article>

      {deleteError ? (
        <div className="mt-5">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      ) : null}

      <CommentSection postId={post.id} onCountChange={setCommentCount} />

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete this post?"
        message={`"${post.title}" and all ${commentCount} of its comments will be permanently removed.`}
        busy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}