import { db } from '@justadrop/db';
import { opportunities } from '@justadrop/db';
import { log } from '../utils/logger';
import {
  validateOpportunityDates,
  validateOpportunityMode,
  validateContactInfo,
} from '../utils/opportunity';
import { 
  validateOpportunityForm,
  validateTitle,
  validateShortSummary,
  validateDescription,
  validateMaxVolunteers,
  validateUrl,
  type OpportunityFormData 
} from '@justadrop/types';
import type { CreateOpportunityRequest } from '@justadrop/types';

export class OpportunityService {
  /**
   * Create a new opportunity
   */
  async createOpportunity(
    data: CreateOpportunityRequest,
    creatorId: string,
    creatorType: 'admin' | 'volunteer' | 'organization'
  ) {
    log.info('Creating opportunity', { title: data.title, creatorType, creatorId });

    // Comprehensive validation using shared validation functions
    const formData: OpportunityFormData = {
      title: data.title,
      shortSummary: data.shortSummary,
      description: data.description,
      causeCategory: data.causeCategory,
      mode: data.mode,
      dateType: data.dateType,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      osrmLink: data.osrmLink,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      maxVolunteers: data.maxVolunteers,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    };

    // Validate the entire form
    const validation = validateOpportunityForm(formData);
    
    if (!validation.valid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join('; ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    // Additional backend-specific validations
    const startDateObj = data.startDate ? new Date(data.startDate) : undefined;
    const endDateObj = data.endDate ? new Date(data.endDate) : undefined;

    const dateValidation = validateOpportunityDates(
      data.dateType,
      startDateObj,
      endDateObj
    );

    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    const modeValidation = validateOpportunityMode(
      data.mode,
      data.address,
      data.city,
      data.state,
      data.country
    );

    if (!modeValidation.valid) {
      throw new Error(modeValidation.error);
    }

    const contactValidation = validateContactInfo(
      data.contactName,
      data.contactEmail,
      data.contactPhone
    );

    if (!contactValidation.valid) {
      throw new Error(contactValidation.error);
    }

    // Validate URL if provided
    if (data.osrmLink) {
      const urlValidation = validateUrl(data.osrmLink);
      if (!urlValidation.valid) {
        throw new Error(urlValidation.error);
      }
    }

    // Set organizationId if creator is organization
    const organizationId = creatorType === 'organization' ? creatorId : undefined;

    // Handle location fields based on mode
    let city = data.city;
    let state = data.state;
    let country = data.country || 'India';

    // For remote mode, set defaults if not provided
    if (data.mode === 'remote') {
      city = city || 'Remote';
      state = state || 'Remote';
      country = country || 'India';
    } else {
      // For onsite/hybrid, validate required fields
      if (!city || !state || !country) {
        throw new Error('City, state, and country are required for onsite and hybrid opportunities');
      }
    }

    // Handle startDate for ongoing opportunities
    // For ongoing without startDate, use current date
    let startDate = startDateObj;
    if (data.dateType === 'ongoing' && !startDate) {
      startDate = new Date();
    }

    // Prepare data for database
    const opportunityData = {
      title: data.title,
      shortSummary: data.shortSummary,
      description: data.description,
      causeCategory: data.causeCategory,
      skillsRequired: data.skillsRequired || [],
      languagePreferences: data.languagePreferences || [],
      mode: data.mode,
      address: data.address || null,
      city,
      state,
      country,
      osrmLink: data.osrmLink || null,
      dateType: data.dateType,
      startDate: startDate!,
      endDate: endDateObj || null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      maxVolunteers: data.maxVolunteers || null,
      agePreference: data.agePreference || null,
      genderPreference: data.genderPreference || null,
      certificateOffered: data.certificateOffered,
      stipendInfo: data.stipendInfo || null,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      creatorType,
      creatorId,
      organizationId: organizationId || null,
      status: 'active' as const,
    };

    const result = await db.insert(opportunities).values(opportunityData).returning();
    const opportunity = result[0];

    log.info('Opportunity created successfully', { opportunityId: opportunity.id });

    return opportunity;
  }

  /**
   * Update an opportunity
   */
  async updateOpportunity(
    id: string,
    data: Partial<CreateOpportunityRequest>,
    creatorId: string
  ) {
    log.info('Updating opportunity', { opportunityId: id, creatorId });

    const { eq } = await import('drizzle-orm');
    
    // Check ownership
    const existingResult = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    if (existingResult.length === 0) {
      throw new Error('Opportunity not found');
    }
    const existing = existingResult[0];

    if (existing.creatorId !== creatorId) {
      throw new Error('Only the creator can update this opportunity');
    }

    // Validate dates if provided
    if (data.dateType || data.startDate || data.endDate) {
      const dateType = data.dateType || existing.dateType;
      const startDateObj = data.startDate ? new Date(data.startDate) : existing.startDate;
      const endDateObj = data.endDate ? new Date(data.endDate) : (existing.endDate || undefined);

      const dateValidation = validateOpportunityDates(
        dateType,
        startDateObj,
        endDateObj
      );

      if (!dateValidation.valid) {
        throw new Error(dateValidation.error);
      }
    }

    // Validate mode/address if provided
    if (data.mode || data.address !== undefined || data.city !== undefined || data.state !== undefined || data.country !== undefined) {
      const mode = data.mode || existing.mode;
      const address = data.address !== undefined ? data.address : (existing.address || undefined);
      const city = data.city !== undefined ? data.city : existing.city;
      const state = data.state !== undefined ? data.state : existing.state;
      const country = data.country !== undefined ? data.country : existing.country;

      const modeValidation = validateOpportunityMode(mode, address, city, state, country);

      if (!modeValidation.valid) {
        throw new Error(modeValidation.error);
      }
    }

    // Validate contact info if provided
    if (data.contactName || data.contactEmail || data.contactPhone) {
      const contactName = data.contactName || existing.contactName;
      const contactEmail = data.contactEmail || existing.contactEmail;
      const contactPhone = data.contactPhone || existing.contactPhone;

      const contactValidation = validateContactInfo(contactName, contactEmail, contactPhone);

      if (!contactValidation.valid) {
        throw new Error(contactValidation.error);
      }
    }

    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const updated = await db.update(opportunities)
      .set(updateData)
      .where(eq(opportunities.id, id))
      .returning();

    log.info('Opportunity updated successfully', { opportunityId: id });

    return updated[0];
  }

  /**
   * Delete an opportunity
   */
  async deleteOpportunity(id: string, creatorId: string) {
    log.info('Deleting opportunity', { opportunityId: id, creatorId });

    const { eq } = await import('drizzle-orm');
    
    const existingResult = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    if (existingResult.length === 0) {
      throw new Error('Opportunity not found');
    }
    const existing = existingResult[0];

    if (existing.creatorId !== creatorId) {
      throw new Error('Only the creator can delete this opportunity');
    }

    await db.delete(opportunities).where(eq(opportunities.id, id));

    log.info('Opportunity deleted successfully', { opportunityId: id });

    return { message: 'Opportunity deleted successfully' };
  }
}

