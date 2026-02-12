import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

export const authRouter = new Elysia({ prefix: '/auth', tags: ['auth'] })
  .use(cookie())
  .post(
    '/otp/send',
    async ({ body, setCookie }) => {
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
    async ({ body, setCookie }) => {
      const result = await authController.verifyOtp(body);
      
      setCookie('sessionToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      return {
        user: result.user,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
    }
  )
  .post('/logout', async ({ cookie: { sessionToken }, setCookie }) => {
    await authController.logout(sessionToken);
    
    setCookie('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return { message: 'Logged out successfully' };
  })
  .get('/me', async ({ cookie: { sessionToken } }) => {
    return await authController.getCurrentUser(sessionToken);
  });
