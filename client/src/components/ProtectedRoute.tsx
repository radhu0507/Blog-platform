import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingBlock } from './Spinner';

/**
 * Gate for signed-in-only pages.
 *
 * Signed-out visitors are redirected to /login and sent back to whatever they
 * were trying to reach once they sign in.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait until we know whether a stored token is valid, otherwise a page
  // refresh would bounce an authenticated user to the login page.
  if (isLoading) {
    return <LoadingBlock label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}