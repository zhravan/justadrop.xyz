/**
 * Custom authentication error class with specific error types and status codes
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'AUTH_ERROR'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AuthErrors = {
  // Login errors
  INVALID_EMAIL: new AuthError('No account found with this email address', 401, 'INVALID_EMAIL'),
  INVALID_PASSWORD: new AuthError('Incorrect password', 401, 'INVALID_PASSWORD'),
  INVALID_CREDENTIALS: new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS'),
  EMAIL_NOT_VERIFIED: new AuthError('Please verify your email before logging in. Check your inbox for the verification link.', 403, 'EMAIL_NOT_VERIFIED'),
  ACCOUNT_SUSPENDED: new AuthError('Your account has been suspended. Please contact support for assistance.', 403, 'ACCOUNT_SUSPENDED'),
  
  // Registration errors
  EMAIL_ALREADY_REGISTERED: new AuthError('An account with this email already exists', 409, 'EMAIL_ALREADY_REGISTERED'),
  
  // Token errors
  INVALID_REFRESH_TOKEN: new AuthError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'),
  EXPIRED_REFRESH_TOKEN: new AuthError('Refresh token has expired. Please log in again.', 401, 'EXPIRED_REFRESH_TOKEN'),
  
  // Email verification errors
  INVALID_VERIFICATION_TOKEN: new AuthError('This verification link is invalid or has already been used. If you already verified your email, please try logging in.', 400, 'INVALID_VERIFICATION_TOKEN'),
  EXPIRED_VERIFICATION_TOKEN: new AuthError('Verification token has expired. Please request a new verification email.', 400, 'EXPIRED_VERIFICATION_TOKEN'),
  EMAIL_ALREADY_VERIFIED: new AuthError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED'),
  EMAIL_NOT_FOUND: new AuthError('No account found with this email address', 404, 'EMAIL_NOT_FOUND'),
  
  // User not found
  USER_NOT_FOUND: new AuthError('User not found', 404, 'USER_NOT_FOUND'),
};

