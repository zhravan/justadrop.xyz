import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const opportunityStatusEnum = pgEnum('opportunity_status', ['open', 'closed', 'filled']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'accepted', 'rejected']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected', 'blacklisted']);

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

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  description: text('description').notNull(),
  website: text('website'),
  verified: boolean('verified').notNull().default(false),
  approval_status: approvalStatusEnum('approval_status').notNull().default('pending'),
  approval_notes: text('approval_notes'),
  approved_at: timestamp('approved_at'),
  approved_by: text('approved_by').references(() => admins.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  skillsRequired: text('skills_required').array().notNull().default([]),
  duration: text('duration').notNull(),
  location: text('location').notNull(),
  status: opportunityStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const applications = pgTable('applications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  volunteerId: text('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  opportunityId: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').notNull().default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verificationTokens = pgTable('verification_tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  type: text('type').notNull(), // 'email_verification' or 'password_reset'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
