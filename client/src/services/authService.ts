import { request, tokenStore } from './api';
import type { User } from '../types';

export interface AuthSession {
  user: User;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  const session = await request<AuthSession>({
    method: 'POST',
    url: '/auth/register',
    data: input,
  });

  tokenStore.set(session.token);
  return session;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const session = await request<AuthSession>({
    method: 'POST',
    url: '/auth/login',
    data: { email, password },
  });

  tokenStore.set(session.token);
  return session;
}

/**
 * Re-checks the stored token against the server on page load. This is what
 * makes a reload keep you signed in, and what clears a stale token.
 */
export async function fetchCurrentUser(): Promise<User> {
  const { user } = await request<{ user: User }>({ method: 'GET', url: '/auth/me' });
  return user;
}

export function logout(): void {
  tokenStore.clear();
}