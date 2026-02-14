import type { AuthUser } from '../types/auth.js';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { EmailService } from './email.service';
import { UserRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';
import { ValidationError, ForbiddenError } from '../utils/errors';

export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository
  ) {}

  async sendOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    await this.otpService.generateAndSendOtp(normalizedEmail);
  }

  async verifyOtpAndLogin(email: string, code: string): Promise<{ token: string; user: AuthUser; isNewUser: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    const isValid = await this.otpService.verifyOtp(normalizedEmail, code);
    if (!isValid) {
      throw new ValidationError('Invalid or expired OTP code');
    }

    let user = await this.userRepository.findByEmail(normalizedEmail);
    let isNewUser = false;

    if (!user) {
      user = await this.userRepository.create(normalizedEmail, true);
      await this.emailService.sendWelcomeEmail(normalizedEmail);
      logger.info({ email: normalizedEmail }, 'New user created');
      isNewUser = true;
    } else if (!user.emailVerified) {
      await this.userRepository.updateEmailVerified(user.id, true);
      user = await this.userRepository.findById(user.id);
      if (!user) {
        throw new Error('Failed to update user'); // Internal error, keep as Error
      }
    }

    if (user.isBanned || user.deletedAt) {
      throw new ForbiddenError('Account is banned or deleted');
    }

    const token = await this.sessionService.createSession(user.id);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      ...(user.volunteering && { volunteering: user.volunteering }),
      ...(user.phone != null && { phone: user.phone }),
      ...(user.gender != null && { gender: user.gender }),
    };
    return { token, user: authUser, isNewUser };
  }

  async logout(token: string): Promise<void> {
    await this.sessionService.deleteSession(token);
  }

  async getCurrentUser(token: string): Promise<AuthUser | null> {
    const session = await this.sessionService.validateSession(token);
    if (!session) {
      return null;
    }
    const u = session.user;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      emailVerified: u.emailVerified,
      ...(u.volunteering && { volunteering: u.volunteering }),
      ...(u.phone != null && { phone: u.phone }),
      ...(u.gender != null && { gender: u.gender }),
    };
  }
}
