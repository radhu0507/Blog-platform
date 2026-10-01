import { PrismaClient } from '@prisma/client';

/**
 * A single PrismaClient for the whole app.
 *
 * `tsx watch` restarts the process on every file change. Without the global
 * cache below you would leak a new database connection pool on each restart
 * until Postgres refuses new connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}