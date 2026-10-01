import { Link } from 'react-router-dom';
import { formatDate, getInitials, truncate } from '../lib/format';
import type { Post } from '../types';

function commentCountLabel(count: number): string {
  if (count === 0) return 'No comments yet';
  return count === 1 ? '1 comment' : `${count} comments`;
}

/** One post in the feed. */
export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
        >
          {getInitials(post.author.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{post.author.name}</p>
          <time dateTime={post.createdAt} className="text-xs text-slate-500">
            {formatDate(post.createdAt)}
          </time>
        </div>
      </div>

      <h2 className="mt-4 text-xl font-semibold leading-snug text-slate-900">
        <Link
          to={`/posts/${post.id}`}
          className="transition-colors hover:text-indigo-700"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">{truncate(post.content)}</p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            />
          </svg>
          {commentCountLabel(post._count.comments)}
        </span>

        <Link to={`/posts/${post.id}`} className="btn btn-primary btn-sm">
          Read More
        </Link>
      </div>
    </article>
  );
}