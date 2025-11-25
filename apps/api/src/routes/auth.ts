import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { db, volunteers, organizations, admins, verificationTokens } from '@justadrop/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { sendEmailVerification } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authRouter = new Elysia({ prefix: '/auth', tags: ['auth'] })
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))

  // Volunteer Registration
  .post('/volunteer/register', async ({ body }) => {
    // Check if email already exists
    const existing = await db.select().from(volunteers).where(eq(volunteers.email, body.email));
    if (existing.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const password_hash = await Bun.password.hash(body.password);

    // Create volunteer with email_verified: false
    const newVolunteer = await db.insert(volunteers).values({
      name: body.fullName,
      email: body.email,
      password_hash,
      phone: body.phone,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      interests: body.interests,
      skills: body.skills || null,
      availability: body.availability,
      bio: body.bio || null,
      experience: body.experience || null,
      motivation: body.motivation || null,
      email_verified: false,
    }).returning();

    // Generate verification token
    const verificationToken = createId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save verification token
    await db.insert(verificationTokens).values({
      email: body.email,
      token: verificationToken,
      type: 'email_verification',
      expiresAt,
    });

    console.log(' [Registration] Sending verification email to:', body.email);
    console.log(' [Registration] Token:', verificationToken);

    // Send verification email
    const emailResult = await sendEmailVerification(body.email, body.fullName, verificationToken);

    console.log(' [Registration] Email send result:', emailResult);

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      email: body.email,
    };
  }, {
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
    }
  })

  // Volunteer Login
  .post('/volunteer/login', async ({ body, jwt }) => {
    const volunteer = await db.select().from(volunteers).where(eq(volunteers.email, body.email));
    if (volunteer.length === 0) {
      throw new Error('Invalid credentials');
    }

    const isValid = await Bun.password.verify(body.password, volunteer[0].password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!volunteer[0].email_verified) {
      throw new Error('Please verify your email before logging in');
    }

    const token = await jwt.sign({
      id: volunteer[0].id,
      type: 'volunteer'
    });

    return {
      token,
      user: { ...volunteer[0], password_hash: undefined }
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
    detail: {
      summary: 'Volunteer login',
      description: 'Login as a volunteer',
    }
  })

  // Email Verification
  .get('/verify-email/:token', async ({ params, set }) => {
    const { token } = params;

    // Find verification token
    const tokenRecord = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token));

    if (tokenRecord.length === 0) {
      set.status = 400;
      throw new Error('Invalid or expired verification token');
    }

    const record = tokenRecord[0];

    // Check if token is expired
    if (new Date() > record.expiresAt) {
      set.status = 400;
      throw new Error('Verification token has expired');
    }

    // Check if it's an email verification token
    if (record.type !== 'email_verification') {
      set.status = 400;
      throw new Error('Invalid token type');
    }

    // Update volunteer's email_verified status
    await db
      .update(volunteers)
      .set({ email_verified: true, updatedAt: new Date() })
      .where(eq(volunteers.email, record.email));

    // Delete the used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
    };
  }, {
    params: t.Object({
      token: t.String(),
    }),
    detail: {
      summary: 'Verify email address',
      description: 'Verify volunteer email using the token sent via email',
    }
  })

  // Resend Verification Email
  .post('/resend-verification', async ({ body }) => {
    // Find volunteer by email
    const volunteer = await db.select().from(volunteers).where(eq(volunteers.email, body.email));

    if (volunteer.length === 0) {
      throw new Error('Email not found');
    }

    // Check if already verified
    if (volunteer[0].email_verified) {
      throw new Error('Email is already verified');
    }

    // Delete any existing verification tokens for this email
    await db.delete(verificationTokens).where(eq(verificationTokens.email, body.email));

    // Generate new verification token
    const verificationToken = createId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save new verification token
    await db.insert(verificationTokens).values({
      email: body.email,
      token: verificationToken,
      type: 'email_verification',
      expiresAt,
    });

    // Send verification email
    await sendEmailVerification(body.email, volunteer[0].name, verificationToken);

    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    };
  }, {
    body: t.Object({
      email: t.String(),
    }),
    detail: {
      summary: 'Resend verification email',
      description: 'Resend email verification link to volunteer',
    }
  })

  // Organization Registration
  .post('/organization/register', async ({ body, jwt }) => {
    const existing = await db.select().from(organizations).where(eq(organizations.email, body.email));
    if (existing.length > 0) {
      throw new Error('Email already registered');
    }

    const password_hash = await Bun.password.hash(body.password);
    const newOrg = await db.insert(organizations).values({
      name: body.name,
      email: body.email,
      password_hash,
      description: body.description,
      website: body.website,
    }).returning();

    const token = await jwt.sign({
      id: newOrg[0].id,
      type: 'organization'
    });

    return {
      token,
      user: { ...newOrg[0], password_hash: undefined },
      message: 'Account created. Awaiting admin approval.'
    };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String({ minLength: 8 }),
      description: t.String(),
      website: t.Optional(t.String()),
    }),
    detail: {
      summary: 'Register as organization',
      description: 'Create a new organization account (requires admin approval)',
    }
  })

  // Organization Login
  .post('/organization/login', async ({ body, jwt }) => {
    const org = await db.select().from(organizations).where(eq(organizations.email, body.email));
    if (org.length === 0) {
      throw new Error('Invalid credentials');
    }

    if (org[0].approval_status === 'blacklisted') {
      throw new Error('Account has been suspended');
    }

    const isValid = await Bun.password.verify(body.password, org[0].password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await jwt.sign({
      id: org[0].id,
      type: 'organization'
    });

    return {
      token,
      user: { ...org[0], password_hash: undefined },
      approval_status: org[0].approval_status
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
    detail: {
      summary: 'Organization login',
      description: 'Login as an organization',
    }
  })

  // Admin Login
  .post('/admin/login', async ({ body, jwt }) => {
    const admin = await db.select().from(admins).where(eq(admins.email, body.email));
    if (admin.length === 0) {
      throw new Error('Invalid credentials');
    }

    const isValid = await Bun.password.verify(body.password, admin[0].password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await jwt.sign({
      id: admin[0].id,
      type: 'admin'
    });

    return {
      token,
      user: { ...admin[0], password_hash: undefined }
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
    detail: {
      summary: 'Admin login',
      description: 'Login as an administrator',
    }
  });
