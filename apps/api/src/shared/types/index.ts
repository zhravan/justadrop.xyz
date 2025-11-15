export type { AuthPayload } from './middleware/auth.middleware.js';
export type { ApiResponse } from './utils/response.util.js';

export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZATION = 'ORGANIZATION',
  ADMIN = 'ADMIN',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum OpportunityStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

