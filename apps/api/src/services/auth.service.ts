import { db, users } from '@justadrop/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

const otpService = new OtpService();
const sessionService = new SessionService();
const emailService = new EmailService();

export class AuthService {
  async sendOtp(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    await otpService.generateAndSendOtp(normalizedEmail);
  }

  async verifyOtpAndLogin(email: string, code: string): Promise<{ token: string; user: any }> {
    const normalizedEmail = email.toLowerCase().trim();

    const isValid = await otpService.verifyOtp(normalizedEmail, code);
    if (!isValid) {
      throw new Error('Invalid or expired OTP code');
    }

    let user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      const userId = createId();
      await db.insert(users).values({
        id: userId,
        email: normalizedEmail,
        emailVerified: true,
      });

      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      await emailService.sendWelcomeEmail(normalizedEmail);
      logger.info({ email: normalizedEmail }, 'New user created');
    } else if (!user.emailVerified) {
      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, user.id));
    }

    if (user.isBanned || user.deletedAt) {
      throw new Error('Account is banned or deleted');
    }

    const token = await sessionService.createSession(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }

  async logout(token: string): Promise<void> {
    await sessionService.deleteSession(token);
  }

  async getCurrentUser(token: string): Promise<any> {
    const session = await sessionService.validateSession(token);
    if (!session) {
      return null;
    }
    return session.user;
  }
}
