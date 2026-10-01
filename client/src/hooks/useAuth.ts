import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';

/**
 * Access the signed-in user.
 *
 * Throws if called outside `<AuthProvider>`, which is a programming mistake
 * rather than something a user can cause - so failing loudly is helpful.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }

  return context;
}