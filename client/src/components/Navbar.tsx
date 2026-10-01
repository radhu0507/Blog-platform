import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../lib/format';

const NAV_LINK_STYLES =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900';

/** Top navigation. Swaps its links as soon as the auth state changes. */
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
          >
            B
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">BlogSpace</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? `${NAV_LINK_STYLES} text-indigo-700` : `${NAV_LINK_STYLES} text-slate-600`
            }
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/posts/new"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? `${NAV_LINK_STYLES} text-indigo-700` : `${NAV_LINK_STYLES} text-slate-600`
                }
              >
                Create Post
              </NavLink>
              <NavLink
                to="/my-posts"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? `${NAV_LINK_STYLES} text-indigo-700` : `${NAV_LINK_STYLES} text-slate-600`
                }
              >
                My Posts
              </NavLink>

              <span className="mx-2 flex items-center gap-2 border-l border-slate-200 pl-4">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
                >
                  {getInitials(user?.name ?? '')}
                </span>
                <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700">
                  {user?.name}
                </span>
              </span>

              <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? `${NAV_LINK_STYLES} text-indigo-700` : `${NAV_LINK_STYLES} text-slate-600`
                }
              >
                Login
              </NavLink>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="btn btn-ghost btn-sm md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile links */}
      {isMenuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${NAV_LINK_STYLES} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`
              }
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/posts/new"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${NAV_LINK_STYLES} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`
                  }
                >
                  Create Post
                </NavLink>
                <NavLink
                  to="/my-posts"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${NAV_LINK_STYLES} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`
                  }
                >
                  My Posts
                </NavLink>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
                    >
                      {getInitials(user?.name ?? '')}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                  </span>
                  <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${NAV_LINK_STYLES} ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`
                  }
                >
                  Login
                </NavLink>
                <Link to="/register" onClick={closeMenu} className="btn btn-primary mt-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}