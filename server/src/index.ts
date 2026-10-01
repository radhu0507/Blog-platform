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
    console.log(`[api] Allowing requests from ${env.CORS_ORIGIN}`);
    console.log(`[api] mode: ${env.NODE_ENV}`);
  });

  // Finish in-flight requests, then close the database pool before exiting.
  const shutdown = (signal: string) => {
    console.log(`\n[api] ${signal} received, shutting down.`);
    // PaaS hosts kill the process after a grace period, so make sure a hung
    // connection can never leave this container alive until it is force-killed.
    const forceExit = setTimeout(() => {
      console.warn('[api] Graceful shutdown timed out, forcing exit.');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      clearTimeout(forceExit);
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();