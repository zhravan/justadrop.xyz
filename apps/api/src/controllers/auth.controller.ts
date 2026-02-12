import { AuthService } from '../services/auth.service';
import { ValidationError, UnauthorizedError } from '../utils/errors';

const authService = new AuthService();

export class AuthController {
  async sendOtp(body: { email: string }) {
    if (!body.email || !body.email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }

    await authService.sendOtp(body.email);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(body: { email: string; code: string }) {
    if (!body.email || !body.email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }

    if (!body.code || body.code.length !== 6) {
      throw new ValidationError('Valid 6-digit OTP code is required');
    }

    const result = await authService.verifyOtpAndLogin(body.email, body.code);
    return {
      token: result.token,
      user: result.user,
    };
  }

  async logout(token: string | undefined) {
    if (token) {
      await authService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedError('No session found');
    }

    const user = await authService.getCurrentUser(token);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    return { user };
  }
}
