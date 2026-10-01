import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Always load the `.env` that sits next to this package, no matter the cwd.
// From `src/lib` (dev) or `dist/lib` (build) that resolves to `<server>/.env`.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  // PaaS hosts (Render, Railway, Fly) inject PORT; the default is for local runs.
  PORT: z.coerce.number().int().positive().default(5000),
  // Origin allowed to call the API from a browser. Unset means same-origin only,
  // which is the normal case for the single-service deployment.
  CORS_ORIGIN: z.string().url().optional(),
  // Legacy name for CORS_ORIGIN, kept so existing local .env files keep working.
  CLIENT_ORIGIN: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error('\nInvalid environment variables:\n');
  console.error(details);
  console.error('\nCopy `server/.env.example` to `server/.env` and fill in the values.\n');
  process.exit(1);
}

// CORS_ORIGIN wins, then the legacy CLIENT_ORIGIN, then the Vite dev server.
const corsOrigin =
  parsed.data.CORS_ORIGIN ?? parsed.data.CLIENT_ORIGIN ?? 'http://localhost:5173';

export const env = {
  ...parsed.data,
  CORS_ORIGIN: corsOrigin,
  /** @deprecated alias of CORS_ORIGIN, kept for backwards compatibility. */
  CLIENT_ORIGIN: corsOrigin,
  /** Serves the built React app from Express and enables production behaviour. */
  isProduction: parsed.data.NODE_ENV === 'production',
};