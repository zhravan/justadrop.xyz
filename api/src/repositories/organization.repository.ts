import { db } from '../db/index.js';
import { organizations, organizationMembers } from '../db/schema.js';
import { eq, inArray, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export interface Organization {
  id: string;
  createdBy: string;
  orgName: string;
  description: string | null;
  causes: string[];
  website: string | null;
  registrationNumber: string | null;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationRepository {
  async create(data: {
    createdBy: string;
    orgName: string;
    description?: string;
    causes?: string[];
    website?: string;
    registrationNumber?: string;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }): Promise<Organization> {
    const id = createId();
    await db.insert(organizations).values({
      id,
      createdBy: data.createdBy,
      orgName: data.orgName,
      description: data.description ?? null,
      causes: data.causes ?? [],
      website: data.website ?? null,
      registrationNumber: data.registrationNumber ?? null,
      contactPersonName: data.contactPersonName,
      contactPersonEmail: data.contactPersonEmail,
      contactPersonNumber: data.contactPersonNumber ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? 'India',
    });

    // Add creator as owner
    await db.insert(organizationMembers).values({
      id: createId(),
      organizationId: id,
      userId: data.createdBy,
      role: 'owner',
    });

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    });

    if (!org) throw new Error('Failed to create organization');

    return {
      id: org.id,
      createdBy: org.createdBy,
      orgName: org.orgName,
      description: org.description,
      causes: org.causes,
      website: org.website,
      registrationNumber: org.registrationNumber,
      contactPersonName: org.contactPersonName,
      contactPersonEmail: org.contactPersonEmail,
      contactPersonNumber: org.contactPersonNumber,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  async findById(id: string): Promise<Organization | null> {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    });
    if (!org) return null;
    return {
      id: org.id,
      createdBy: org.createdBy,
      orgName: org.orgName,
      description: org.description,
      causes: org.causes,
      website: org.website,
      registrationNumber: org.registrationNumber,
      contactPersonName: org.contactPersonName,
      contactPersonEmail: org.contactPersonEmail,
      contactPersonNumber: org.contactPersonNumber,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const createdByOrgs = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.createdBy, userId));
    const memberOrgs = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    const orgIds = [
      ...new Set([
        ...createdByOrgs.map((o) => o.id),
        ...memberOrgs.map((m) => m.organizationId),
      ]),
    ];
    if (orgIds.length === 0) return [];
    const list = await db.query.organizations.findMany({
      where: inArray(organizations.id, orgIds),
    });
    return list.map((org) => ({
      id: org.id,
      createdBy: org.createdBy,
      orgName: org.orgName,
      description: org.description,
      causes: org.causes,
      website: org.website,
      registrationNumber: org.registrationNumber,
      contactPersonName: org.contactPersonName,
      contactPersonEmail: org.contactPersonEmail,
      contactPersonNumber: org.contactPersonNumber,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));
  }

  async hasManageAccess(ngoId: string, userId: string): Promise<boolean> {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, ngoId),
    });
    if (!org) return false;
    if (org.createdBy === userId) return true;
    const members = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, ngoId),
          eq(organizationMembers.userId, userId)
        )
      );
    const member = members[0];
    return member != null && (member.role === 'owner' || member.role === 'admin');
  }

  async findByCreatedBy(userId: string): Promise<Organization[]> {
    const list = await db.query.organizations.findMany({
      where: eq(organizations.createdBy, userId),
    });
    return list.map((org) => ({
      id: org.id,
      createdBy: org.createdBy,
      orgName: org.orgName,
      description: org.description,
      causes: org.causes,
      website: org.website,
      registrationNumber: org.registrationNumber,
      contactPersonName: org.contactPersonName,
      contactPersonEmail: org.contactPersonEmail,
      contactPersonNumber: org.contactPersonNumber,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      verificationStatus: org.verificationStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));
  }
}
