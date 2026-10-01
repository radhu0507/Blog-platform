import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, sendSuccess } from '../lib/http';
import { getAuthUser } from '../middleware/auth';
import * as authService from '../services/authService';

/**
 * Registration rules.
 *
 * `confirmPassword` is only needed here - it never leaves the request body
 * because the service only ever reads name / email / password.
 *
 * bcrypt ignores everything past 72 bytes, so anything longer is rejected up
 * front instead of being silently truncated.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(60, 'Name must be at most 60 characters.'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email('Please enter a valid email address.')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must be at most 72 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Please enter a valid email address.')),
  password: z.string().min(1, 'Password is required.'),
});

/** POST /api/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;

  const result = await authService.register({ name, email, password });

  return sendSuccess(res, 201, 'Your account has been created.', result);
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const result = await authService.login({ email, password });

  return sendSuccess(res, 200, 'Signed in successfully.', result);
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);

  const user = await authService.getUserById(currentUser.id);

  return sendSuccess(res, 200, 'Your profile.', { user });
});