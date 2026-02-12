import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { healthRouter, authRouter } from './routes';
import { errorHandler, responseEnvelope } from './middleware';
import { runMigrations } from '@justadrop/db';
import { logger } from './utils/logger';

const isProduction = process.env.NODE_ENV === 'production';
const shouldRunMigrations = process.env.RUN_MIGRATIONS !== 'false';

// Track server state for graceful shutdown
let server: Elysia | null = null;
let isShuttingDown = false;

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn({ signal }, 'Shutdown already in progress, forcing exit');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Starting graceful shutdown');

  try {
    // Stop accepting new connections
    if (server?.server) {
      logger.info('Closing server...');
      await new Promise<void>((resolve) => {
        server!.server?.close(() => {
          logger.info('Server closed');
          resolve();
        });
      });
    }

    // Give ongoing requests time to complete (15 seconds max)
    logger.info('Waiting for ongoing requests to complete...');
    await new Promise((resolve) => setTimeout(resolve, 15000));

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
});

// Run migrations before starting the server
async function startServer() {
  // Run migrations only if enabled (default: true, set RUN_MIGRATIONS=false to disable)
  if (shouldRunMigrations) {
    try {
      logger.info('Running database migrations...');
      await runMigrations();
      logger.info('Migrations completed successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to run migrations');
      // In production, exit if migrations fail
      if (isProduction) {
        logger.error('Exiting due to migration failure in production');
        process.exit(1);
      } else {
        logger.warn({ error }, 'Continuing in development mode despite migration failure');
      }
    }
  } else {
    logger.info('Migrations skipped (RUN_MIGRATIONS=false)');
  }

  const app = new Elysia()
    .use(cors())
    .use(errorHandler)
    .use(responseEnvelope);

  // Only enable Swagger in non-production environments
  if (!isProduction) {
    app.use(
      swagger({
        documentation: {
          info: {
            title: 'Just a Drop API',
            version: '1.0.0',
            description: 'API for connecting volunteers with organizations',
          },
          tags: [
            { name: 'health', description: 'Health check endpoints' },
            { name: 'auth', description: 'Authentication endpoints' },
          ],
        },
      })
    );
  }

  app.get('/', () => ({ message: 'Just a Drop API' }))
    .use(healthRouter)
    .use(authRouter)
    .listen(3001);

  server = app;

  logger.info(
    {
      hostname: app.server?.hostname,
      port: app.server?.port,
      environment: isProduction ? 'production' : 'development',
    },
    'API server started'
  );

  if (!isProduction) {
    logger.info(
      { url: `http://${app.server?.hostname}:${app.server?.port}/swagger` },
      'OpenAPI documentation available'
    );
  }
}

startServer().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
