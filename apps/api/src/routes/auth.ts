import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import {
  db,
  volunteers,
  organizations,
  admins,
  verificationTokens
} from "@justadrop/db";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { sendEmailVerification } from "../utils/email";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authRouter = new Elysia({ prefix: "/auth", tags: ["auth"] })
  .use(jwt({ name: "jwt", secret: JWT_SECRET }))

  // Volunteer Registration
  .post(
    "/volunteer/register",
    async ({ body }) => {
      // Check if email already exists
      const existing = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.email, body.email));
      if (existing.length > 0) {
        throw new Error("Email already registered");
      }

      // Hash password
      const password_hash = await Bun.password.hash(body.password);

      // Create volunteer with email_verified: false
      const newVolunteer = await db
        .insert(volunteers)
        .values({
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
          email_verified: false
        })
        .returning();

      // Generate verification token
      const verificationToken = createId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Save verification token
      await db.insert(verificationTokens).values({
        email: body.email,
        token: verificationToken,
        type: "email_verification",
        expiresAt
      });

      console.log(" [Registration] Sending verification email to:", body.email);
      console.log(" [Registration] Token:", verificationToken);

      // Send verification email
      const emailResult = await sendEmailVerification(
        body.email,
        body.fullName,
        verificationToken,
        "volunteer"
      );

      console.log(" [Registration] Email send result:", emailResult);

      return {
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        email: body.email
      };
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
        motivation: t.Optional(t.String())
      }),
      detail: {
        summary: "Register as volunteer",
        description:
          "Create a new volunteer account (requires email verification)"
      }
    }
  )

  // Volunteer Login
  .post(
    "/volunteer/login",
    async ({ body, jwt }) => {
      const volunteer = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.email, body.email));
      if (volunteer.length === 0) {
        throw new Error("Invalid credentials");
      }

      const isValid = await Bun.password.verify(
        body.password,
        volunteer[0].password_hash
      );
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      // Check if email is verified
      if (!volunteer[0].email_verified) {
        throw new Error("Please verify your email before logging in");
      }

      const token = await jwt.sign({
        id: volunteer[0].id,
        type: "volunteer"
      });

      return {
        token,
        user: { ...volunteer[0], password_hash: undefined }
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      }),
      detail: {
        summary: "Volunteer login",
        description: "Login as a volunteer"
      }
    }
  )

  // Email Verification
  .get(
    "/verify-email/:token",
    async ({ params, set }) => {
      try {
        const { token } = params;

        // Find verification token
        const tokenRecord = await db
          .select()
          .from(verificationTokens)
          .where(eq(verificationTokens.token, token));

        // If token not found, check if it might have been already used
        if (tokenRecord.length === 0) {
          set.status = 400;
          return {
            success: false,
            message:
              "This verification link is invalid or has already been used. If you already verified your email, please try logging in."
          };
        }

        const record = tokenRecord[0];

        // Check if token is expired
        if (new Date() > record.expiresAt) {
          set.status = 400;
          return {
            success: false,
            message:
              "Verification token has expired. Please request a new verification email."
          };
        }

        // Check if it's an email verification token
        if (record.type !== "email_verification") {
          set.status = 400;
          return {
            success: false,
            message: "Invalid token type"
          };
        }

        // Check for volunteer
        const existingVolunteer = await db
          .select()
          .from(volunteers)
          .where(eq(volunteers.email, record.email));

        if (existingVolunteer.length > 0) {
          if (existingVolunteer[0].email_verified) {
            await db
              .delete(verificationTokens)
              .where(eq(verificationTokens.token, token));
            return {
              success: true,
              message: "Email already verified! You can now log in."
            };
          }

          // Update volunteer's email_verified status
          await db
            .update(volunteers)
            .set({ email_verified: true, updatedAt: new Date() })
            .where(eq(volunteers.email, record.email));

          await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.token, token));

          return {
            success: true,
            message: "Email verified successfully! You can now log in."
          };
        }

        // Check for organization
        const existingOrg = await db
          .select()
          .from(organizations)
          .where(eq(organizations.email, record.email));

        if (existingOrg.length > 0) {
          if (existingOrg[0].email_verified) {
            await db
              .delete(verificationTokens)
              .where(eq(verificationTokens.token, token));
            return {
              success: true,
              message:
                "Email already verified! Your organization registration is pending admin approval."
            };
          }

          // Update organization's email_verified status
          await db
            .update(organizations)
            .set({ email_verified: true, updatedAt: new Date() })
            .where(eq(organizations.email, record.email));

          await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.token, token));

          return {
            success: true,
            message:
              "Email verified successfully! Your organization registration is pending admin approval. You will be notified once approved."
          };
        }

        set.status = 400;
        return {
          success: false,
          message: "User not found"
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          message: "An error occurred during verification. Please try again."
        };
      }
    },
    {
      params: t.Object({
        token: t.String()
      }),
      detail: {
        summary: "Verify email address",
        description:
          "Verify volunteer or organization email using the token sent via email"
      }
    }
  )

  // Resend Verification Email
  .post(
    "/resend-verification",
    async ({ body }) => {
      // Try to find volunteer first
      const volunteer = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.email, body.email));

      if (volunteer.length > 0) {
        // Check if already verified
        if (volunteer[0].email_verified) {
          throw new Error("Email is already verified");
        }

        // Delete any existing verification tokens for this email
        await db
          .delete(verificationTokens)
          .where(eq(verificationTokens.email, body.email));

        // Generate new verification token
        const verificationToken = createId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Save new verification token
        await db.insert(verificationTokens).values({
          email: body.email,
          token: verificationToken,
          type: "email_verification",
          expiresAt
        });

        // Send verification email
        await sendEmailVerification(
          body.email,
          volunteer[0].name,
          verificationToken,
          "volunteer"
        );

        return {
          success: true,
          message: "Verification email sent. Please check your inbox.",
          userType: "volunteer"
        };
      }

      // Try to find organization
      const organization = await db
        .select()
        .from(organizations)
        .where(eq(organizations.email, body.email));

      if (organization.length > 0) {
        // Check if already verified
        if (organization[0].email_verified) {
          throw new Error("Email is already verified");
        }

        // Delete any existing verification tokens for this email
        await db
          .delete(verificationTokens)
          .where(eq(verificationTokens.email, body.email));

        // Generate new verification token
        const verificationToken = createId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Save new verification token
        await db.insert(verificationTokens).values({
          email: body.email,
          token: verificationToken,
          type: "email_verification",
          expiresAt
        });

        // Send verification email
        await sendEmailVerification(
          body.email,
          organization[0].name,
          verificationToken,
          "organization"
        );

        return {
          success: true,
          message: "Verification email sent. Please check your inbox.",
          userType: "organization"
        };
      }

      throw new Error("Email not found");
    },
    {
      body: t.Object({
        email: t.String()
      }),
      detail: {
        summary: "Resend verification email",
        description:
          "Resend email verification link to volunteer or organization"
      }
    }
  )

  // Organization Registration
  .post(
    "/organization/register",
    async ({ body }) => {
      console.log(
        "[Organization Registration] Received body:",
        JSON.stringify(body, null, 2)
      );
      console.log(
        "[Organization Registration] organizationType value:",
        body.organizationType
      );

      const existing = await db
        .select()
        .from(organizations)
        .where(eq(organizations.email, body.email));
      if (existing.length > 0) {
        throw new Error("Email already registered");
      }

      const password_hash = await Bun.password.hash(body.password);

      // Parse social links if provided
      const socialLinksJson = body.socialLinks
        ? JSON.stringify(body.socialLinks)
        : null;

      const orgData = {
        // Authentication
        name: body.name,
        email: body.email,
        password_hash,

        // Basic Information
        description: body.description,
        organization_type: body.organizationType || "ngo",
        year_established: body.yearEstablished,
        registration_number: body.registrationNumber,
        organization_size: body.organizationSize,

        // Documents
        registration_certificate_url: body.registrationCertificateUrl,
        pan_url: body.panUrl || null,
        certificate_80g_url: body.certificate80gUrl || null,
        certificate_12a_url: body.certificate12aUrl || null,
        address_proof_url: body.addressProofUrl || null,
        csr_approval_certificate_url: body.csrApprovalCertificateUrl || null,
        fcra_certificate_url: body.fcraRegistrationUrl || null,

        // Location
        city: body.city,
        state: body.state,
        country: body.country || "India",

        // Causes
        causes: body.causes,

        // Online Presence
        website: body.website || null,
        social_links: socialLinksJson,

        // Volunteer Preferences
        preferred_volunteer_type: body.preferredVolunteerType,

        // Compliance
        csr_eligible: body.csrEligible,
        fcra_registered: body.fcraRegistered,

        // Volunteer Requirements
        age_restrictions: body.ageRestrictions || null,
        gender_restrictions: body.genderRestrictions || null,
        required_skills: body.requiredSkills || [],

        // Contact Information
        contact_name: body.contactName,
        contact_email: body.contactEmail,
        contact_phone: body.contactPhone,
        contact_designation: body.contactDesignation,

        // System fields
        email_verified: false
      };

      console.log(
        "[Organization Registration] orgData before insertion:",
        JSON.stringify(orgData, null, 2)
      );
      console.log(
        "[Organization Registration] organization_type field:",
        orgData.organization_type
      );

      let newOrg;
      try {
        console.log(
          "[Organization Registration] About to insert into database..."
        );
        newOrg = await db.insert(organizations).values(orgData).returning();
        console.log(
          "[Organization Registration] Database insertion successful!",
          newOrg
        );
      } catch (dbError) {
        console.error(
          "[Organization Registration] Database insertion error:",
          dbError
        );
        console.error(
          "[Organization Registration] Error details:",
          JSON.stringify(dbError, null, 2)
        );
        throw dbError;
      }

      // Generate verification token
      const verificationToken = createId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save verification token (reusing the same table, adding org verification support)
      await db.insert(verificationTokens).values({
        email: body.email,
        token: verificationToken,
        type: "email_verification",
        expiresAt
      });

      // Send verification email
      await sendEmailVerification(
        body.email,
        body.name,
        verificationToken,
        "organization"
      );

      return {
        success: true,
        message:
          "Registration successful! Please check your email to verify your account. Your organization will be reviewed by our admin team.",
        email: body.email,
        organization: { ...newOrg[0], password_hash: undefined }
      };
    },
    {
      body: t.Object({
        // Authentication
        name: t.String({ minLength: 2 }),
        email: t.String(),
        password: t.String({ minLength: 8 }),

        // Basic Information
        description: t.String({ minLength: 10, maxLength: 500 }),
        organizationType: t.Union([
          t.Literal("ngo"),
          t.Literal("trust"),
          t.Literal("society"),
          t.Literal("non_profit_company"),
          t.Literal("section_8_company"),
          t.Literal("other")
        ]),
        yearEstablished: t.String({ pattern: "^(19|20)\\d{2}$" }),
        registrationNumber: t.String({ minLength: 5 }),
        organizationSize: t.Union([
          t.Literal("micro"),
          t.Literal("small"),
          t.Literal("medium"),
          t.Literal("large")
        ]),

        // Documents (URLs)
        registrationCertificateUrl: t.String(),
        panUrl: t.Optional(t.String()),
        certificate80gUrl: t.Optional(t.String()),
        certificate12aUrl: t.Optional(t.String()),
        addressProofUrl: t.Optional(t.String()),
        csrApprovalCertificateUrl: t.Optional(t.String()),
        fcraRegistrationUrl: t.Optional(t.String()),

        // Location
        city: t.String({ minLength: 2 }),
        state: t.String({ minLength: 2 }),
        country: t.Optional(t.String()),

        // Causes
        causes: t.Array(t.String(), { minItems: 1 }),

        // Online Presence
        website: t.Optional(t.String()),
        socialLinks: t.Optional(
          t.Object({
            facebook: t.Optional(t.String()),
            twitter: t.Optional(t.String()),
            instagram: t.Optional(t.String()),
            linkedin: t.Optional(t.String())
          })
        ),

        // Volunteer Preferences
        preferredVolunteerType: t.Array(t.String(), { minItems: 1 }),

        // Compliance
        csrEligible: t.Boolean(),
        fcraRegistered: t.Boolean(),

        // Volunteer Requirements
        ageRestrictions: t.Optional(t.String()),
        genderRestrictions: t.Optional(t.String()),
        requiredSkills: t.Optional(t.Array(t.String())),

        // Contact Information
        contactName: t.String({ minLength: 2 }),
        contactEmail: t.String(),
        contactPhone: t.String({ minLength: 10 }),
        contactDesignation: t.String({ minLength: 2 })
      }),
      detail: {
        summary: "Register as organization",
        description:
          "Create a new organization account (requires email verification and admin approval)"
      }
    }
  )

  // Organization Login
  .post(
    "/organization/login",
    async ({ body, jwt }) => {
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.email, body.email));
      if (org.length === 0) {
        throw new Error("Invalid credentials");
      }

      const isValid = await Bun.password.verify(
        body.password,
        org[0].password_hash
      );
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      // Check if email is verified
      if (!org[0].email_verified) {
        throw new Error("Please verify your email before logging in");
      }

      if (org[0].approval_status === "blacklisted") {
        throw new Error("Account has been suspended");
      }

      const token = await jwt.sign({
        id: org[0].id,
        type: "organization"
      });

      return {
        token,
        user: { ...org[0], password_hash: undefined },
        approval_status: org[0].approval_status
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      }),
      detail: {
        summary: "Organization login",
        description: "Login as an organization"
      }
    }
  )

  // Admin Login
  .post(
    "/admin/login",
    async ({ body, jwt }) => {
      const admin = await db
        .select()
        .from(admins)
        .where(eq(admins.email, body.email));
      if (admin.length === 0) {
        throw new Error("Invalid credentials");
      }

      const isValid = await Bun.password.verify(
        body.password,
        admin[0].password_hash
      );
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      const token = await jwt.sign({
        id: admin[0].id,
        type: "admin"
      });

      return {
        token,
        user: { ...admin[0], password_hash: undefined }
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String()
      }),
      detail: {
        summary: "Admin login",
        description: "Login as an administrator"
      }
    }
  );
