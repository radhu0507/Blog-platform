import { Link, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

/** Wraps every page with the navbar and footer. */
export function MainLayout() {
  const year = new Date().getFullYear();
  const linkStyles = 'transition-colors hover:text-indigo-600';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-page py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
                >
                  B
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-900">BlogSpace</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                Publish what you know, read what other people are writing, and keep the
                conversation going in the comments.
              </p>
            </div>

            <nav aria-labelledby="footer-explore">
              <h2 id="footer-explore" className="text-sm font-semibold text-slate-900">
                Explore
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>
                  <Link to="/" className={linkStyles}>
                    Latest posts
                  </Link>
                </li>
                <li>
                  <Link to="/posts/new" className={linkStyles}>
                    Write a post
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-account">
              <h2 id="footer-account" className="text-sm font-semibold text-slate-900">
                Account
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>
                  <Link to="/my-posts" className={linkStyles}>
                    My posts
                  </Link>
                </li>
                <li>
                  <Link to="/login" className={linkStyles}>
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className={linkStyles}>
                    Create an account
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            &copy; {year} BlogSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}