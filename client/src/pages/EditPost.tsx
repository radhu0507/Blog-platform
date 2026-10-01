import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { EmptyState } from '../components/EmptyState';
import { PostForm, type PostValues } from '../components/PostForm';
import { LoadingBlock } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import * as postService from '../services/postService';
import { getErrorMessage, isApiError } from '../types';
import type { Post } from '../types';

/** Protected page: edit one of your own posts. */
export function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadPost() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const loaded = await postService.getPost(id as string);
        if (!cancelled) setPost(loaded);
      } catch (caught) {
        if (cancelled) return;

        if (isApiError(caught) && caught.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(caught, 'Could not load this post.'));
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

  async function handleSave(values: PostValues) {
    if (!post) return;

    await postService.updatePost(post.id, values);
    navigate(`/posts/${post.id}`, { replace: true });
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
            <Link to="/my-posts" className="btn btn-primary">
              Back to my posts
            </Link>
          }
        />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-page">
        <Alert variant="error">{error ?? 'Could not load this post.'}</Alert>
      </div>
    );
  }

  // The API rejects this too - this only avoids showing a form that would fail.
  if (user?.id !== post.authorId) {
    return (
      <div className="container-page">
        <EmptyState
          title="You cannot edit this post"
          description="Only the author can edit or delete a post."
          action={
            <Link to={`/posts/${post.id}`} className="btn btn-primary">
              View the post
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Edit post</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update the title or the content, then save your changes.
        </p>

        <div className="card mt-6 p-6 sm:p-8">
          <PostForm
            initialValues={{ title: post.title, content: post.content }}
            submitLabel="Save changes"
            onSubmit={handleSave}
            onCancel={() => navigate(`/posts/${post.id}`)}
          />
        </div>
      </div>
    </div>
  );
}