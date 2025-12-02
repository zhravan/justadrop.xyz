import { Elysia, t } from 'elysia';
import { db, opportunities, participations, volunteers, organizations, admins } from '@justadrop/db';
import { eq, and, or, sql, inArray, gte, lte, desc, asc } from 'drizzle-orm';
import {
  computeOpportunityStatus,
  canParticipateInOpportunity,
  isVerifiedOpportunity,
} from '../utils/opportunity';
import type { OpportunityWithComputed, ParticipantType, Opportunity } from '@justadrop/types';
import { OPPORTUNITY_VALIDATION } from '@justadrop/types';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { OpportunityController } from '../controllers/opportunity.controller';
import { log } from '../utils/logger';

const opportunityController = new OpportunityController();

// Helper to convert DB result (with nulls) to Opportunity type (with undefined)
function dbToOpportunity(dbOpp: any): Opportunity {
  return {
    ...dbOpp,
    organizationId: dbOpp.organizationId || undefined,
    address: dbOpp.address || undefined,
    osrmLink: dbOpp.osrmLink || undefined,
    endDate: dbOpp.endDate || undefined,
    startTime: dbOpp.startTime || undefined,
    endTime: dbOpp.endTime || undefined,
    maxVolunteers: dbOpp.maxVolunteers || undefined,
    agePreference: dbOpp.agePreference || undefined,
    genderPreference: dbOpp.genderPreference || undefined,
    stipendInfo: dbOpp.stipendInfo || undefined,
  };
}

export const opportunitiesRouter = new Elysia({ prefix: '/opportunities', tags: ['opportunities'] })
  .use(authMiddleware)
  
  // Get all opportunities with filters (Public)
  .get('/', async ({ query }) => {
    const {
      mode,
      verified,
      causeCategory,
      city,
      state,
      skills,
      status,
      showPast,
      sortBy = 'newest',
      page = '1',
      limit = '20',
    } = query;

    let queryBuilder = db
      .select({
        opportunity: opportunities,
        participantCount: sql<number>`COUNT(DISTINCT ${participations.id})::int`,
      })
      .from(opportunities)
      .leftJoin(participations, eq(opportunities.id, participations.opportunityId))
      .groupBy(opportunities.id);

    // Apply filters
    const filters: any[] = [];
    
    // By default, hide completed/past opportunities unless explicitly requested
    if (showPast !== 'true') {
      filters.push(
        or(
          eq(opportunities.status, 'active'),
          eq(opportunities.status, 'draft'),
          and(
            eq(opportunities.status, 'active'),
            or(
              sql`${opportunities.endDate} IS NULL`,
              gte(opportunities.endDate, new Date())
            )
          )
        )
      );
    }
    
    if (mode) {
      const modes = (Array.isArray(mode) ? mode : [mode]) as ('onsite' | 'remote' | 'hybrid')[];
      filters.push(inArray(opportunities.mode, modes));
    }
    
    if (verified === 'true') {
      filters.push(eq(opportunities.creatorType, 'organization'));
    }
    
    if (causeCategory) {
      const categories = Array.isArray(causeCategory) ? causeCategory : [causeCategory];
      filters.push(inArray(opportunities.causeCategory, categories));
    }
    
    if (city) {
      filters.push(eq(opportunities.city, city));
    }
    
    if (state) {
      filters.push(eq(opportunities.state, state));
    }
    
    if (skills) {
      const skillsList = Array.isArray(skills) ? skills : [skills];
      filters.push(sql`${opportunities.skillsRequired} && ARRAY[${skillsList}]::text[]`);
    }

    if (filters.length > 0) {
      queryBuilder = queryBuilder.where(and(...filters)) as any;
    }

    // Apply sorting
    const sortValue = sortBy || 'newest';
    if (sortValue === 'newest' || sortValue === 'createdAt') {
      queryBuilder = queryBuilder.orderBy(desc(opportunities.createdAt)) as any;
    } else if (sortValue === 'earliest') {
      queryBuilder = queryBuilder.orderBy(asc(opportunities.startDate)) as any;
    } else if (sortValue === 'popular') {
      queryBuilder = queryBuilder.orderBy(desc(sql`COUNT(DISTINCT ${participations.id})`)) as any;
    } else {
      queryBuilder = queryBuilder.orderBy(desc(opportunities.createdAt)) as any;
    }

    // Apply pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    queryBuilder = queryBuilder.limit(limitNum).offset(offset) as any;

    const results = await queryBuilder;

    // Compute status and additional fields
    const opportunitiesWithComputed: OpportunityWithComputed[] = results.map((row: any) => {
      const opp = row.opportunity;
      const computedStatus = computeOpportunityStatus(opp);
      
      // Filter by computed status if requested
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        if (!statuses.includes(computedStatus)) {
          return null;
        }
      }

      return {
        ...opp,
        computedStatus,
        participantCount: row.participantCount,
        isVerified: isVerifiedOpportunity(opp.creatorType),
        canParticipate: false,
      };
    }).filter(Boolean);

    return { opportunities: opportunitiesWithComputed, total: opportunitiesWithComputed.length };
  }, {
    query: t.Object({
      mode: t.Optional(t.Union([t.String(), t.Array(t.String())])),
      verified: t.Optional(t.String()),
      causeCategory: t.Optional(t.Union([t.String(), t.Array(t.String())])),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      skills: t.Optional(t.Union([t.String(), t.Array(t.String())])),
      status: t.Optional(t.Union([t.String(), t.Array(t.String())])),
      showPast: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    })
  })
  
  // Get single opportunity with details (Public)
  .get('/:id', async ({ params: { id } }) => {
    const result = await db
      .select({
        opportunity: opportunities,
        participantCount: sql<number>`COUNT(DISTINCT ${participations.id})::int`,
      })
      .from(opportunities)
      .leftJoin(participations, eq(opportunities.id, participations.opportunityId))
      .where(eq(opportunities.id, id))
      .groupBy(opportunities.id);

    if (result.length === 0) {
      throw new Error('Opportunity not found');
    }

    const opp = result[0].opportunity;
    const participantCount = result[0].participantCount;

    // Get creator info
    let creator = null;
    if (opp.creatorType === 'organization' && opp.organizationId) {
      const org = await db.select().from(organizations).where(eq(organizations.id, opp.organizationId)).limit(1);
      if (org.length > 0) {
        creator = { id: org[0].id, name: org[0].name, type: 'organization' as const };
      }
    } else if (opp.creatorType === 'volunteer') {
      const vol = await db.select().from(volunteers).where(eq(volunteers.id, opp.creatorId)).limit(1);
      if (vol.length > 0) {
        creator = { id: vol[0].id, name: vol[0].name, type: 'volunteer' as const };
      }
    } else if (opp.creatorType === 'admin') {
      const admin = await db.select().from(admins).where(eq(admins.id, opp.creatorId)).limit(1);
      if (admin.length > 0) {
        creator = { id: admin[0].id, name: admin[0].name, type: 'admin' as const };
      }
    }

    const oppConverted = dbToOpportunity(opp);
    
    const opportunityWithComputed: OpportunityWithComputed = {
      ...oppConverted,
      computedStatus: computeOpportunityStatus(oppConverted),
      participantCount,
      isVerified: isVerifiedOpportunity(oppConverted.creatorType),
      canParticipate: false,
      creator: creator || undefined,
    };

    return { opportunity: opportunityWithComputed };
  })
  
  // Create new opportunity (Protected - requires auth)
  .post('/', async ({ body, headers, set }: any) => {
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      if (!payload.id || !payload.type) {
        set.status = 401;
        return { error: 'Authentication required' };
      }

      log.info('Creating opportunity', { userId: payload.id, userType: payload.type, title: body.title });
      return await opportunityController.createOpportunity(body, payload.id, payload.type);
    } catch (error) {
      set.status = 401;
      return { error: 'Authentication required' };
    }
  }, {
    body: t.Object({
      title: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.title.minLength, 
        maxLength: OPPORTUNITY_VALIDATION.title.maxLength 
      }),
      shortSummary: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.shortSummary.minLength, 
        maxLength: OPPORTUNITY_VALIDATION.shortSummary.maxLength 
      }),
      description: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.description.minLength,
        maxLength: OPPORTUNITY_VALIDATION.description.maxLength
      }),
      causeCategory: t.String(),
      skillsRequired: t.Array(t.String()),
      languagePreferences: t.Array(t.String()),
      mode: t.Union([t.Literal('onsite'), t.Literal('remote'), t.Literal('hybrid')]),
      address: t.Optional(t.String()),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      country: t.Optional(t.String()),
      osrmLink: t.Optional(t.String()),
      dateType: t.Union([t.Literal('single_day'), t.Literal('multi_day'), t.Literal('ongoing')]),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      startTime: t.Optional(t.String()),
      endTime: t.Optional(t.String()),
      maxVolunteers: t.Optional(t.Number({ 
        minimum: OPPORTUNITY_VALIDATION.maxVolunteers.min,
        maximum: OPPORTUNITY_VALIDATION.maxVolunteers.max
      })),
      agePreference: t.Optional(t.String()),
      genderPreference: t.Optional(t.String()),
      certificateOffered: t.Boolean(),
      stipendInfo: t.Optional(t.String()),
      contactName: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.contactName.minLength 
      }),
      contactEmail: t.String(),
      contactPhone: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.contactPhone.minLength 
      }),
    })
  })
  
  // Update opportunity (Protected - only by creator)
  .patch('/:id', async ({ params: { id }, body, headers, set }: any) => {
    // Manual JWT verification
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      if (!payload.id) {
        set.status = 401;
        return { error: 'Authentication required' };
      }

      log.info('Updating opportunity', { opportunityId: id, userId: payload.id });
      return await opportunityController.updateOpportunity(id, body, payload.id);
    } catch (error) {
      set.status = 401;
      return { error: 'Authentication required' };
    }
  }, {
    body: t.Partial(t.Object({
      title: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.title.minLength, 
        maxLength: OPPORTUNITY_VALIDATION.title.maxLength 
      }),
      shortSummary: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.shortSummary.minLength, 
        maxLength: OPPORTUNITY_VALIDATION.shortSummary.maxLength 
      }),
      description: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.description.minLength,
        maxLength: OPPORTUNITY_VALIDATION.description.maxLength 
      }),
      causeCategory: t.String(),
      skillsRequired: t.Array(t.String()),
      languagePreferences: t.Array(t.String()),
      mode: t.Union([t.Literal('onsite'), t.Literal('remote'), t.Literal('hybrid')]),
      address: t.Optional(t.String()),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      country: t.Optional(t.String()),
      osrmLink: t.Optional(t.String()),
      dateType: t.Union([t.Literal('single_day'), t.Literal('multi_day'), t.Literal('ongoing')]),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      startTime: t.Optional(t.String()),
      endTime: t.Optional(t.String()),
      maxVolunteers: t.Optional(t.Number({ 
        minimum: OPPORTUNITY_VALIDATION.maxVolunteers.min,
        maximum: OPPORTUNITY_VALIDATION.maxVolunteers.max
      })),
      agePreference: t.Optional(t.String()),
      genderPreference: t.Optional(t.String()),
      certificateOffered: t.Boolean(),
      stipendInfo: t.Optional(t.String()),
      contactName: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.contactName.minLength 
      }),
      contactEmail: t.String(),
      contactPhone: t.String({ 
        minLength: OPPORTUNITY_VALIDATION.contactPhone.minLength 
      }),
      status: t.Union([t.Literal('draft'), t.Literal('active'), t.Literal('closed')]),
    }))
  })
  
  // Delete opportunity (Protected - only by creator)
  .delete('/:id', async ({ params: { id }, headers, set }: any) => {
    // Manual JWT verification
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return { error: 'Authentication required' };
    }

    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      if (!payload.id) {
        set.status = 401;
        return { error: 'Authentication required' };
      }

      log.info('Deleting opportunity', { opportunityId: id, userId: payload.id });
      return await opportunityController.deleteOpportunity(id, payload.id);
    } catch (error) {
      set.status = 401;
      return { error: 'Authentication required' };
    }
  });
