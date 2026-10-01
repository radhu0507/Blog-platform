import bcrypt from 'bcryptjs';
import { ApiError } from '../lib/ApiError';
import { signToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import type { SafeUser } from '../types';

const SALT_ROUNDS = 10;

/**
 * The only user fields we ever expose. `password` is deliberately absent so it
 * cannot leak through a forgotten `select` or a spread somewhere.
 */
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export interface AuthResult {
  user: SafeUser;
  token: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function issueToken(user: { id: string; email: string }): string {
  return signToken({ sub: user.id, email: user.email });
}

/** Creates a user with a hashed password and returns a signed-in session. */
export async function register({ name, email, password }: RegisterInput): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw ApiError.badRequest('That email is already registered.', [
      { field: 'email', message: 'This email is already registered.' },
    ]);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: passwordHash },
    select: safeUserSelect,
  });

  return { user, token: issueToken(user) };
}

/** Verifies credentials and returns a signed-in session. */
export async function login({ email, password }: LoginInput): Promise<AuthResult> {
  const record = await prisma.user.findUnique({ where: { email } });

  // Same message for "no such user" and "wrong password" so the response cannot
  // be used to discover which emails are registered.
  const invalid = ApiError.unauthorized('Incorrect email or password.');

  if (!record) {
    throw invalid;
  }

  const passwordMatches = await bcrypt.compare(password, record.password);

  if (!passwordMatches) {
    throw invalid;
  }

  const { password: _password, updatedAt: _updatedAt, ...user } = record;

  return { user, token: issueToken(user) };
}

/** Used by `GET /api/auth/me` to re-hydrate the client after a page reload. */
export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw ApiError.unauthorized('Your account no longer exists.');
  }

  return user;
}