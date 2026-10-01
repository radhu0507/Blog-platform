import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, isApiError } from '../types';
import type { FieldErrors } from '../types';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // The server is the single source of truth for validation rules, so the
      // raw values (including confirmPassword) go straight to it.
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not create your account.'));
      if (isApiError(error)) setFieldErrors(error.fieldErrors);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-page">
      <div className="mx-auto max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">
            It takes a moment, and then you can start writing.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {formError ? <Alert variant="error">{formError}</Alert> : null}

            <TextField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Jane Doe"
              autoComplete="name"
              error={fieldErrors.name}
              disabled={isSubmitting}
            />

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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={fieldErrors.password}
              disabled={isSubmitting}
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
              disabled={isSubmitting}
            />

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}