import axios, { AxiosError } from 'axios';
import { ApiError, type ApiFailure, type ApiSuccess, type FieldErrors } from '../types';

const TOKEN_KEY = 'blogspace_token';

/**
 * Where the JWT lives.
 *
 * localStorage survives a page reload (which is why "stay signed in" works),
 * but it is readable by any script on the page. For a learning project that is
 * an accepted trade-off; see the README limitations.
 */
export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Production is a single Render service: Express serves `client/dist`, so the API
 * lives on the same origin and the relative `/api` path is correct. Defaulting to
 * localhost in a production build would point the browser at the visitor's own
 * machine instead of the deployed server, which is what makes the app report the
 * backend as missing.
 *
 * Local development keeps talking to the API on port 5000, either through
 * `VITE_API_URL` or this default.
 */
const defaultBaseUrl = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  // Falls back to the environment-appropriate default so the app still works if
  // .env is missing. `||` rather than `??` so an empty value cannot win.
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

/** Called when the API rejects our token, so the app can sign the user out. */
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

/** Attach the JWT to every outgoing request. */
api.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/** Endpoints where a 401 is an expected answer, not a broken session. */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const url = error.config?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path));

    // 401 on a real request means the token expired or was tampered with.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }

    const body = error.response?.data;
    const fieldErrors: FieldErrors = {};

    for (const item of body?.errors ?? []) {
      fieldErrors[item.field] = item.message;
    }

    // Fall back to a status-based message if the server sent nothing useful
    // (for example when the request never reached it at all).
    const message =
      body?.message ??
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Is the backend running on port 5000?'
        : 'Something went wrong. Please try again.');

    return Promise.reject(new ApiError(error.response?.status ?? 0, message, fieldErrors));
  },
);

/**
 * Performs a request and returns the `data` part of the response envelope.
 * Throws `ApiError` for anything that is not a success.
 */
export async function request<T>(config: Parameters<typeof api.request>[0]): Promise<T> {
  const response = await api.request<ApiSuccess<T>>(config);
  return response.data.data;
}