import { db, otpTokens } from '@justadrop/db';
import { eq, and, gt } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

const emailService = new EmailService();

export class OtpService {
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendOtp(email: string): Promise<string> {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(otpTokens).values({
      id: createId(),
      email,
      code,
      expiresAt,
      used: false,
    });

    await emailService.sendOtpEmail(email, code);

    logger.info({ email }, 'OTP generated and sent');
    return code;
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const token = await db.query.otpTokens.findFirst({
      where: and(
        eq(otpTokens.email, email),
        eq(otpTokens.code, code),
        eq(otpTokens.used, false),
        gt(otpTokens.expiresAt, new Date())
      ),
    });

    if (!token) {
      return false;
    }

    await db
      .update(otpTokens)
      .set({ used: true })
      .where(eq(otpTokens.id, token.id));

    logger.info({ email }, 'OTP verified successfully');
    return true;
  }
}
