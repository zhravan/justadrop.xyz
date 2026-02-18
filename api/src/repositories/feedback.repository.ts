import { db } from '../db/index.js';
import {
  volunteersFeedback,
  opportunitiesFeedback,
  opportunityApplications,
  opportunities,
} from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export class FeedbackRepository {
  async createOpportunityFeedback(
    userId: string,
    opportunityId: string,
    rating: number,
    images?: string[]
  ) {
    const id = createId();
    await db.insert(opportunitiesFeedback).values({
      id,
      userId,
      opportunityId,
      rating,
      images: images ?? [],
    } as any);
    return { id, userId, opportunityId, rating };
  }

  async createVolunteerFeedback(
    userId: string,
    volunteerId: string,
    opportunityId: string,
    rating: number,
    testimonial?: string
  ) {
    const id = createId();
    await db.insert(volunteersFeedback).values({
      id,
      userId,
      volunteerId,
      opportunityId,
      rating,
      testimonial: testimonial ?? null,
    } as any);
    return { id, userId, volunteerId, opportunityId, rating };
  }

  async hasOpportunityFeedback(userId: string, opportunityId: string): Promise<boolean> {
    const rows = await db
      .select()
      .from(opportunitiesFeedback)
      .where(
        and(
          eq(opportunitiesFeedback.userId, userId),
          eq(opportunitiesFeedback.opportunityId, opportunityId)
        )
      );
    return rows.length > 0;
  }

  async hasVolunteerFeedback(
    userId: string,
    volunteerId: string,
    opportunityId: string
  ): Promise<boolean> {
    const rows = await db
      .select()
      .from(volunteersFeedback)
      .where(
        and(
          eq(volunteersFeedback.userId, userId),
          eq(volunteersFeedback.volunteerId, volunteerId),
          eq(volunteersFeedback.opportunityId, opportunityId)
        )
      );
    return rows.length > 0;
  }
}
