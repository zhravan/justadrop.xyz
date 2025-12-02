import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthController } from '../controllers/auth.controller';
import { log } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

const authController = new AuthController();

/**
 * Auth routes - Public endpoints (no authentication required)
 */
export const authRouter = new Elysia({ prefix: '/auth', tags: ['auth'] })
  .use(jwt({ name: 'jwt', secret: JWT_SECRET, exp: '15m' }))
  .use(jwt({ name: 'refreshJwt', secret: JWT_REFRESH_SECRET, exp: '30d' }))

  // Volunteer Registration (Public)
  .post(
    '/volunteer/register',
    async ({ body }) => {
      return await authController.registerVolunteer(body);
    },
    {
      body: t.Object({
        fullName: t.String({ minLength: 2 }),
        email: t.String(),
        password: t.String({ minLength: 8 }),
        phone: t.String({ minLength: 10 }),
        city: t.String({ minLength: 2 }),
        state: t.String({ minLength: 2 }),
        pincode: t.String({ minLength: 6 }),
        interests: t.Array(t.String(), { minItems: 1 }),
        skills: t.Optional(t.String()),
        availability: t.String({ minLength: 1 }),
        bio: t.Optional(t.String()),
        experience: t.Optional(t.String()),
        motivation: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Register as volunteer',
        description: 'Create a new volunteer account (requires email verification)',
      },
    }
  )

  // Volunteer Login (Public)
  .post(
    '/volunteer/login',
    async ({ body, jwt, refreshJwt }) => {
      return await authController.loginVolunteer(body, jwt, refreshJwt);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        summary: 'Volunteer login',
        description: 'Login as a volunteer',
      },
    }
  )

  // Organization Registration (Public)
  .post(
    '/organization/register',
    async ({ body }) => {
      return await authController.registerOrganization(body);
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String(),
        password: t.String({ minLength: 8 }),
        description: t.String({ minLength: 10, maxLength: 500 }),
        organizationType: t.Union([
          t.Literal('ngo'),
          t.Literal('trust'),
          t.Literal('society'),
          t.Literal('non_profit_company'),
          t.Literal('section_8_company'),
          t.Literal('other'),
        ]),
        yearEstablished: t.String({ pattern: '^(19|20)\\d{2}$' }),
        registrationNumber: t.String({ minLength: 5 }),
        organizationSize: t.Union([
          t.Literal('micro'),
          t.Literal('small'),
          t.Literal('medium'),
          t.Literal('large'),
        ]),
        registrationCertificateUrl: t.String(),
        panUrl: t.Optional(t.String()),
        certificate80gUrl: t.Optional(t.String()),
        certificate12aUrl: t.Optional(t.String()),
        addressProofUrl: t.Optional(t.String()),
        csrApprovalCertificateUrl: t.Optional(t.String()),
        fcraRegistrationUrl: t.Optional(t.String()),
        city: t.String({ minLength: 2 }),
        state: t.String({ minLength: 2 }),
        country: t.Optional(t.String()),
        causes: t.Array(t.String(), { minItems: 1 }),
        website: t.Optional(t.String()),
        socialLinks: t.Optional(
          t.Object({
            facebook: t.Optional(t.String()),
            twitter: t.Optional(t.String()),
            instagram: t.Optional(t.String()),
            linkedin: t.Optional(t.String()),
          })
        ),
        preferredVolunteerType: t.Array(t.String(), { minItems: 1 }),
        csrEligible: t.Boolean(),
        fcraRegistered: t.Boolean(),
        ageRestrictions: t.Optional(t.String()),
        genderRestrictions: t.Optional(t.String()),
        requiredSkills: t.Optional(t.Array(t.String())),
        contactName: t.String({ minLength: 2 }),
        contactEmail: t.String(),
        contactPhone: t.String({ minLength: 10 }),
        contactDesignation: t.String({ minLength: 2 }),
      }),
      detail: {
        summary: 'Register as organization',
        description: 'Create a new organization account (requires email verification and admin approval)',
      },
    }
  )

  // Organization Login (Public)
  .post(
    '/organization/login',
    async ({ body, jwt, refreshJwt }) => {
      return await authController.loginOrganization(body, jwt, refreshJwt);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        summary: 'Organization login',
        description: 'Login as an organization',
      },
    }
  )

  // Admin Login (Public)
  .post(
    '/admin/login',
    async ({ body, jwt, refreshJwt }) => {
      return await authController.loginAdmin(body, jwt, refreshJwt);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        summary: 'Admin login',
        description: 'Login as an administrator',
      },
    }
  )

  // Email Verification (Public)
  .get(
    '/verify-email/:token',
    async ({ params }) => {
      return await authController.verifyEmail(params.token);
    },
    {
      params: t.Object({
        token: t.String(),
      }),
      detail: {
        summary: 'Verify email address',
        description: 'Verify volunteer or organization email using the token sent via email',
      },
    }
  )

  // Resend Verification Email (Public)
  .post(
    '/resend-verification',
    async ({ body }) => {
      return await authController.resendVerification(body);
    },
    {
      body: t.Object({
        email: t.String(),
      }),
      detail: {
        summary: 'Resend verification email',
        description: 'Resend email verification link to volunteer or organization',
      },
    }
  )

  // Refresh Token (Public)
  .post(
    '/refresh',
    async ({ body, jwt, refreshJwt }) => {
      return await authController.refreshToken(body, jwt, refreshJwt);
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
      detail: {
        summary: 'Refresh access token',
        description: 'Get a new access token using a valid refresh token',
      },
    }
  )

  // Logout (Public)
  .post(
    '/logout',
    async () => {
      return await authController.logout();
    },
    {
      detail: {
        summary: 'Logout',
        description: 'Logout user (stateless - frontend clears tokens)',
      },
    }
  );
