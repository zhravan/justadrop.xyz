import { db } from '../db/index.js';
import {
  opportunities,
  organizations,
  organizationMembers,
} from '../db/schema.js';
import { eq, and, gte, lte, sql, or, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const TZ = 'Asia/Kolkata';

export interface Opportunity {
  id: string;
  ngoId: string;
  userCreatedBy: string;
  userUpdatedBy: string | null;
  title: string;
  description: string;
  causeCategoryNames: string[];
  requiredSkills: string[];
  maxVolunteers: number | null;
  minVolunteers: number | null;
  languagePreference: string | null;
  genderPreference: string | null;
  startDate: Date | null;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  opportunityMode: string;
  osrmLink: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  contactName: string;
  contactPhoneNumber: string | null;
  contactEmail: string;
  stipendInfo: { amount?: number; duration?: string } | null;
  isCertificateOffered: boolean;
  bannerImage: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityWithOrg extends Opportunity {
  orgName: string;
  orgVerificationStatus: string;
}

export interface ListFilters {
  status?: string;
  ngoId?: string;
  city?: string;
  state?: string;
  country?: string;
  causes?: string[];
  opportunityMode?: string;
  includePast?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  limit?: number;
  offset?: number;
}

function rowToOpportunity(row: typeof opportunities.$inferSelect): Opportunity {
  return {
    id: row.id,
    ngoId: row.ngoId,
    userCreatedBy: row.userCreatedBy,
    userUpdatedBy: row.userUpdatedBy,
    title: row.title,
    description: row.description,
    causeCategoryNames: row.causeCategoryNames,
    requiredSkills: row.requiredSkills ?? [],
    maxVolunteers: row.maxVolunteers,
    minVolunteers: row.minVolunteers,
    languagePreference: row.languagePreference,
    genderPreference: row.genderPreference,
    startDate: row.startDate,
    endDate: row.endDate,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status,
    opportunityMode: row.opportunityMode,
    osrmLink: row.osrmLink,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    contactName: row.contactName,
    contactPhoneNumber: row.contactPhoneNumber,
    contactEmail: row.contactEmail,
    stipendInfo: row.stipendInfo,
    isCertificateOffered: row.isCertificateOffered,
    bannerImage: row.bannerImage,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class OpportunityRepository {
  async create(data: {
    ngoId: string;
    userCreatedBy: string;
    title: string;
    description: string;
    causeCategoryNames?: string[];
    requiredSkills?: string[];
    maxVolunteers?: number;
    minVolunteers?: number;
    languagePreference?: string;
    genderPreference?: string;
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    status?: string;
    opportunityMode: string;
    osrmLink?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    contactName: string;
    contactPhoneNumber?: string;
    contactEmail: string;
    stipendInfo?: { amount?: number; duration?: string };
    isCertificateOffered?: boolean;
    bannerImage?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Opportunity> {
    const inserted = await db
      .insert(opportunities)
      .values({
        ngoId: data.ngoId,
        userCreatedBy: data.userCreatedBy,
        title: data.title,
        description: data.description,
        causeCategoryNames: data.causeCategoryNames ?? [],
        requiredSkills: data.requiredSkills ?? [],
        maxVolunteers: data.maxVolunteers ?? null,
        minVolunteers: data.minVolunteers ?? null,
        languagePreference: data.languagePreference ?? null,
        genderPreference: data.genderPreference ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        status: (data.status ?? 'draft') as 'draft' | 'active' | 'completed' | 'cancelled',
        opportunityMode: data.opportunityMode as 'onsite' | 'remote' | 'hybrid',
        osrmLink: data.osrmLink ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? 'India',
        contactName: data.contactName,
        contactPhoneNumber: data.contactPhoneNumber ?? null,
        contactEmail: data.contactEmail,
        stipendInfo: data.stipendInfo ?? null,
        isCertificateOffered: data.isCertificateOffered ?? false,
        bannerImage: data.bannerImage ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      } as any)
      .returning();
    const row = inserted[0];
    if (!row) throw new Error('Failed to create opportunity');
    return rowToOpportunity(row);
  }

  async findById(id: string): Promise<OpportunityWithOrg | null> {
    const rows = await db
      .select({
        opp: opportunities,
        orgName: organizations.orgName,
        orgVerificationStatus: organizations.verificationStatus,
      })
      .from(opportunities)
      .innerJoin(organizations, eq(opportunities.ngoId, organizations.id))
      .where(eq(opportunities.id, id));
    const row = rows[0];
    if (!row) return null;
    return {
      ...rowToOpportunity(row.opp),
      orgName: row.orgName,
      orgVerificationStatus: row.orgVerificationStatus,
    };
  }

  async findMany(filters: ListFilters): Promise<{ items: OpportunityWithOrg[]; total: number }> {
    const {
      status = 'active',
      ngoId,
      city,
      state,
      country,
      causes,
      opportunityMode,
      includePast = false,
      startDateFrom,
      startDateTo,
      limit = 20,
      offset = 0,
    } = filters;

    const conditions = [eq(opportunities.status, status as 'draft' | 'active' | 'completed' | 'cancelled')];

    if (ngoId) conditions.push(eq(opportunities.ngoId, ngoId));
    if (startDateFrom) conditions.push(gte(opportunities.startDate, startDateFrom));
    if (startDateTo) conditions.push(lte(opportunities.startDate, startDateTo));
    if (city) conditions.push(eq(opportunities.city, city));
    if (opportunityMode) conditions.push(eq(opportunities.opportunityMode, opportunityMode as 'onsite' | 'remote' | 'hybrid'));
    if (state) conditions.push(eq(opportunities.state, state));
    if (country) conditions.push(eq(opportunities.country, country));
    if (causes && causes.length > 0) {
      conditions.push(sql`${opportunities.causeCategoryNames} && ARRAY[${sql.join(causes.map((c) => sql`${c}`), sql`, `)}]::text[]`);
    }

    if (!includePast) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStr = todayStart.toISOString();
      conditions.push(
        sql`(${opportunities.endDate} >= ${todayStr}::timestamp OR (${opportunities.endDate} IS NULL AND ${opportunities.startDate} >= ${todayStr}::timestamp))`
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const rows = await db
      .select({
        opp: opportunities,
        orgName: organizations.orgName,
        orgVerificationStatus: organizations.verificationStatus,
      })
      .from(opportunities)
      .innerJoin(organizations, eq(opportunities.ngoId, organizations.id))
      .where(whereClause)
      .orderBy(desc(opportunities.startDate))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunities)
      .innerJoin(organizations, eq(opportunities.ngoId, organizations.id))
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    const items: OpportunityWithOrg[] = rows.map((r) => ({
      ...rowToOpportunity(r.opp),
      orgName: r.orgName,
      orgVerificationStatus: r.orgVerificationStatus,
    }));

    return { items, total };
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      causeCategoryNames: string[];
      requiredSkills: string[];
      maxVolunteers: number;
      minVolunteers: number;
      startDate: Date;
      endDate: Date;
      startTime: string;
      endTime: string;
      status: string;
      opportunityMode: string;
      address: string;
      city: string;
      state: string;
      contactName: string;
      contactEmail: string;
      latitude: number;
      longitude: number;
    }>,
    userUpdatedBy: string
  ): Promise<Opportunity | null> {
    const updates: Record<string, unknown> = { ...data, userUpdatedBy, updatedAt: new Date() };
    await db.update(opportunities).set(updates as any).where(eq(opportunities.id, id));
    const row = await db.query.opportunities.findFirst({
      where: eq(opportunities.id, id),
    });
    return row ? rowToOpportunity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(opportunities).where(eq(opportunities.id, id)).returning();
    return result.length > 0;
  }
}
