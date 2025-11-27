import { Elysia, t } from 'elysia';
import { db, opportunities, participations, volunteers, organizations, admins } from '@justadrop/db';
import { eq, and, or, sql, inArray, gte, lte, desc, asc } from 'drizzle-orm';
import {
  computeOpportunityStatus,
  canParticipateInOpportunity,
  validateOpportunityDates,
  validateOpportunityMode,
  isVerifiedOpportunity,
} from '../utils/opportunity';
import type { OpportunityWithComputed, ParticipantType, Opportunity } from '@justadrop/types';
import { authMiddleware, requireAuth } from '../middleware/auth';

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
  // Get all opportunities with filters
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
      // Only show active, draft, or future opportunities
      // Exclude opportunities where status is 'closed' or end date is in the past
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

    // Apply sorting (handle both old and new sort values)
    const sortValue = sortBy || 'newest';
    if (sortValue === 'newest' || sortValue === 'createdAt') {
      queryBuilder = queryBuilder.orderBy(desc(opportunities.createdAt)) as any;
    } else if (sortValue === 'earliest') {
      queryBuilder = queryBuilder.orderBy(asc(opportunities.startDate)) as any;
    } else if (sortValue === 'popular') {
      queryBuilder = queryBuilder.orderBy(desc(sql`COUNT(DISTINCT ${participations.id})`)) as any;
    } else {
      // Default to newest if invalid sort value
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
        canParticipate: false, // Will be computed per user
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
  
  // Get single opportunity with details
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
  
  // Create new opportunity (requires auth)
  .post('/', async ({ body, headers, jwt }) => {
    // Extract and verify JWT token manually since derived context isn't working
    const authHeader = headers.authorization;
    console.log('[Backend] Received headers:', { authorization: authHeader ? 'present' : 'missing' });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authentication required');
    }

    const token = authHeader.substring(7);
    console.log('[Backend] Extracted token:', token.substring(0, 20) + '...');
    
    const payload = await jwt.verify(token) as any;
    console.log('[Backend] JWT payload:', payload);
    
    if (!payload || !payload.id || !payload.type) {
      throw new Error('Invalid authentication token');
    }
    
    const currentUserId = payload.id;
    const currentUserType = payload.type;
    console.log('[Backend] User authenticated:', { userId: currentUserId, userType: currentUserType });

    // Validate dates (convert to Date for validation only)
    let startDateObj: Date | undefined = undefined;
    let endDateObj: Date | undefined = undefined;
    
    if (body.startDate) {
      startDateObj = new Date(body.startDate);
    }
    if (body.endDate) {
      endDateObj = new Date(body.endDate);
    }
    
    const dateValidation = validateOpportunityDates(
      body.dateType,
      startDateObj!,
      endDateObj
    );

    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    // Validate mode/address
    const modeValidation = validateOpportunityMode(body.mode, body.address);
    if (!modeValidation.valid) {
      throw new Error(modeValidation.error);
    }

    // Set organizationId if creator is organization
    const organizationId = currentUserType === 'organization' ? currentUserId : undefined;

    // Convert date strings to Date objects for database
    const newOpportunity = await db.insert(opportunities).values({
      title: body.title,
      shortSummary: body.shortSummary,
      description: body.description,
      causeCategory: body.causeCategory,
      skillsRequired: body.skillsRequired,
      languagePreferences: body.languagePreferences,
      mode: body.mode,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      osrmLink: body.osrmLink,
      dateType: body.dateType,
      startDate: startDateObj!,
      endDate: endDateObj,
      startTime: body.startTime,
      endTime: body.endTime,
      maxVolunteers: body.maxVolunteers,
      agePreference: body.agePreference,
      genderPreference: body.genderPreference,
      certificateOffered: body.certificateOffered,
      stipendInfo: body.stipendInfo,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      creatorType: currentUserType,
      creatorId: currentUserId,
      organizationId: organizationId || null,
      status: 'active',
    }).returning();

    const created = dbToOpportunity(newOpportunity[0]);

    return {
      opportunity: {
        ...created,
        computedStatus: computeOpportunityStatus(created),
        participantCount: 0,
        isVerified: isVerifiedOpportunity(created.creatorType),
        canParticipate: false,
      }
    };
  }, {
    body: t.Object({
      title: t.String({ minLength: 3, maxLength: 200 }),
      shortSummary: t.String({ minLength: 10, maxLength: 500 }),
      description: t.String({ minLength: 50 }),
      causeCategory: t.String(),
      skillsRequired: t.Array(t.String()),
      languagePreferences: t.Array(t.String()),
      mode: t.Union([t.Literal('onsite'), t.Literal('remote'), t.Literal('hybrid')]),
      address: t.Optional(t.String()),
      city: t.String(),
      state: t.String(),
      country: t.String(),
      osrmLink: t.Optional(t.String()),
      dateType: t.Union([t.Literal('single_day'), t.Literal('multi_day'), t.Literal('ongoing')]),
      startDate: t.String(),
      endDate: t.Optional(t.String()),
      startTime: t.Optional(t.String()),
      endTime: t.Optional(t.String()),
      maxVolunteers: t.Optional(t.Number()),
      agePreference: t.Optional(t.String()),
      genderPreference: t.Optional(t.String()),
      certificateOffered: t.Boolean(),
      stipendInfo: t.Optional(t.String()),
      contactName: t.String(),
      contactEmail: t.String(),
      contactPhone: t.String(),
    })
  })
  
  // Update opportunity (only by creator)
  .patch('/:id', async ({ params: { id }, body, headers, jwt }) => {
    // Extract and verify JWT token
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authentication required');
    }

    const token = authHeader.substring(7);
    const payload = await jwt.verify(token) as any;
    
    if (!payload || !payload.id) {
      throw new Error('Invalid authentication token');
    }
    
    const currentUserId = payload.id;

    // Check if user is the creator
    const existing = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    
    if (existing.length === 0) {
      throw new Error('Opportunity not found');
    }

    if (existing[0].creatorId !== currentUserId) {
      throw new Error('Only the creator can update this opportunity');
    }

    const updated = await db.update(opportunities)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();

    return { opportunity: updated[0] };
  }, {
    body: t.Partial(t.Object({
      title: t.String(),
      shortSummary: t.String(),
      description: t.String(),
      status: t.Union([t.Literal('draft'), t.Literal('active'), t.Literal('closed')]),
    }))
  })
  
  // Delete opportunity (only by creator)
  .delete('/:id', async ({ params: { id }, headers, jwt }) => {
    // Extract and verify JWT token
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authentication required');
    }

    const token = authHeader.substring(7);
    const payload = await jwt.verify(token) as any;
    
    if (!payload || !payload.id) {
      throw new Error('Invalid authentication token');
    }
    
    const currentUserId = payload.id;

    const existing = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    
    if (existing.length === 0) {
      throw new Error('Opportunity not found');
    }

    if (existing[0].creatorId !== currentUserId) {
      throw new Error('Only the creator can delete this opportunity');
    }

    await db.delete(opportunities).where(eq(opportunities.id, id));
    return { message: 'Opportunity deleted successfully' };
  });
