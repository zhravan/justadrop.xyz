import { OpportunityService } from '../services/opportunity.service';
import { log } from '../utils/logger';
import { computeOpportunityStatus, isVerifiedOpportunity } from '../utils/opportunity';
import type { OpportunityWithComputed } from '@justadrop/types';

export class OpportunityController {
  private opportunityService: OpportunityService;

  constructor() {
    this.opportunityService = new OpportunityService();
  }

  /**
   * Create opportunity
   */
  async createOpportunity(
    body: any,
    userId: string,
    userType: 'admin' | 'volunteer' | 'organization'
  ) {
    try {
      const opportunity = await this.opportunityService.createOpportunity(
        body,
        userId,
        userType
      );

      const opportunityWithComputed: OpportunityWithComputed = {
        ...opportunity,
        computedStatus: computeOpportunityStatus(opportunity),
        participantCount: 0,
        isVerified: isVerifiedOpportunity(opportunity.creatorType),
        canParticipate: false,
      };

      return { opportunity: opportunityWithComputed };
    } catch (error) {
      log.error('Failed to create opportunity', error);
      throw error;
    }
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(id: string, body: any, userId: string) {
    try {
      const opportunity = await this.opportunityService.updateOpportunity(
        id,
        body,
        userId
      );

      return { opportunity };
    } catch (error) {
      log.error('Failed to update opportunity', error);
      throw error;
    }
  }

  /**
   * Delete opportunity
   */
  async deleteOpportunity(id: string, userId: string) {
    try {
      const result = await this.opportunityService.deleteOpportunity(id, userId);
      return result;
    } catch (error) {
      log.error('Failed to delete opportunity', error);
      throw error;
    }
  }
}

