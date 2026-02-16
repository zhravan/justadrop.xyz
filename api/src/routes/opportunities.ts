import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';
import { authMiddleware } from '../middleware/auth.middleware';
import { optionalAuthMiddleware } from '../middleware/optional-auth.middleware.js';
import { CAUSE_VALUES } from '../constants/causes.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

const opportunityRepository = container.getRepositories().opportunity;
const organizationRepository = container.getRepositories().organization;
const applicationRepository = container.getRepositories().application;
const userRepository = container.getRepositories().user;
const feedbackRepository = container.getRepositories().feedback;

const causeSchema = t.Array(t.String({ pattern: `^(${CAUSE_VALUES.join('|')})$` }));
const modeSchema = t.Union([
  t.Literal('onsite'),
  t.Literal('remote'),
  t.Literal('hybrid'),
]);
const statusSchema = t.Union([
  t.Literal('draft'),
  t.Literal('active'),
  t.Literal('completed'),
  t.Literal('cancelled'),
]);

export const opportunitiesRouter = new Elysia({ prefix: '/opportunities', tags: ['opportunities'] })
  .use(cookie())
  .get(
    '/',
    async ({ query }) => {
      const { status, ngoId, city, state, country, causes, opportunityMode, includePast, startDateFrom, startDateTo, limit, offset } = query;
      const filters: any = {
        status: status ?? 'active',
        ngoId,
        city,
        state,
        country,
        causes: causes ? (Array.isArray(causes) ? causes : [causes]) : undefined,
        opportunityMode: opportunityMode || undefined,
        includePast: includePast === 'true' || includePast === true,
        startDateFrom: startDateFrom ? new Date(String(startDateFrom)) : undefined,
        startDateTo: startDateTo ? new Date(String(startDateTo)) : undefined,
        limit: limit ? parseInt(String(limit), 10) : 20,
        offset: offset ? parseInt(String(offset), 10) : 0,
      };
      const result = await opportunityRepository.findMany(filters);
      return { opportunities: result.items, total: result.total };
    },
    {
      query: t.Object({
        status: t.Optional(statusSchema),
        ngoId: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        country: t.Optional(t.String()),
        causes: t.Optional(t.Union([t.String(), t.Array(t.String())])),
        opportunityMode: t.Optional(t.Union([t.Literal('onsite'), t.Literal('remote'), t.Literal('hybrid')])),
        includePast: t.Optional(t.Union([t.Boolean(), t.String()])),
        startDateFrom: t.Optional(t.String()),
        startDateTo: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    }
  )
  .use(optionalAuthMiddleware)
  .get(
    '/:id',
    async (ctx: any) => {
      const { params, userId } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oppEnd = opp.endDate ? new Date(opp.endDate) : opp.startDate ? new Date(opp.startDate) : null;
      if (oppEnd && oppEnd < today) {
        if (!userId) throw new NotFoundError('Opportunity not found');
        const hasAccess = await organizationRepository.hasManageAccess(opp.ngoId, userId);
        if (!hasAccess) throw new NotFoundError('Opportunity not found');
      }
      return { opportunity: opp };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .use(authMiddleware)
  .post(
    '/',
    async (ctx: any) => {
      const { userId, body } = ctx;
      const hasAccess = await organizationRepository.hasManageAccess(body.ngoId, userId);
      if (!hasAccess) throw new ForbiddenError('You do not have permission to create opportunities for this organization');

      if (body.status === 'active') {
        const org = await organizationRepository.findById(body.ngoId);
        if (!org || org.verificationStatus !== 'verified') {
          throw new ForbiddenError('Only verified organizations can publish active opportunities');
        }
      }

      const opportunity = await opportunityRepository.create({
        ...body,
        userCreatedBy: userId,
        causeCategoryNames: body.causeCategoryNames ?? [],
        requiredSkills: body.requiredSkills ?? [],
        startDate: body.startDate ? (typeof body.startDate === 'string' ? new Date(body.startDate) : body.startDate) : undefined,
        endDate: body.endDate ? (typeof body.endDate === 'string' ? new Date(body.endDate) : body.endDate) : undefined,
      });
      return { opportunity };
    },
    {
      body: t.Object({
        ngoId: t.String(),
        title: t.String({ minLength: 1 }),
        description: t.String({ minLength: 1 }),
        causeCategoryNames: t.Optional(causeSchema),
        requiredSkills: t.Optional(t.Array(t.String())),
        maxVolunteers: t.Optional(t.Number()),
        minVolunteers: t.Optional(t.Number()),
        startDate: t.Optional(t.Union([t.Date(), t.String()])),
        endDate: t.Optional(t.Union([t.Date(), t.String()])),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        status: t.Optional(statusSchema),
        opportunityMode: modeSchema,
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        country: t.Optional(t.String()),
        contactName: t.String({ minLength: 1 }),
        contactPhoneNumber: t.Optional(t.String()),
        contactEmail: t.String({ format: 'email' }),
        stipendInfo: t.Optional(t.Object({
          amount: t.Optional(t.Number()),
          duration: t.Optional(t.String()),
        })),
        isCertificateOffered: t.Optional(t.Boolean()),
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
      }),
    }
  )
  .patch(
    '/:id',
    async (ctx: any) => {
      const { userId, params, body } = ctx;
      const existing = await opportunityRepository.findById(params.id);
      if (!existing) throw new NotFoundError('Opportunity not found');
      const hasAccess = await organizationRepository.hasManageAccess(existing.ngoId, userId);
      if (!hasAccess) throw new ForbiddenError('You do not have permission to update this opportunity');
      const updateData: any = { ...body };
      if (body.startDate) updateData.startDate = typeof body.startDate === 'string' ? new Date(body.startDate) : body.startDate;
      if (body.endDate) updateData.endDate = typeof body.endDate === 'string' ? new Date(body.endDate) : body.endDate;
      const updated = await opportunityRepository.update(params.id, updateData, userId);
      return { opportunity: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.String({ minLength: 1 })),
        causeCategoryNames: t.Optional(causeSchema),
        requiredSkills: t.Optional(t.Array(t.String())),
        maxVolunteers: t.Optional(t.Number()),
        minVolunteers: t.Optional(t.Number()),
        startDate: t.Optional(t.Union([t.Date(), t.String()])),
        endDate: t.Optional(t.Union([t.Date(), t.String()])),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        status: t.Optional(statusSchema),
        opportunityMode: t.Optional(modeSchema),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        country: t.Optional(t.String()),
        contactName: t.Optional(t.String()),
        contactPhoneNumber: t.Optional(t.String()),
        contactEmail: t.Optional(t.String({ format: 'email' })),
        stipendInfo: t.Optional(t.Object({
          amount: t.Optional(t.Number()),
          duration: t.Optional(t.String()),
        })),
        isCertificateOffered: t.Optional(t.Boolean()),
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
      }),
    }
  )
  .delete(
    '/:id',
    async (ctx: any) => {
      const { userId, params } = ctx;
      const existing = await opportunityRepository.findById(params.id);
      if (!existing) throw new NotFoundError('Opportunity not found');
      const hasAccess = await organizationRepository.hasManageAccess(existing.ngoId, userId);
      if (!hasAccess) throw new ForbiddenError('You do not have permission to delete this opportunity');
      await opportunityRepository.delete(params.id);
      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/:id/apply',
    async (ctx: any) => {
      const { userId, params, body } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      if (opp.status !== 'active') throw new ForbiddenError('This opportunity is not accepting applications');
      const existing = await applicationRepository.findByOpportunityAndUser(params.id, userId);
      if (existing) throw new ForbiddenError('You have already applied to this opportunity');
      const user = await userRepository.findById(userId);
      if (!user?.volunteering?.isInterest) throw new ForbiddenError('Please complete your volunteer profile to apply');
      const application = await applicationRepository.create(
        params.id,
        userId,
        body.motivationDescription
      );
      return { application };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        motivationDescription: t.Optional(t.String()),
      }),
    }
  )
  .get(
    '/:id/attendees',
    async (ctx: any) => {
      const { userId, params } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const hasAccess = await organizationRepository.hasManageAccess(opp.ngoId, userId);
      const myApp = await applicationRepository.findByOpportunityAndUser(params.id, userId);
      const iAttended = myApp && myApp.status === 'approved' && myApp.hasAttended;
      if (!hasAccess && !iAttended) {
        throw new ForbiddenError('Only NGO staff or volunteers who attended can view attendees');
      }
      const applications = await applicationRepository.findByOpportunity(params.id);
      const attended = applications.filter((a) => a.status === 'approved' && a.hasAttended);
      return {
        attendees: attended.map((a) => ({
          userId: a.userId,
          userName: a.userName,
          userEmail: a.userEmail,
        })),
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    '/:id/applications',
    async (ctx: any) => {
      const { userId, params } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const hasAccess = await organizationRepository.hasManageAccess(opp.ngoId, userId);
      if (!hasAccess) throw new ForbiddenError('You do not have permission to view these applications');
      const applications = await applicationRepository.findByOpportunity(params.id);
      return { applications };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/:id/feedback',
    async (ctx: any) => {
      const { userId, params, body } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oppEnd = opp.endDate ? new Date(opp.endDate) : opp.startDate ? new Date(opp.startDate) : null;
      if (!oppEnd || oppEnd >= today) {
        throw new ForbiddenError('Feedback is only available after the opportunity has ended');
      }
      const app = await applicationRepository.findByOpportunityAndUser(params.id, userId);
      if (!app || app.status !== 'approved' || !app.hasAttended) {
        throw new ForbiddenError('Only volunteers who attended can rate this opportunity');
      }
      const existing = await feedbackRepository.hasOpportunityFeedback(userId, params.id);
      if (existing) throw new ForbiddenError('You have already rated this opportunity');
      const result = await feedbackRepository.createOpportunityFeedback(
        userId,
        params.id,
        body.rating,
        body.images
      );
      return { feedback: result };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
        images: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .post(
    '/:id/volunteers/:volunteerId/feedback',
    async (ctx: any) => {
      const { userId, params, body } = ctx;
      const opp = await opportunityRepository.findById(params.id);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oppEnd = opp.endDate ? new Date(opp.endDate) : opp.startDate ? new Date(opp.startDate) : null;
      if (!oppEnd || oppEnd >= today) {
        throw new ForbiddenError('Feedback is only available after the opportunity has ended');
      }
      const volunteerApp = await applicationRepository.findByOpportunityAndUser(params.id, params.volunteerId);
      if (!volunteerApp || volunteerApp.status !== 'approved' || !volunteerApp.hasAttended) {
        throw new ForbiddenError('You can only rate volunteers who attended this opportunity');
      }
      const hasOrgAccess = await organizationRepository.hasManageAccess(opp.ngoId, userId);
      const myApp = await applicationRepository.findByOpportunityAndUser(params.id, userId);
      const isPeer = myApp && myApp.status === 'approved' && myApp.hasAttended && myApp.userId !== params.volunteerId;
      if (!hasOrgAccess && !isPeer) {
        throw new ForbiddenError('Only NGO staff or fellow volunteers who attended can rate this volunteer');
      }
      const existing = await feedbackRepository.hasVolunteerFeedback(userId, params.volunteerId, params.id);
      if (existing) throw new ForbiddenError('You have already rated this volunteer for this opportunity');
      const result = await feedbackRepository.createVolunteerFeedback(
        userId,
        params.volunteerId,
        params.id,
        body.rating,
        body.testimonial
      );
      return { feedback: result };
    },
    {
      params: t.Object({ id: t.String(), volunteerId: t.String() }),
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
        testimonial: t.Optional(t.String()),
      }),
    }
  );
