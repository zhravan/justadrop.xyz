import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import { log } from '../utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  type: 'admin' | 'volunteer' | 'organization';
}

export const jwtConfig = jwt({
  name: 'jwt',
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  exp: '15m', // Access tokens expire in 15 minutes
});

export const refreshJwtConfig = jwt({
  name: 'refreshJwt',
  secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  exp: '30d', // Refresh tokens expire in 30 days
});

/**
 * Authentication middleware that verifies JWT token from Authorization header
 * Adds user context to request but doesn't require authentication
 */
export const authMiddleware = new Elysia()
  .use(jwtConfig)
  .derive(async ({ headers, jwt }) => {
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null as AuthUser | null,
        userId: null as string | null,
        userType: null as 'admin' | 'volunteer' | 'organization' | null,
      };
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await jwt.verify(token) as any;
      
      if (!payload || !payload.id || !payload.type) {
        return {
          user: null as AuthUser | null,
          userId: null as string | null,
          userType: null as 'admin' | 'volunteer' | 'organization' | null,
        };
      }

      const user: AuthUser = {
        id: payload.id,
        email: payload.email || '',
        type: payload.type,
      };

      return {
        user,
        userId: payload.id as string,
        userType: payload.type as 'admin' | 'volunteer' | 'organization',
      };
    } catch (error) {
      log.debug('JWT verification failed', { error });
      return {
        user: null as AuthUser | null,
        userId: null as string | null,
        userType: null as 'admin' | 'volunteer' | 'organization' | null,
      };
    }
  });

/**
 * Guard that requires authentication
 * Use this for protected routes
 */
export const requireAuth = new Elysia()
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }: any) => {
    if (!user) {
      log.warn('Unauthenticated request attempt');
      set.status = 401;
      throw new Error('Authentication required');
    }
  });

/**
 * Guard that requires admin role
 * Use this for admin-only routes
 */
export const requireAdmin = new Elysia()
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }: any) => {
    if (!user) {
      log.warn('Unauthenticated request attempt');
      set.status = 401;
      throw new Error('Authentication required');
    }
    if (user.type !== 'admin') {
      log.warn('Non-admin access attempt', { userId: user.id, userType: user.type });
      set.status = 403;
      throw new Error('Admin access required');
    }
  });

/**
 * Guard that requires specific user type
 * Use this for role-specific routes
 */
export const requireUserType = (allowedTypes: ('admin' | 'volunteer' | 'organization')[]) => {
  return new Elysia()
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }: any) => {
      if (!user) {
        log.warn('Unauthenticated request attempt');
        set.status = 401;
        throw new Error('Authentication required');
      }
      if (!allowedTypes.includes(user.type)) {
        log.warn('Unauthorized user type access attempt', { 
          userId: user.id, 
          userType: user.type,
          allowedTypes 
        });
        set.status = 403;
        throw new Error(`Access restricted to: ${allowedTypes.join(', ')}`);
      }
    });
};
