const nodemailer = require('nodemailer');

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@justadrop.xyz';
const FROM_NAME = process.env.FROM_NAME || 'Just a Drop';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  console.log('[sendEmail] Called with:');
  console.log('   To:', to);
  console.log('   Subject:', subject);
  console.log('   SMTP configured:', !!SMTP_USER && !!SMTP_PASS);
  console.log('   FROM_EMAIL:', FROM_EMAIL);

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[sendEmail] SMTP credentials not configured. Email not sent.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    console.log('[sendEmail] Sending email via SMTP...');
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log('[sendEmail] Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[sendEmail] Error sending email:', error);
    return { success: false, error };
  }
};

// Email Templates
export const sendWelcomeVolunteerEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to Just a Drop!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Just a Drop as a volunteer.</p>
      <p>You can now start browsing and applying for volunteer opportunities in your area.</p>
      <p>Start making a difference today!</p>
    `,
  });
};

export const sendOrganizationRegistrationEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: 'Organization Registration Received',
    html: `
      <h1>Thank you for registering, ${name}!</h1>
      <p>Your organization registration has been received and is currently pending approval.</p>
      <p>Our admin team will review your application and get back to you shortly.</p>
      <p>Once approved, you'll be able to post volunteer opportunities.</p>
    `,
  });
};

export const sendOrganizationApprovedEmail = async (
  email: string,
  name: string,
  notes?: string
) => {
  return sendEmail({
    to: email,
    subject: 'Organization Approved - Welcome to Just a Drop!',
    html: `
      <h1>Congratulations ${name}!</h1>
      <p>Your organization has been approved on Just a Drop.</p>
      <p>You can now start posting volunteer opportunities and connecting with volunteers.</p>
      ${notes ? `<p><strong>Admin notes:</strong> ${notes}</p>` : ''}
      <p>Thank you for joining our platform!</p>
    `,
  });
};

export const sendOrganizationRejectedEmail = async (
  email: string,
  name: string,
  notes: string
) => {
  return sendEmail({
    to: email,
    subject: 'Organization Registration Update',
    html: `
      <h1>Hello ${name},</h1>
      <p>Unfortunately, we are unable to approve your organization registration at this time.</p>
      <p><strong>Reason:</strong> ${notes}</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
  });
};

export const sendApplicationReceivedEmail = async (
  email: string,
  volunteerName: string,
  opportunityTitle: string
) => {
  return sendEmail({
    to: email,
    subject: 'Application Received',
    html: `
      <h1>Application Received!</h1>
      <p>Hi ${volunteerName},</p>
      <p>Your application for <strong>${opportunityTitle}</strong> has been received.</p>
      <p>The organization will review your application and get back to you soon.</p>
    `,
  });
};

export const sendApplicationStatusEmail = async (
  email: string,
  volunteerName: string,
  opportunityTitle: string,
  status: 'accepted' | 'rejected'
) => {
  const subject = status === 'accepted'
    ? 'Application Accepted!'
    : 'Application Update';

  const message = status === 'accepted'
    ? 'Congratulations! Your application has been accepted.'
    : 'Thank you for your interest. Unfortunately, your application was not selected at this time.';

  return sendEmail({
    to: email,
    subject,
    html: `
      <h1>Application Update</h1>
      <p>Hi ${volunteerName},</p>
      <p>Your application for <strong>${opportunityTitle}</strong> has been reviewed.</p>
      <p>${message}</p>
    `,
  });
};

export const sendEmailVerification = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  console.log('[sendEmailVerification] Preparing verification email');
  console.log('   Email:', email);
  console.log('   Name:', name);
  console.log('   Verification URL:', verificationUrl);

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Just a Drop',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Just a Drop!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering as a volunteer with Just a Drop!</p>
              <p>To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0ea5e9;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>Once verified, you can start browsing and applying for volunteer opportunities in your area.</p>
              <p>If you didn't create an account with Just a Drop, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Just a Drop - Making a difference, one drop at a time</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
};
