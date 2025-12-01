import type { Opportunity, ComputedStatus, CreatorType, ParticipantType } from '@justadrop/types';

/**
 * Compute the current status of an opportunity based on dates
 */
export function computeOpportunityStatus(opportunity: Opportunity): ComputedStatus {
  const now = new Date();
  
  // Handle ongoing opportunities without startDate
  if (opportunity.dateType === 'ongoing' && !opportunity.startDate) {
    return 'active';
  }
  
  const startDate = new Date(opportunity.startDate);
  const endDate = opportunity.endDate ? new Date(opportunity.endDate) : null;

  // If manually closed, always show as archived
  if (opportunity.status === 'closed') {
    return 'archived';
  }

  if (opportunity.dateType === 'single_day') {
    const isSameDay = startDate.toDateString() === now.toDateString();
    if (isSameDay) return 'active';
    return startDate > now ? 'upcoming' : 'archived';
  }

  if (opportunity.dateType === 'multi_day') {
    if (now < startDate) return 'upcoming';
    if (endDate && now > endDate) return 'archived';
    return 'active';
  }

  if (opportunity.dateType === 'ongoing') {
    if (startDate && now < startDate) return 'upcoming';
    if (!endDate || now <= endDate) return 'active';
    return 'archived';
  }

  return 'active';
}

/**
 * Check if a user can participate in an opportunity
 */
export function canParticipateInOpportunity(
  opportunity: Opportunity & { participantCount?: number },
  currentUserId: string,
  currentUserType: 'admin' | 'volunteer' | 'organization',
  hasExistingParticipation: boolean
): boolean {
  // NGOs cannot participate
  if (currentUserType === 'organization') {
    return false;
  }

  // Cannot participate in own opportunity
  if (opportunity.creatorId === currentUserId) {
    return false;
  }

  // Already participating
  if (hasExistingParticipation) {
    return false;
  }

  // Opportunity is full
  if (
    opportunity.maxVolunteers &&
    opportunity.participantCount &&
    opportunity.participantCount >= opportunity.maxVolunteers
  ) {
    return false;
  }

  // Opportunity must be active or upcoming
  const status = computeOpportunityStatus(opportunity);
  if (status === 'archived') {
    return false;
  }

  return true;
}

/**
 * Check if an opportunity is verified (created by organization)
 */
export function isVerifiedOpportunity(creatorType: CreatorType): boolean {
  return creatorType === 'organization';
}

/**
 * Validate opportunity dates based on dateType
 */
export function validateOpportunityDates(
  dateType: Opportunity['dateType'],
  startDate?: Date,
  endDate?: Date
): { valid: boolean; error?: string } {
  const now = new Date();

  if (dateType === 'single_day') {
    if (!startDate) {
      return { valid: false, error: 'Start date is required for single day opportunities' };
    }
    if (startDate < now) {
      return { valid: false, error: 'Start date cannot be in the past' };
    }
    if (endDate) {
      return { valid: false, error: 'Single day opportunities should not have an end date' };
    }
    return { valid: true };
  }

  if (dateType === 'multi_day') {
    if (!startDate) {
      return { valid: false, error: 'Start date is required for multi-day opportunities' };
    }
    if (startDate < now) {
      return { valid: false, error: 'Start date cannot be in the past' };
    }
    if (!endDate) {
      return { valid: false, error: 'Multi-day opportunities must have an end date' };
    }
    if (endDate <= startDate) {
      return { valid: false, error: 'End date must be after start date' };
    }
    return { valid: true };
  }

  if (dateType === 'ongoing') {
    // Start date is optional for ongoing opportunities
    if (startDate) {
      if (startDate < now) {
        return { valid: false, error: 'Start date cannot be in the past' };
      }
      // If endDate is provided, it must be after startDate
      if (endDate && endDate <= startDate) {
        return { valid: false, error: 'End date must be after start date' };
      }
    }
    // If endDate is provided without startDate, validate it's in the future
    if (endDate && !startDate && endDate < now) {
      return { valid: false, error: 'End date cannot be in the past' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Invalid date type' };
}

/**
 * Validate address is provided for onsite opportunities
 */
export function validateOpportunityMode(
  mode: Opportunity['mode'],
  address?: string,
  city?: string,
  state?: string,
  country?: string
): { valid: boolean; error?: string } {
  if (mode === 'onsite') {
    if (!address) {
      return { valid: false, error: 'Address is required for onsite opportunities' };
    }
    if (!city) {
      return { valid: false, error: 'City is required for onsite opportunities' };
    }
    if (!state) {
      return { valid: false, error: 'State is required for onsite opportunities' };
    }
    if (!country) {
      return { valid: false, error: 'Country is required for onsite opportunities' };
    }
  }
  
  if (mode === 'hybrid') {
    if (!address) {
      return { valid: false, error: 'Address is required for hybrid opportunities' };
    }
    if (!city) {
      return { valid: false, error: 'City is required for hybrid opportunities' };
    }
    if (!state) {
      return { valid: false, error: 'State is required for hybrid opportunities' };
    }
    if (!country) {
      return { valid: false, error: 'Country is required for hybrid opportunities' };
    }
  }
  
  // Remote mode doesn't require address or location
  return { valid: true };
}

/**
 * Validate contact information
 */
export function validateContactInfo(
  contactName: string,
  contactEmail: string,
  contactPhone: string
): { valid: boolean; error?: string } {
  if (!contactName || contactName.trim().length < 2) {
    return { valid: false, error: 'Contact name must be at least 2 characters' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contactEmail || !emailRegex.test(contactEmail)) {
    return { valid: false, error: 'Invalid email address format' };
  }
  
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!contactPhone || !phoneRegex.test(contactPhone) || contactPhone.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  
  return { valid: true };
}
