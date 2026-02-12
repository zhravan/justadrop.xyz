import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { UnauthorizedError } from '../utils/errors';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(cookie())
  .derive(async ({ cookie: { sessionToken } }) => {
    if (!sessionToken) {
      throw new UnauthorizedError('Authentication required');
    }

    const session = await sessionService.validateSession(sessionToken);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    return {
      user: session.user,
      userId: session.userId,
    };
  });
