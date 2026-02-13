import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { UnauthorizedError } from '../utils/errors';
import { container } from '../container';

const sessionService = container.getServices().session;

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(cookie())
  .derive(async ({ cookie: { sessionToken } }) => {
    const token = sessionToken?.value;
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const session = await sessionService.validateSession(token);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    return {
      user: session.user,
      userId: session.userId,
    };
  });
