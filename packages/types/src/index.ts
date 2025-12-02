export interface Volunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  description: string;
  website?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OpportunityMode = 'onsite' | 'remote' | 'hybrid';
export type OpportunityDateType = 'single_day' | 'multi_day' | 'ongoing';
export type OpportunityStatus = 'draft' | 'active' | 'closed';
export type CreatorType = 'admin' | 'volunteer' | 'organization';
export type ParticipantType = 'admin' | 'volunteer';
export type ComputedStatus = 'upcoming' | 'active' | 'archived';

export interface Opportunity {
  id: string;
  
  // Creator tracking
  creatorType: CreatorType;
  creatorId: string;
  organizationId?: string;
  
  // Basic information
  title: string;
  shortSummary: string;
  description: string;
  causeCategory: string;
  skillsRequired: string[];
  languagePreferences: string[];
  
  // Location & Mode
  mode: OpportunityMode;
  address?: string;
  city: string;
  state: string;
  country: string;
  osrmLink?: string;
  
  // Date & Time structure
  dateType: OpportunityDateType;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  
  // Participation settings
  maxVolunteers?: number;
  agePreference?: string;
  genderPreference?: string;
  certificateOffered: boolean;
  stipendInfo?: string;
  
  // Contact information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Status
  status: OpportunityStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityWithComputed extends Opportunity {
  computedStatus: ComputedStatus;
  participantCount: number;
  isVerified: boolean;
  canParticipate: boolean;
  creator?: {
    id: string;
    name: string;
    type: CreatorType;
  };
}

export interface Participation {
  id: string;
  participantType: ParticipantType;
  participantId: string;
  opportunityId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipationWithDetails extends Participation {
  opportunity?: OpportunityWithComputed;
  participant?: {
    id: string;
    name: string;
    type: ParticipantType;
  };
}

// Keep legacy type for backward compatibility
export interface Application extends Participation {
  volunteerId: string;
}

// Request/Response types for API
export interface CreateOpportunityRequest {
  title: string;
  shortSummary: string;
  description: string;
  causeCategory: string;
  skillsRequired: string[];
  languagePreferences: string[];
  mode: OpportunityMode;
  address?: string;
  city?: string; // Optional for remote mode
  state?: string; // Optional for remote mode
  country?: string; // Optional for remote mode
  osrmLink?: string;
  dateType: OpportunityDateType;
  startDate?: string; // Optional for ongoing opportunities
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxVolunteers?: number;
  agePreference?: string;
  genderPreference?: string;
  certificateOffered: boolean;
  stipendInfo?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface OpportunityFilters {
  mode?: OpportunityMode[];
  verified?: boolean;
  causeCategory?: string[];
  city?: string;
  state?: string;
  skills?: string[];
  status?: ComputedStatus[];
  sortBy?: 'newest' | 'earliest' | 'popular';
  page?: number;
  limit?: number;
}

// Export validation utilities
export * from './validation';
