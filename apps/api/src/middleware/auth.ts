import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';

export interface AuthUser {
  id: string;
  email: string;
  type: 'admin' | 'volunteer' | 'organization';
}

export const jwtConfig = jwt({
  name: 'jwt',
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  exp: '7d',
});

/**
 * Authentication middleware that verifies JWT token from Authorization header
 */
export const authMiddleware = new Elysia()
  .use(jwtConfig)
  .derive(async ({ headers, jwt }) => {
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        userId: null,
        userType: null,
      };
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await jwt.verify(token);
      
      if (!payload) {
        return {
          user: null,
          userId: null,
          userType: null,
        };
      }

      return {
        user: payload as AuthUser,
        userId: payload.id as string,
        userType: payload.type as 'admin' | 'volunteer' | 'organization',
      };
    } catch (error) {
      return {
        user: null,
        userId: null,
        userType: null,
      };
    }
  });

/**
 * Guard that requires authentication
 */
export const requireAuth = new Elysia()
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Authentication required');
    }
  });

/**
 * Guard that requires admin role
 */
export const requireAdmin = new Elysia()
  .use(authMiddleware)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Authentication required');
    }
    if (user.type !== 'admin') {
      set.status = 403;
      throw new Error('Admin access required');
    }
  });
