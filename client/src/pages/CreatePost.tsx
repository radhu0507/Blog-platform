import { useNavigate } from 'react-router-dom';
import { PostForm, type PostValues } from '../components/PostForm';
import * as postService from '../services/postService';

/** Protected page: write a new post. */
export function CreatePost() {
  const navigate = useNavigate();

  async function handleCreate(values: PostValues) {
    const post = await postService.createPost(values);

    // Straight to the published post, as requested.
    navigate(`/posts/${post.id}`, { replace: true });
  }

  return (
    <div className="container-page">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Write a new post</h1>
        <p className="mt-1 text-sm text-slate-600">
          Give it a clear title, then write below. Your post is published immediately.
        </p>

        <div className="card mt-6 p-6 sm:p-8">
          <PostForm
            submitLabel="Publish post"
            onSubmit={handleCreate}
            onCancel={() => navigate('/')}
          />
        </div>
      </div>
    </div>
  );
}