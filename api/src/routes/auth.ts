import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';

const authController = container.getControllers().auth;

export const authRouter = new Elysia({ prefix: '/auth', tags: ['auth'] })
  .use(cookie())
  .post(
    '/otp/send',
    async ({ body }) => {
      const result = await authController.sendOtp(body);
      return result;
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  )
  .post(
    '/otp/verify',
    async ({ body, cookie }) => {
      const result = await authController.verifyOtp(body);
      
      // Use reactive cookie system - assign value directly
      const sessionToken = cookie.sessionToken;
      sessionToken.value = result.token;
      sessionToken.httpOnly = true;
      sessionToken.secure = process.env.NODE_ENV === 'production';
      sessionToken.sameSite = 'lax';
      sessionToken.maxAge = 30 * 24 * 60 * 60; // 30 days
      sessionToken.path = '/';
      
      return {
        user: result.user,
        isNewUser: result.isNewUser,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
    }
  )
  .post('/logout', async ({ cookie }) => {
    const sessionToken = cookie.sessionToken;
    const token = sessionToken?.value;
    
    if (token) {
      await authController.logout(token);
    }
    
    // Clear cookie by removing it
    if (sessionToken) {
      sessionToken.remove();
    }
    
    return { message: 'Logged out successfully' };
  })
  .get('/me', async ({ cookie }) => {
    const sessionToken = cookie.sessionToken;
    const token = sessionToken?.value;
    return await authController.getCurrentUser(token);
  });
