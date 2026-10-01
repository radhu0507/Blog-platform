import { Link, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

/** Wraps every page with the navbar and footer. */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-slate-500 sm:flex-row">
          <p>BlogSpace - a learning project built with React, Express and PostgreSQL.</p>
          <Link to="/" className="transition-colors hover:text-indigo-600">
            Back to top
          </Link>
        </div>
      </footer>
    </div>
  );
}