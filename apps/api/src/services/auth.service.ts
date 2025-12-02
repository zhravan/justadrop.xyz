import { log } from '../utils/logger';
import { VolunteerRepository, CreateVolunteerData } from '../repositories/volunteer.repository';
import { OrganizationRepository, CreateOrganizationData } from '../repositories/organization.repository';
import { AdminRepository } from '../repositories/admin.repository';
import { VerificationTokenRepository } from '../repositories/verification-token.repository';
import { sendEmailVerification } from '../utils/email';
import { AuthErrors } from '../utils/auth-errors';

export class AuthService {
  private volunteerRepo: VolunteerRepository;
  private organizationRepo: OrganizationRepository;
  private adminRepo: AdminRepository;
  private tokenRepo: VerificationTokenRepository;

  constructor() {
    this.volunteerRepo = new VolunteerRepository();
    this.organizationRepo = new OrganizationRepository();
    this.adminRepo = new AdminRepository();
    this.tokenRepo = new VerificationTokenRepository();
  }

  /**
   * Register a new volunteer
   */
  async registerVolunteer(data: Omit<CreateVolunteerData, 'password_hash'> & { password: string }) {
    log.info('Registering volunteer', { email: data.email });

    // Check if email already exists
    const existing = await this.volunteerRepo.findByEmail(data.email);
    if (existing) {
      throw AuthErrors.EMAIL_ALREADY_REGISTERED;
    }

    // Hash password
    const password_hash = await Bun.password.hash(data.password);

    // Create volunteer
    const volunteer = await this.volunteerRepo.create({
      ...data,
      password_hash,
    });

    // Generate verification token
    const token = this.tokenRepo.generateToken();
    const expiresAt = this.tokenRepo.getExpirationDate(24);

    // Save verification token
    await this.tokenRepo.create({
      email: data.email,
      token,
      type: 'email_verification',
      expiresAt,
    });

    // Send verification email
    log.info('Sending verification email', { email: data.email });
    await sendEmailVerification(
      data.email,
      data.name,
      token,
      'volunteer'
    );

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      email: data.email,
    };
  }

  /**
   * Login volunteer
   */
  async loginVolunteer(email: string, password: string) {
    log.info('Volunteer login attempt', { email });

    const volunteer = await this.volunteerRepo.findByEmail(email);
    if (!volunteer) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Verify password
    const isValid = await Bun.password.verify(password, volunteer.password_hash);
    if (!isValid) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Check if email is verified
    if (!volunteer.email_verified) {
      throw AuthErrors.EMAIL_NOT_VERIFIED;
    }

    // Return user data (without password)
    const { password_hash, ...userData } = volunteer;
    return userData;
  }

  /**
   * Register a new organization
   */
  async registerOrganization(data: Omit<CreateOrganizationData, 'password_hash'> & { password: string }) {
    log.info('Registering organization', { email: data.email });

    // Check if email already exists
    const existing = await this.organizationRepo.findByEmail(data.email);
    if (existing) {
      throw AuthErrors.EMAIL_ALREADY_REGISTERED;
    }

    // Hash password
    const password_hash = await Bun.password.hash(data.password);

    // Parse social links if provided
    const socialLinksJson = data.social_links ? JSON.stringify(data.social_links) : null;

    // Create organization
    const organization = await this.organizationRepo.create({
      ...data,
      password_hash,
      social_links: socialLinksJson,
    });

    // Generate verification token
    const token = this.tokenRepo.generateToken();
    const expiresAt = this.tokenRepo.getExpirationDate(24);

    // Save verification token
    await this.tokenRepo.create({
      email: data.email,
      token,
      type: 'email_verification',
      expiresAt,
    });

    // Send verification email
    log.info('Sending verification email', { email: data.email });
    await sendEmailVerification(
      data.email,
      data.name,
      token,
      'organization'
    );

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account. Your organization will be reviewed by our admin team.',
      email: data.email,
      organization: { ...organization, password_hash: undefined },
    };
  }

  /**
   * Login organization
   */
  async loginOrganization(email: string, password: string) {
    log.info('Organization login attempt', { email });

    const organization = await this.organizationRepo.findByEmail(email);
    if (!organization) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Verify password
    const isValid = await Bun.password.verify(password, organization.password_hash);
    if (!isValid) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Check if email is verified
    if (!organization.email_verified) {
      throw AuthErrors.EMAIL_NOT_VERIFIED;
    }

    // Check if blacklisted
    if (organization.approval_status === 'blacklisted') {
      throw AuthErrors.ACCOUNT_SUSPENDED;
    }

    // Return user data (without password)
    const { password_hash, ...userData } = organization;
    return {
      ...userData,
      approval_status: organization.approval_status,
    };
  }

  /**
   * Login admin
   */
  async loginAdmin(email: string, password: string) {
    log.info('Admin login attempt', { email });

    const admin = await this.adminRepo.findByEmail(email);
    if (!admin) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Verify password
    const isValid = await Bun.password.verify(password, admin.password_hash);
    if (!isValid) {
      throw AuthErrors.INVALID_CREDENTIALS;
    }

    // Return user data (without password)
    const { password_hash, ...userData } = admin;
    return userData;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    log.info('Email verification attempt', { token: token.substring(0, 10) + '...' });

    // Find verification token
    const tokenRecord = await this.tokenRepo.findByToken(token);
    if (!tokenRecord) {
      throw AuthErrors.INVALID_VERIFICATION_TOKEN;
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      throw AuthErrors.EXPIRED_VERIFICATION_TOKEN;
    }

    // Check if it's an email verification token
    if (tokenRecord.type !== 'email_verification') {
      throw AuthErrors.INVALID_VERIFICATION_TOKEN;
    }

    // Check for volunteer
    const volunteer = await this.volunteerRepo.findByEmail(tokenRecord.email);
    if (volunteer) {
      if (volunteer.email_verified) {
        await this.tokenRepo.deleteByToken(token);
        return {
          success: true,
          message: 'Email already verified! You can now log in.',
        };
      }

      await this.volunteerRepo.updateEmailVerified(tokenRecord.email, true);
      await this.tokenRepo.deleteByToken(token);

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.',
      };
    }

    // Check for organization
    const organization = await this.organizationRepo.findByEmail(tokenRecord.email);
    if (organization) {
      if (organization.email_verified) {
        await this.tokenRepo.deleteByToken(token);
        return {
          success: true,
          message: 'Email already verified! Your organization registration is pending admin approval.',
        };
      }

      await this.organizationRepo.updateEmailVerified(tokenRecord.email, true);
      await this.tokenRepo.deleteByToken(token);

      return {
        success: true,
        message: 'Email verified successfully! Your organization registration is pending admin approval. You will be notified once approved.',
      };
    }

    throw AuthErrors.USER_NOT_FOUND;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    log.info('Resending verification email', { email });

    // Try volunteer first
    const volunteer = await this.volunteerRepo.findByEmail(email);
    if (volunteer) {
      if (volunteer.email_verified) {
        throw AuthErrors.EMAIL_ALREADY_VERIFIED;
      }

      // Delete existing tokens
      await this.tokenRepo.deleteByEmail(email, 'email_verification');

      // Generate new token
      const token = this.tokenRepo.generateToken();
      const expiresAt = this.tokenRepo.getExpirationDate(24);

      await this.tokenRepo.create({
        email,
        token,
        type: 'email_verification',
        expiresAt,
      });

      await sendEmailVerification(email, volunteer.name, token, 'volunteer');

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        userType: 'volunteer',
      };
    }

    // Try organization
    const organization = await this.organizationRepo.findByEmail(email);
    if (organization) {
      if (organization.email_verified) {
        throw AuthErrors.EMAIL_ALREADY_VERIFIED;
      }

      // Delete existing tokens
      await this.tokenRepo.deleteByEmail(email, 'email_verification');

      // Generate new token
      const token = this.tokenRepo.generateToken();
      const expiresAt = this.tokenRepo.getExpirationDate(24);

      await this.tokenRepo.create({
        email,
        token,
        type: 'email_verification',
        expiresAt,
      });

      await sendEmailVerification(email, organization.name, token, 'organization');

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        userType: 'organization',
      };
    }

    throw AuthErrors.EMAIL_NOT_FOUND;
  }
}

