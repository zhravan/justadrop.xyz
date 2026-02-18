import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';
import { authMiddleware } from '../middleware/auth.middleware';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

const applicationRepository = container.getRepositories().application;
const opportunityRepository = container.getRepositories().opportunity;
const organizationRepository = container.getRepositories().organization;

export const applicationsRouter = new Elysia({ prefix: '/applications', tags: ['applications'] })
  .use(cookie())
  .use(authMiddleware)
  .get(
    '/me',
    async (ctx: any) => {
      const { userId } = ctx;
      const apps = await applicationRepository.findByUser(userId);
      return { applications: apps };
    }
  )
  .patch(
    '/:id',
    async (ctx: any) => {
      const { userId, params, body } = ctx;
      const app = await applicationRepository.findById(params.id);
      if (!app) throw new NotFoundError('Application not found');
      const opp = await opportunityRepository.findById(app.opportunityId);
      if (!opp) throw new NotFoundError('Opportunity not found');
      const hasAccess = await organizationRepository.hasManageAccess(opp.ngoId, userId);
      if (!hasAccess) throw new ForbiddenError('You do not have permission to update this application');
      if (body.status) {
        if (body.status !== 'approved' && body.status !== 'rejected') {
          throw new ValidationError('Status must be approved or rejected');
        }
        const updated = await applicationRepository.updateStatus(params.id, body.status, userId);
        return { application: updated };
      }
      if (typeof body.hasAttended === 'boolean') {
        const updated = await applicationRepository.markAttended(params.id, body.hasAttended);
        return { application: updated };
      }
      throw new ValidationError('Provide status or hasAttended');
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Optional(t.Union([t.Literal('approved'), t.Literal('rejected')])),
        hasAttended: t.Optional(t.Boolean()),
      }),
    }
  );
