import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './shared/config/env.js';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware.js';
import { successResponse } from './shared/utils/response.util.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  }

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json(
      successResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
  });

  // API routes
  app.use('/api/auth', authRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
};

