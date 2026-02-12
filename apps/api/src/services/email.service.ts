import { Resend } from 'resend';
import { logger } from '../utils/logger';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@justadrop.xyz';
const resendFromName = process.env.RESEND_FROM_NAME || 'Just a Drop';

let resendClient: Resend | null = null;

if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
} else {
  logger.warn('RESEND_API_KEY not set, email service will not work');
}

export class EmailService {
  async sendOtpEmail(to: string, code: string): Promise<void> {
    if (!resendClient) {
      logger.warn('Resend client not initialized, skipping email send');
      return;
    }

    try {
      await resendClient.emails.send({
        from: `${resendFromName} <${resendFromEmail}>`,
        to,
        subject: 'Your login code for Just a Drop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your login code</h2>
            <p>Use this code to sign in to Just a Drop:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
        text: `Your login code for Just a Drop: ${code}\n\nThis code will expire in 10 minutes.`,
      });

      logger.info({ to }, 'OTP email sent successfully');
    } catch (error) {
      logger.error({ error, to }, 'Failed to send OTP email');
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, name?: string): Promise<void> {
    if (!resendClient) {
      logger.warn('Resend client not initialized, skipping email send');
      return;
    }

    try {
      await resendClient.emails.send({
        from: `${resendFromName} <${resendFromEmail}>`,
        to,
        subject: 'Welcome to Just a Drop!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome${name ? `, ${name}` : ''}!</h2>
            <p>Thank you for joining Just a Drop. We're excited to have you on board.</p>
            <p>Start exploring volunteer opportunities and make a difference in your community.</p>
          </div>
        `,
        text: `Welcome${name ? `, ${name}` : ''}!\n\nThank you for joining Just a Drop.`,
      });

      logger.info({ to }, 'Welcome email sent successfully');
    } catch (error) {
      logger.error({ error, to }, 'Failed to send welcome email');
    }
  }
}
