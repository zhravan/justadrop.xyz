import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { and, eq, isNotNull, sql, desc } from 'drizzle-orm';

export interface Volunteer {
  id: string;
  name: string | null;
  email: string;
  causes: string[];
  skills: Array<{ name: string; expertise: string }>;
}

export interface VolunteerFilters {
  causes?: string[];
  skills?: string[];
  limit?: number;
  offset?: number;
}

export class VolunteerRepository {
  async findMany(filters: VolunteerFilters): Promise<{ items: Volunteer[]; total: number }> {
    const { causes = [], skills = [], limit = 20, offset = 0 } = filters;

    const baseConditions = and(
      eq(users.isBanned, false),
      isNotNull(users.volunteering),
      sql`(${users.volunteering}->>'isInterest')::boolean = true`
    );

    let causesCondition = sql`true`;
    if (causes.length > 0) {
      const causesChecks = causes.map(
        (c) => sql`(${users.volunteering}->'causes') @> ${JSON.stringify([c])}::jsonb`
      );
      causesCondition = sql`(${sql.join(causesChecks, sql` OR `)})`;
    }

    let skillsCondition = sql`true`;
    if (skills.length > 0) {
      const skillsChecks = skills.map(
        (s) => sql`(${users.volunteering}->'skills') @> ${JSON.stringify([{ name: s }])}::jsonb`
      );
      skillsCondition = sql`(${sql.join(skillsChecks, sql` OR `)})`;
    }

    const conditions = and(baseConditions, causesCondition, skillsCondition);

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        volunteering: users.volunteering,
      })
      .from(users)
      .where(conditions)
      .orderBy(desc(users.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(conditions);

    const total = countResult[0]?.count ?? 0;

    const items: Volunteer[] = rows
      .filter((r) => r.volunteering && typeof r.volunteering === 'object')
      .map((r) => {
        const v = r.volunteering as { causes?: string[]; skills?: Array<{ name: string; expertise: string }> };
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          causes: v?.causes ?? [],
          skills: v?.skills ?? [],
        };
      });

    return { items, total };
  }
}
