import { app } from './app';
import { env } from './lib/env';
import { prisma } from './lib/prisma';

async function main() {
  // Fail fast with a clear message if the database is unreachable.
  try {
    await prisma.$connect();
    console.log('[db] Connected to PostgreSQL.');
  } catch (error) {
    console.error('[db] Could not connect to PostgreSQL.');
    console.error(error);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[api] BlogSpace API listening on http://localhost:${env.PORT}`);
    console.log(`[api] Allowing requests from ${env.CLIENT_ORIGIN}`);
  });

  // Finish in-flight requests, then close the database pool before exiting.
  const shutdown = (signal: string) => {
    console.log(`\n[api] ${signal} received, shutting down.`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();