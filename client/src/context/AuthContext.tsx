import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler, tokenStore } from '../services/api';
import * as authService from '../services/authService';
import type { User } from '../types';
import type { RegisterInput } from '../services/authService';

export interface AuthContextValue {
  /** The signed-in user, or `null` when signed out. */
  user: User | null;
  isAuthenticated: boolean;
  /** True while we restore a previous session on first load. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load: if a token was saved earlier, confirm it is still valid.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStore.get()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.fetchCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        // Expired or tampered-with token - drop it and start signed out.
        tokenStore.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // The axios layer calls this when the API rejects our token mid-session, so
  // a long-lived tab still signs itself out cleanly.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    setUser(session.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authService.register(input);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}