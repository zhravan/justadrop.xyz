import { Elysia } from 'elysia';
import { log } from '../utils/logger';
import { AuthError } from '../utils/auth-errors';

/**
 * Global error handler middleware
 * Catches errors and formats them consistently
 */
export const errorHandler = new Elysia()
  .onError(({ error, code, set }) => {
    // Log the error
    log.error('Request error', error, { code });

    // Handle AuthError with specific status codes
    if (error instanceof AuthError) {
      set.status = error.statusCode;
      return {
        success: false,
        message: error.message,
        code: error.code,
      };
    }

    // Set appropriate status code
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        message: error.message || 'Validation error',
        errors: (error as any).validator?.Errors || undefined,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        message: error.message || 'Resource not found',
      };
    }

    // Default to 500 for unknown errors
    set.status = set.status || 500;
    return {
      success: false,
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  });

