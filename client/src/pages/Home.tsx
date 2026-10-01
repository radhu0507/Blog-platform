import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { EmptyState } from '../components/EmptyState';
import { PostCard } from '../components/PostCard';
import { LoadingBlock } from '../components/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import * as postService from '../services/postService';
import { getErrorMessage } from '../types';
import type { ListPostsResponse } from '../types';

const PAGE_SIZE = 6;

/** The blog feed: newest first, with a debounced title search. */
export function Home() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  // A new search always starts from the first page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await postService.listPosts({
          search: debouncedSearch,
          page,
          limit: PAGE_SIZE,
        });
        if (!cancelled) setResult(data);
      } catch (caught) {
        if (!cancelled) setError(getErrorMessage(caught, 'Could not load posts.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  const posts = result?.posts ?? [];
  const pagination = result?.pagination;
  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <div className="container-page">
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Latest posts
        </h1>
        <p className="mt-2 text-slate-600">
          Stories, tutorials and notes from the BlogSpace community.
        </p>

        <div className="mt-5 max-w-md">
          <label className="sr-only" htmlFor="post-search">
            Search posts by title
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="post-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts by title..."
              className="input pl-9"
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingBlock label="Loading posts..." />
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : posts.length === 0 ? (
        isSearching ? (
          <EmptyState
            title="No posts match your search"
            description={`We could not find any posts titled "${debouncedSearch}". Try a different word.`}
            action={
              <button type="button" className="btn btn-secondary" onClick={() => setSearch('')}>
                Clear search
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No posts yet"
            description="Once someone publishes the first post it will show up right here."
            action={
              <Link to="/posts/new" className="btn btn-primary">
                Write the first post
              </Link>
            }
          />
        )
      ) : (
        <>
          <div className="grid gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <nav
              className="mt-8 flex items-center justify-between"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>

              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}