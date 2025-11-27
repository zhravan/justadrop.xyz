import type { Opportunity, ComputedStatus, CreatorType, ParticipantType } from '@justadrop/types';

/**
 * Compute the current status of an opportunity based on dates
 */
export function computeOpportunityStatus(opportunity: Opportunity): ComputedStatus {
  const now = new Date();
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
    if (now < startDate) return 'upcoming';
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
  startDate: Date,
  endDate?: Date
): { valid: boolean; error?: string } {
  const now = new Date();

  // Start date cannot be in the past
  if (startDate < now) {
    return { valid: false, error: 'Start date cannot be in the past' };
  }

  if (dateType === 'single_day') {
    if (endDate) {
      return { valid: false, error: 'Single day opportunities should not have an end date' };
    }
    return { valid: true };
  }

  if (dateType === 'multi_day') {
    if (!endDate) {
      return { valid: false, error: 'Multi-day opportunities must have an end date' };
    }
    if (endDate <= startDate) {
      return { valid: false, error: 'End date must be after start date' };
    }
    return { valid: true };
  }

  if (dateType === 'ongoing') {
    // End date is optional for ongoing
    if (endDate && endDate <= startDate) {
      return { valid: false, error: 'End date must be after start date' };
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
  address?: string
): { valid: boolean; error?: string } {
  if (mode === 'onsite' && !address) {
    return { valid: false, error: 'Address is required for onsite opportunities' };
  }
  return { valid: true };
}
