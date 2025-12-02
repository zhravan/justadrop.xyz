import { Elysia } from 'elysia';
import { AuthService } from '../services/auth.service';
import { log } from '../utils/logger';
import { AuthError, AuthErrors } from '../utils/auth-errors';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register volunteer
   */
  async registerVolunteer(body: any) {
    try {
      const result = await this.authService.registerVolunteer(body);
      return result;
    } catch (error) {
      log.error('Volunteer registration failed', error);
      throw error;
    }
  }

  /**
   * Login volunteer
   */
  async loginVolunteer(body: { email: string; password: string }, jwt: any, refreshJwt: any) {
    try {
      const user = await this.authService.loginVolunteer(body.email, body.password);
      
      // Generate access token (short-lived)
      const accessToken = await jwt.sign({
        id: user.id,
        email: user.email,
        type: 'volunteer',
      });

      // Generate refresh token (long-lived) - stateless JWT
      const refreshToken = await refreshJwt.sign({
        id: user.id,
        email: user.email,
        type: 'volunteer',
      });

      return {
        accessToken,
        refreshToken,
        user: { ...user, password_hash: undefined },
      };
    } catch (error) {
      log.error('Volunteer login failed', error);
      throw error;
    }
  }

  /**
   * Register organization
   */
  async registerOrganization(body: any) {
    try {
      const result = await this.authService.registerOrganization(body);
      return result;
    } catch (error) {
      log.error('Organization registration failed', error);
      throw error;
    }
  }

  /**
   * Login organization
   */
  async loginOrganization(body: { email: string; password: string }, jwt: any, refreshJwt: any) {
    try {
      const user = await this.authService.loginOrganization(body.email, body.password);
      
      // Generate access token (short-lived)
      const accessToken = await jwt.sign({
        id: user.id,
        email: user.email,
        type: 'organization',
      });

      // Generate refresh token (long-lived) - stateless JWT
      const refreshToken = await refreshJwt.sign({
        id: user.id,
        email: user.email,
        type: 'organization',
      });

      return {
        accessToken,
        refreshToken,
        user: { ...user, password_hash: undefined },
        approval_status: user.approval_status,
      };
    } catch (error) {
      log.error('Organization login failed', error);
      throw error;
    }
  }

  /**
   * Login admin
   */
  async loginAdmin(body: { email: string; password: string }, jwt: any, refreshJwt: any) {
    try {
      const user = await this.authService.loginAdmin(body.email, body.password);
      
      // Generate access token (short-lived)
      const accessToken = await jwt.sign({
        id: user.id,
        email: user.email,
        type: 'admin',
      });

      // Generate refresh token (long-lived) - stateless JWT
      const refreshToken = await refreshJwt.sign({
        id: user.id,
        email: user.email,
        type: 'admin',
      });

      return {
        accessToken,
        refreshToken,
        user: { ...user, password_hash: undefined },
      };
    } catch (error) {
      log.error('Admin login failed', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token (stateless)
   */
  async refreshToken(body: { refreshToken: string }, jwt: any, refreshJwt: any) {
    try {
      // Verify refresh token JWT (stateless - no DB lookup)
      const refreshPayload = await refreshJwt.verify(body.refreshToken);
      if (!refreshPayload || !refreshPayload.id || !refreshPayload.type) {
        throw AuthErrors.INVALID_REFRESH_TOKEN;
      }

      // Generate new access token
      const accessToken = await jwt.sign({
        id: refreshPayload.id,
        email: refreshPayload.email,
        type: refreshPayload.type,
      });

      return {
        accessToken,
      };
    } catch (error) {
      log.error('Token refresh failed', error);
      // If it's already an AuthError, re-throw it
      if (error instanceof AuthError) {
        throw error;
      }
      // Otherwise, it's likely a JWT verification error (expired/invalid)
      throw AuthErrors.INVALID_REFRESH_TOKEN;
    }
  }

  /**
   * Logout - stateless (just returns success, frontend clears tokens)
   */
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    try {
      const result = await this.authService.verifyEmail(token);
      return result;
    } catch (error) {
      log.error('Email verification failed', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(body: { email: string }) {
    try {
      const result = await this.authService.resendVerificationEmail(body.email);
      return result;
    } catch (error) {
      log.error('Resend verification failed', error);
      throw error;
    }
  }
}

