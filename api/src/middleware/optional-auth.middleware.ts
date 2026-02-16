import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';

const sessionService = container.getServices().session;

export const optionalAuthMiddleware = new Elysia({ name: 'optional-auth' })
  .use(cookie())
  .derive(async ({ cookie: { sessionToken } }) => {
    const token = typeof sessionToken?.value === 'string' ? sessionToken.value : undefined;
    if (!token) {
      return { user: null as any, userId: null as string | null };
    }
    const session = await sessionService.validateSession(token);
    if (!session) {
      return { user: null as any, userId: null as string | null };
    }
    return {
      user: session.user,
      userId: session.userId,
    };
  });
