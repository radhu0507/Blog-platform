import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container-page">
      <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
        <p className="text-6xl font-bold tracking-tight text-indigo-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist, or it may have been moved.
        </p>

        <Link to="/" className="btn btn-primary mt-6">
          Back to all posts
        </Link>
      </div>
    </div>
  );
}