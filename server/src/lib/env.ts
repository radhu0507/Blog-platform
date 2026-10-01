import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Always load the `.env` that sits next to this package, no matter the cwd.
// From `src/lib` (dev) or `dist/lib` (build) that resolves to `<server>/.env`.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
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

export const env = parsed.data;