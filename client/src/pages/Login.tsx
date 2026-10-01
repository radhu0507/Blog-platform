import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, isApiError } from '../types';
import type { FieldErrors } from '../types';

interface LocationState {
  /** Page the user was trying to reach before being sent to login. */
  from?: string;
}

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as LocationState | null)?.from ?? '/';

  // Someone who is already signed in has no use for this page.
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not sign you in.'));
      if (isApiError(error)) setFieldErrors(error.fieldErrors);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-page">
      <div className="mx-auto max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to write posts and join the discussion.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              error={fieldErrors.email}
              disabled={isSubmitting}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              autoComplete="current-password"
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white/60 px-4 py-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Seeded demo accounts</p>
          <p className="mt-1">
            alice@example.com &middot; bob@example.com &middot; carol@example.com
          </p>
        </div>
      </div>
    </div>
  );
}