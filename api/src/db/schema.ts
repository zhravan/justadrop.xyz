import { pgTable, text, timestamp, boolean, pgEnum, jsonb, index, integer, check, unique, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other', 'prefer_not_to_say']);

export type VolunteeringData = {
  isInterest: boolean;
  skills: Array<{ name: string; expertise: string }>;
  causes: string[];
};

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  isAdmin: boolean('is_admin').notNull().default(false),
  name: text('name'),
  phone: text('phone'),
  gender: genderEnum('gender'),
  isBanned: boolean('is_banned').notNull().default(false),
  volunteering: jsonb('volunteering').$type<VolunteeringData>(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  isAdminIdx: index('users_is_admin_idx').on(table.isAdmin),
  deletedAtIdx: index('users_deleted_at_idx').on(table.deletedAt),
}));

export const otpTokens = pgTable('otp_tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  emailCodeIdx: index('otp_tokens_email_code_idx').on(table.email, table.code),
  expiresAtIdx: index('otp_tokens_expires_at_idx').on(table.expiresAt),
  expiresAtUsedIdx: index('otp_tokens_expires_used_idx').on(table.expiresAt, table.used),
  createdAtUsedIdx: index('otp_tokens_created_used_idx').on(table.createdAt, table.used),
}));

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.token),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

export const organizationStatusEnum = pgEnum('organization_status', ['pending', 'verified', 'rejected', 'suspended']);

export const documentTypeEnum = pgEnum('document_type', [
  'registration_certificate',
  '80G_certificate',
  '12A_certificate',
  'PAN',
  'proof_of_address',
]);

export const causeEnum = pgEnum('cause', [
  'animal_welfare',
  'environmental',
  'humanitarian',
  'education',
  'healthcare',
  'poverty_alleviation',
  'women_empowerment',
  'child_welfare',
  'elderly_care',
  'disability_support',
  'rural_development',
  'urban_development',
  'arts_culture',
  'sports',
  'technology',
  'other'
]);

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgName: text('org_name').notNull(),
  description: text('description'),
  causes: text('causes').array().notNull().default([]),
  website: text('website'),
  registrationNumber: text('registration_number'),
  contactPersonName: text('contact_person_name').notNull(),
  contactPersonEmail: text('contact_person_email').notNull(),
  contactPersonNumber: text('contact_person_number'),
  verificationStatus: organizationStatusEnum('verification_status').notNull().default('pending'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('India'),
  verifiedAt: timestamp('verified_at'),
  logo: text('logo'), // Can be URL string or asset key (e.g., S3 key, CDN path)
  yearEstablished: text('year_established'),
  socialLinks: text('social_links').array().default([]),
  images: text('images').array().default([]),
  isCsrEligible: boolean('is_csr_eligible').notNull().default(false),
  isFcraRegistered: boolean('is_fcra_registered').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  createdByIdx: index('organizations_created_by_idx').on(table.createdBy),
  verificationStatusIdx: index('organizations_verification_status_idx').on(table.verificationStatus),
  contactPersonEmailIdx: index('organizations_contact_email_idx').on(table.contactPersonEmail),
  cityIdx: index('organizations_city_idx').on(table.city),
  stateIdx: index('organizations_state_idx').on(table.state),
  countryIdx: index('organizations_country_idx').on(table.country),
  deletedAtIdx: index('organizations_deleted_at_idx').on(table.deletedAt),
  // GIN index for causes array to enable efficient array queries
  causesIdx: index('organizations_causes_idx').on(table.causes),
  descriptionLengthCheck: check('organizations_description_length_check', sql`${table.description} IS NULL OR char_length(${table.description}) <= 10000`),
}));

export const organizationDocuments = pgTable('organization_documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  ngoId: text('ngo_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  documentType: documentTypeEnum('document_type').notNull(),
  documentAssetUrl: text('document_asset_url').notNull(),
  format: text('format').notNull(), // pdf, png, jpg, jpeg, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  ngoIdIdx: index('org_documents_ngo_id_idx').on(table.ngoId),
  documentTypeIdx: index('org_documents_type_idx').on(table.documentType),
}));

export const organizationMemberRoleEnum = pgEnum('organization_member_role', ['owner', 'admin', 'member']);

export const organizationMembers = pgTable('organization_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: organizationMemberRoleEnum('role').notNull().default('member'),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  orgUserIdx: index('org_members_org_user_idx').on(table.organizationId, table.userId),
  userIdIdx: index('org_members_user_id_idx').on(table.userId),
  orgIdIdx: index('org_members_org_id_idx').on(table.organizationId),
}));

export const opportunityStatusEnum = pgEnum('opportunity_status', ['draft', 'active', 'completed', 'cancelled']);

export const opportunityModeEnum = pgEnum('opportunity_mode', ['onsite', 'remote', 'hybrid']);

export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  ngoId: text('ngo_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userCreatedBy: text('user_created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  userUpdatedBy: text('user_updated_by').references(() => users.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  causeCategoryNames: text('cause_category_names').array().notNull().default([]),
  requiredSkills: text('required_skills').array().default([]),
  maxVolunteers: integer('max_volunteers'),
  minVolunteers: integer('min_volunteers'),
  languagePreference: text('language_preference'),
  genderPreference: text('gender_preference'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  status: opportunityStatusEnum('status').notNull().default('draft'),
  opportunityMode: opportunityModeEnum('opportunity_mode').notNull(),
  osrmLink: text('osrm_link'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('India'),
  contactName: text('contact_name').notNull(),
  contactPhoneNumber: text('contact_phone_number'),
  contactEmail: text('contact_email').notNull(),
  stipendInfo: jsonb('stipend_info').$type<{ amount?: number; duration?: string }>(),
  isCertificateOffered: boolean('is_certificate_offered').notNull().default(false),
  bannerImage: text('banner_image'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  ngoIdIdx: index('opportunities_ngo_id_idx').on(table.ngoId),
  userCreatedByIdx: index('opportunities_user_created_by_idx').on(table.userCreatedBy),
  statusIdx: index('opportunities_status_idx').on(table.status),
  opportunityModeIdx: index('opportunities_mode_idx').on(table.opportunityMode),
  cityIdx: index('opportunities_city_idx').on(table.city),
  stateIdx: index('opportunities_state_idx').on(table.state),
  countryIdx: index('opportunities_country_idx').on(table.country),
  startDateIdx: index('opportunities_start_date_idx').on(table.startDate),
  endDateIdx: index('opportunities_end_date_idx').on(table.endDate),
  // GIN indexes for array fields to enable efficient array queries
  causeCategoryNamesIdx: index('opportunities_cause_categories_idx').on(table.causeCategoryNames),
  requiredSkillsIdx: index('opportunities_required_skills_idx').on(table.requiredSkills),
  volunteersCheck: check('volunteers_count_check', sql`(${table.minVolunteers} IS NULL OR ${table.maxVolunteers} IS NULL OR ${table.minVolunteers} <= ${table.maxVolunteers})`),
  dateCheck: check('date_range_check', sql`(${table.startDate} IS NULL OR ${table.endDate} IS NULL OR ${table.startDate} <= ${table.endDate})`),
  descriptionLengthCheck: check('opportunities_description_length_check', sql`char_length(${table.description}) <= 10000`),
}));

export const applicationStatusEnum = pgEnum('application_status', ['pending', 'approved', 'rejected']);

export const opportunityApplications = pgTable('opportunity_applications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  opportunityId: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  motivationDescription: text('motivation_description'),
  status: applicationStatusEnum('status').notNull().default('pending'),
  hasAttended: boolean('has_attended').notNull().default(false),
  approvedAt: timestamp('approved_at'),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  opportunityUserUnique: unique('applications_opp_user_unique').on(table.opportunityId, table.userId),
  opportunityUserIdx: index('applications_opp_user_idx').on(table.opportunityId, table.userId),
  opportunityIdIdx: index('applications_opp_id_idx').on(table.opportunityId),
  userIdIdx: index('applications_user_id_idx').on(table.userId),
  statusIdx: index('applications_status_idx').on(table.status),
  approvedByIdx: index('applications_approved_by_idx').on(table.approvedBy),
}));

export const volunteersFeedback = pgTable('volunteers_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // User giving feedback
  opportunityId: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  volunteerId: text('volunteer_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Volunteer who attended (user ID)
  rating: integer('rating').notNull(), // 1 to 5
  testimonial: text('testimonial'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  opportunityIdIdx: index('volunteers_feedback_opp_id_idx').on(table.opportunityId),
  userIdIdx: index('volunteers_feedback_user_id_idx').on(table.userId),
  volunteerIdIdx: index('volunteers_feedback_volunteer_id_idx').on(table.volunteerId),
  ratingIdx: index('volunteers_feedback_rating_idx').on(table.rating),
  ratingCheck: check('volunteers_feedback_rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  testimonialLengthCheck: check('volunteers_feedback_testimonial_length_check', sql`${table.testimonial} IS NULL OR char_length(${table.testimonial}) <= 5000`),
}));

export const opportunitiesFeedback = pgTable('opportunities_feedback', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  opportunityId: text('opportunity_id').references(() => opportunities.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1 to 5
  images: text('images').array().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('opportunities_feedback_user_id_idx').on(table.userId),
  opportunityIdIdx: index('opportunities_feedback_opp_id_idx').on(table.opportunityId),
  ratingIdx: index('opportunities_feedback_rating_idx').on(table.rating),
  ratingCheck: check('opportunities_feedback_rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
}));

export const moderators = pgTable('moderators', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  assignedRegions: text('assigned_regions').array().default([]), // Optional: cities/states they moderate
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('moderators_user_id_idx').on(table.userId),
  isActiveIdx: index('moderators_is_active_idx').on(table.isActive),
}));

export const moderationTypeEnum = pgEnum('moderation_type', ['user', 'event', 'ngo']);

export const moderationStatusEnum = pgEnum('moderation_status', ['open', 'resolved', 'dismissed']);

export const moderationPriorityEnum = pgEnum('moderation_priority', ['low', 'medium', 'high', 'urgent']);

export type TargetMetadata = {
  opportunityId?: string;
  userId?: string;
  ngoId?: string;
};

export const moderationMonitoring = pgTable('moderation_monitoring', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  moderationType: moderationTypeEnum('moderation_type').notNull(),
  reasons: text('reasons').notNull(),
  targetMetadata: jsonb('target_metadata').$type<TargetMetadata>(),
  status: moderationStatusEnum('status').notNull().default('open'),
  priority: moderationPriorityEnum('priority').notNull().default('medium'),
  reportedBy: text('reported_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  resolutionNotes: text('resolution_notes'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  moderationTypeIdx: index('moderation_monitoring_type_idx').on(table.moderationType),
  statusIdx: index('moderation_monitoring_status_idx').on(table.status),
  priorityIdx: index('moderation_monitoring_priority_idx').on(table.priority),
  reportedByIdx: index('moderation_monitoring_reported_by_idx').on(table.reportedBy),
  assignedToIdx: index('moderation_monitoring_assigned_to_idx').on(table.assignedTo),
  reviewedByIdx: index('moderation_monitoring_reviewed_by_idx').on(table.reviewedBy),
  createdAtIdx: index('moderation_monitoring_created_at_idx').on(table.createdAt),
  resolutionNotesLengthCheck: check('moderation_monitoring_resolution_notes_length_check', sql`${table.resolutionNotes} IS NULL OR char_length(${table.resolutionNotes}) <= 5000`),
}));
