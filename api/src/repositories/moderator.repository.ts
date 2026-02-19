import { db, moderators, users } from '../db/index.js';
import type { VolunteeringData } from '../db/schema.js';
import { count, eq } from 'drizzle-orm';
import type { User } from './user.repository.js';

export interface Moderator {
  id: string;
  userId: string;
  isActive: boolean;
  assignedRegions: string[] | null;
  createdAt: Date;
  updatedAt: Date;

  user: User;
}

export class ModeratorRepository {
  async getTotalModerators(): Promise<number> {
    const moderatorCount = await db.select({ value: count() }).from(moderators);

    return moderatorCount[0].value;
  }

  private buildModerator(row: {
    moderator: typeof moderators.$inferSelect;
    user: typeof users.$inferSelect | null;
  }): Moderator {
    if (!row.user) {
      throw new Error('User is required to build moderator');
    }

    const u = row.user as unknown as User;

    return {
      id: row.moderator.id,
      userId: row.moderator.userId,
      isActive: row.moderator.isActive,
      assignedRegions: row.moderator.assignedRegions,
      createdAt: row.moderator.createdAt,
      updatedAt: row.moderator.updatedAt,
      user: {
        id: u.id,
        email: u.email,
        emailVerified: u.emailVerified,
        name: u.name,
        phone: u.phone,
        gender: u.gender,
        isBanned: u.isBanned,
        volunteering: u.volunteering as VolunteeringData | null,
        deletedAt: u.deletedAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    };
  }

  async findById(id: string): Promise<Moderator | null> {
    const result = await db
      .select({
        moderator: moderators,
        user: users,
      })
      .from(moderators)
      .leftJoin(users, eq(users.id, moderators.userId))
      .where(eq(moderators.id, id))
      .limit(1);

    const row = result[0];
    if (!row || !row.user) return null;

    return this.buildModerator(row);
  }

  async findByUserId(userId: string): Promise<Moderator | null> {
    const result = await db
      .select({
        moderator: moderators,
        user: users,
      })
      .from(moderators)
      .leftJoin(users, eq(users.id, moderators.userId))
      .where(eq(moderators.userId, userId))
      .limit(1);

    const row = result[0];
    if (!row || !row.user) return null;

    return this.buildModerator(row);
  }
}
