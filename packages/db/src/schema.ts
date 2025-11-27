import { pgTable, text, timestamp, boolean, pgEnum, integer } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const opportunityStatusEnum = pgEnum('opportunity_status', ['draft', 'active', 'closed']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'accepted', 'rejected']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected', 'blacklisted']);
export const opportunityModeEnum = pgEnum('opportunity_mode', ['onsite', 'remote', 'hybrid']);
export const opportunityDateTypeEnum = pgEnum('opportunity_date_type', ['single_day', 'multi_day', 'ongoing']);
export const creatorTypeEnum = pgEnum('creator_type', ['admin', 'volunteer', 'organization']);
export const participantTypeEnum = pgEnum('participant_type', ['admin', 'volunteer']);

export const volunteers = pgTable('volunteers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  interests: text('interests').array().notNull().default([]),
  skills: text('skills'),
  availability: text('availability').notNull(),
  bio: text('bio'),
  experience: text('experience'),
  motivation: text('motivation'),
  email_verified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const admins = pgTable('admins', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const organizationTypeEnum = pgEnum('organization_type', [
  'ngo',
  'trust',
  'society',
  'non_profit_company',
  'section_8_company',
  'other'
]);

export const organizationSizeEnum = pgEnum('organization_size', [
  'micro',
  'small',
  'medium',
  'large'
]);

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),

  // Basic Information
  description: text('description').notNull(),

  // Online Presence
  website: text('website'),

  // System fields
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  password_hash: text('password_hash').notNull(),

  // Approval fields
  approval_status: approvalStatusEnum('approval_status').notNull().default('pending'),
  approval_notes: text('approval_notes'),
  approved_at: timestamp('approved_at'),
  approved_by: text('approved_by').references(() => admins.id),

  organization_type: organizationTypeEnum('organization_type').notNull(),
  year_established: text('year_established').notNull(),
  registration_number: text('registration_number').notNull(),
  organization_size: organizationSizeEnum('organization_size').notNull(),
  
  // Documents (URLs)
  registration_certificate_url: text('registration_certificate_url').notNull(),
  pan_url: text('pan_url'),
  certificate_80g_url: text('certificate_80g_url'),
  certificate_12a_url: text('certificate_12a_url'),
  address_proof_url: text('address_proof_url'),
  csr_approval_certificate_url: text('csr_approval_certificate_url'),
  fcra_certificate_url: text('fcra_certificate_url'),
  
  // Location
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull().default('India'),
  
  // Causes & Focus Areas
  causes: text('causes').array().notNull().default([]),

  // Online Presence (social_links)
  social_links: text('social_links'), // JSON string for flexibility

  // Volunteer Preferences
  preferred_volunteer_type: text('preferred_volunteer_type').array().notNull().default([]),
  
  // Compliance & Eligibility
  csr_eligible: boolean('csr_eligible').notNull().default(false),
  fcra_registered: boolean('fcra_registered').notNull().default(false),
  
  // Volunteer Requirements
  age_restrictions: text('age_restrictions'), // e.g., "18+", "21-60", "No restrictions"
  gender_restrictions: text('gender_restrictions'), // e.g., "Any", "Female only", etc.
  required_skills: text('required_skills').array().default([]),
  
  // Primary Contact Information
  contact_name: text('contact_name').notNull(),
  contact_email: text('contact_email').notNull(),
  contact_phone: text('contact_phone').notNull(),
  contact_designation: text('contact_designation').notNull(),

  email_verified: boolean('email_verified').notNull().default(false),
});

export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  
  // Creator tracking (polymorphic)
  creatorType: creatorTypeEnum('creator_type').notNull(),
  creatorId: text('creator_id').notNull(),
  organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'cascade' }), // Kept for backward compatibility
  
  // Basic information
  title: text('title').notNull(),
  shortSummary: text('short_summary').notNull(),
  description: text('description').notNull(),
  causeCategory: text('cause_category').notNull(),
  skillsRequired: text('skills_required').array().notNull().default([]),
  languagePreferences: text('language_preferences').array().notNull().default([]),
  
  // Location & Mode
  mode: opportunityModeEnum('mode').notNull(),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull().default('India'),
  osrmLink: text('osrm_link'),
  
  // Date & Time structure
  dateType: opportunityDateTypeEnum('date_type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  
  // Participation settings
  maxVolunteers: integer('max_volunteers'),
  agePreference: text('age_preference'),
  genderPreference: text('gender_preference'),
  certificateOffered: boolean('certificate_offered').notNull().default(false),
  stipendInfo: text('stipend_info'),
  
  // Contact information
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  
  // Status
  status: opportunityStatusEnum('status').notNull().default('active'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const participations = pgTable('participations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  participantType: participantTypeEnum('participant_type').notNull(),
  participantId: text('participant_id').notNull(),
  opportunityId: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').notNull().default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Keep legacy applications table name as alias for backward compatibility
export const applications = participations;

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  type: text('type').notNull(), // 'email_verification' or 'password_reset'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
