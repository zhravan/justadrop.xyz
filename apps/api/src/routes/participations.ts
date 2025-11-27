import { Elysia, t } from 'elysia';
import { db, participations, opportunities, volunteers, admins } from '@justadrop/db';
import { eq, and, sql } from 'drizzle-orm';
import { canParticipateInOpportunity, computeOpportunityStatus } from '../utils/opportunity';
import type { ParticipationWithDetails } from '@justadrop/types';
import { requireAuth } from '../middleware/auth';

export const participationsRouter = new Elysia({ prefix: '/participations', tags: ['participations'] })
  .use(requireAuth)
  // Apply to opportunity
  .post('/opportunities/:opportunityId/participate', async ({ params: { opportunityId }, body, userId, userType }) => {
    const currentUserId = userId!;
    const currentUserType = userType!;

    // Get opportunity with participant count
    const oppResult = await db
      .select({
        opportunity: opportunities,
        participantCount: sql<number>`COUNT(DISTINCT ${participations.id})::int`,
      })
      .from(opportunities)
      .leftJoin(participations, eq(opportunities.id, participations.opportunityId))
      .where(eq(opportunities.id, opportunityId))
      .groupBy(opportunities.id);

    if (oppResult.length === 0) {
      throw new Error('Opportunity not found');
    }

    const opp = oppResult[0].opportunity;
    const participantCount = oppResult[0].participantCount;

    // Check if already participated
    const existing = await db
      .select()
      .from(participations)
      .where(
        and(
          eq(participations.opportunityId, opportunityId),
          eq(participations.participantId, currentUserId)
        )
      )
      .limit(1);

    const canParticipate = canParticipateInOpportunity(
      { ...opp, participantCount },
      currentUserId,
      currentUserType,
      existing.length > 0
    );

    if (!canParticipate) {
      throw new Error('Cannot participate in this opportunity');
    }

    // Create participation
    const newParticipation = await db
      .insert(participations)
      .values({
        participantType: currentUserType as 'admin' | 'volunteer',
        participantId: currentUserId,
        opportunityId,
        message: body.message,
        status: 'pending',
      })
      .returning();

    return newParticipation[0];
  }, {
    body: t.Object({
      message: t.Optional(t.String()),
    })
  })

  // Get my participations
  .get('/my-participations', async ({ userId, userType, query }) => {
    const currentUserId = userId!;
    const currentUserType = userType!;

    const { status } = query;

    let queryBuilder = db
      .select({
        participation: participations,
        opportunity: opportunities,
      })
      .from(participations)
      .innerJoin(opportunities, eq(participations.opportunityId, opportunities.id))
      .where(eq(participations.participantId, currentUserId));

    if (status) {
      queryBuilder = queryBuilder.where(
        and(
          eq(participations.participantId, currentUserId),
          eq(participations.status, status)
        )
      ) as any;
    }

    const results = await queryBuilder;

    const participationsWithDetails: ParticipationWithDetails[] = results.map((row) => ({
      ...row.participation,
      opportunity: {
        ...row.opportunity,
        computedStatus: computeOpportunityStatus(row.opportunity),
        participantCount: 0,
        isVerified: row.opportunity.creatorType === 'organization',
        canParticipate: false,
      },
    }));

    return { participations: participationsWithDetails };
  }, {
    query: t.Object({
      status: t.Optional(t.Union([t.Literal('pending'), t.Literal('accepted'), t.Literal('rejected')])),
    })
  })

  // Get my created opportunities
  .get('/my-opportunities', async ({ userId, userType }) => {
    const currentUserId = userId!;
    const currentUserType = userType!;

    const results = await db
      .select({
        opportunity: opportunities,
        participantCount: sql<number>`COUNT(DISTINCT ${participations.id})::int`,
      })
      .from(opportunities)
      .leftJoin(participations, eq(opportunities.id, participations.opportunityId))
      .where(eq(opportunities.creatorId, currentUserId))
      .groupBy(opportunities.id);

    const opportunitiesWithComputed = results.map((row) => ({
      ...row.opportunity,
      computedStatus: computeOpportunityStatus(row.opportunity),
      participantCount: row.participantCount,
      isVerified: row.opportunity.creatorType === 'organization',
      canParticipate: false,
    }));

    return { opportunities: opportunitiesWithComputed };
  })

  // Get participants for an opportunity (creator only)
  .get('/opportunities/:opportunityId/participants', async ({ params: { opportunityId }, userId }) => {
    const currentUserId = userId!;

    // Verify user is the creator
    const opp = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId)).limit(1);

    if (opp.length === 0) {
      throw new Error('Opportunity not found');
    }

    if (opp[0].creatorId !== currentUserId) {
      throw new Error('Only the creator can view participants');
    }

    const results = await db
      .select({
        participation: participations,
      })
      .from(participations)
      .where(eq(participations.opportunityId, opportunityId));

    // Fetch participant details
    const participantsWithDetails = await Promise.all(
      results.map(async (row) => {
        let participant = null;

        if (row.participation.participantType === 'volunteer') {
          const vol = await db.select().from(volunteers).where(eq(volunteers.id, row.participation.participantId)).limit(1);
          if (vol.length > 0) {
            participant = { id: vol[0].id, name: vol[0].name, type: 'volunteer' as const };
          }
        } else if (row.participation.participantType === 'admin') {
          const admin = await db.select().from(admins).where(eq(admins.id, row.participation.participantId)).limit(1);
          if (admin.length > 0) {
            participant = { id: admin[0].id, name: admin[0].name, type: 'admin' as const };
          }
        }

        return {
          ...row.participation,
          participant,
        };
      })
    );

    return {
      participants: participantsWithDetails,
      total: results.length,
      maxVolunteers: opp[0].maxVolunteers,
    };
  })

  // Update participation status (creator only)
  .patch('/:participationId/status', async ({ params: { participationId }, body, userId }) => {
    const currentUserId = userId!;

    // Get participation and opportunity
    const result = await db
      .select({
        participation: participations,
        opportunity: opportunities,
      })
      .from(participations)
      .innerJoin(opportunities, eq(participations.opportunityId, opportunities.id))
      .where(eq(participations.id, participationId))
      .limit(1);

    if (result.length === 0) {
      throw new Error('Participation not found');
    }

    const { participation, opportunity } = result[0];

    if (opportunity.creatorId !== currentUserId) {
      throw new Error('Only the opportunity creator can update participation status');
    }

    const updated = await db
      .update(participations)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(participations.id, participationId))
      .returning();

    return updated[0];
  }, {
    body: t.Object({
      status: t.Union([t.Literal('pending'), t.Literal('accepted'), t.Literal('rejected')]),
    })
  })

  // Cancel participation (participant only)
  .delete('/:participationId', async ({ params: { participationId }, userId }) => {
    const currentUserId = userId!;

    const participation = await db
      .select()
      .from(participations)
      .where(eq(participations.id, participationId))
      .limit(1);

    if (participation.length === 0) {
      throw new Error('Participation not found');
    }

    if (participation[0].participantId !== currentUserId) {
      throw new Error('You can only cancel your own participation');
    }

    await db.delete(participations).where(eq(participations.id, participationId));

    return { success: true };
  });
