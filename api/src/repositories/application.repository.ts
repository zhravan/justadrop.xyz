import { db } from '../db/index.js';
import {
  opportunityApplications,
  opportunities,
  organizations,
  users,
} from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  motivationDescription: string | null;
  status: string;
  hasAttended: boolean;
  approvedAt: Date | null;
  approvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithUser extends Application {
  userName: string | null;
  userEmail: string;
}

export interface ApplicationWithOpportunity extends Application {
  opportunityTitle: string;
  opportunityStartDate: Date | null;
  opportunityEndDate: Date | null;
  orgName: string;
}

function rowToApplication(row: typeof opportunityApplications.$inferSelect): Application {
  return {
    id: row.id,
    userId: row.userId,
    opportunityId: row.opportunityId,
    motivationDescription: row.motivationDescription,
    status: row.status,
    hasAttended: row.hasAttended,
    approvedAt: row.approvedAt,
    approvedBy: row.approvedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class ApplicationRepository {
  async create(
    opportunityId: string,
    userId: string,
    motivationDescription?: string
  ): Promise<Application> {
    const id = createId();
    const inserted = await db
      .insert(opportunityApplications)
      .values({
        id,
        opportunityId,
        userId,
        motivationDescription: motivationDescription ?? null,
      } as any)
      .returning();
    const row = inserted[0];
    if (!row) throw new Error('Failed to create application');
    return rowToApplication(row);
  }

  async findByOpportunity(opportunityId: string): Promise<ApplicationWithUser[]> {
    const rows = await db
      .select({
        app: opportunityApplications,
        userName: users.name,
        userEmail: users.email,
      })
      .from(opportunityApplications)
      .innerJoin(users, eq(opportunityApplications.userId, users.id))
      .where(eq(opportunityApplications.opportunityId, opportunityId))
      .orderBy(desc(opportunityApplications.createdAt));
    return rows.map((r) => ({
      ...rowToApplication(r.app),
      userName: r.userName,
      userEmail: r.userEmail,
    }));
  }

  async findByUser(userId: string): Promise<ApplicationWithOpportunity[]> {
    const rows = await db
      .select({
        app: opportunityApplications,
        opportunityTitle: opportunities.title,
        opportunityStartDate: opportunities.startDate,
        opportunityEndDate: opportunities.endDate,
        orgName: organizations.orgName,
      })
      .from(opportunityApplications)
      .innerJoin(opportunities, eq(opportunityApplications.opportunityId, opportunities.id))
      .innerJoin(organizations, eq(opportunities.ngoId, organizations.id))
      .where(eq(opportunityApplications.userId, userId))
      .orderBy(desc(opportunityApplications.createdAt));
    return rows.map((r) => ({
      ...rowToApplication(r.app),
      opportunityTitle: r.opportunityTitle,
      opportunityStartDate: r.opportunityStartDate,
      opportunityEndDate: r.opportunityEndDate,
      orgName: r.orgName,
    }));
  }

  async findById(id: string): Promise<Application | null> {
    const rows = await db
      .select()
      .from(opportunityApplications)
      .where(eq(opportunityApplications.id, id));
    const row = rows[0];
    return row ? rowToApplication(row) : null;
  }

  async findByOpportunityAndUser(
    opportunityId: string,
    userId: string
  ): Promise<Application | null> {
    const rows = await db
      .select()
      .from(opportunityApplications)
      .where(
        and(
          eq(opportunityApplications.opportunityId, opportunityId),
          eq(opportunityApplications.userId, userId)
        )
      );
    const row = rows[0];
    return row ? rowToApplication(row) : null;
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string
  ): Promise<Application | null> {
    const updated = await db
      .update(opportunityApplications)
      .set({
        status,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .where(eq(opportunityApplications.id, id))
      .returning();
    const row = updated[0];
    return row ? rowToApplication(row) : null;
  }

  async markAttended(id: string, hasAttended: boolean): Promise<Application | null> {
    const updated = await db
      .update(opportunityApplications)
      .set({
        hasAttended,
        updatedAt: new Date(),
      } as any)
      .where(eq(opportunityApplications.id, id))
      .returning();
    const row = updated[0];
    return row ? rowToApplication(row) : null;
  }
}
