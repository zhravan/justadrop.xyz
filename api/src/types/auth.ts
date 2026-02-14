import type { VolunteeringData } from '../db/schema.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  emailVerified: boolean;
  volunteering?: VolunteeringData;
}
