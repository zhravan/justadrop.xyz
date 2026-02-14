import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';
import { authMiddleware } from '../middleware/auth.middleware';
import { CAUSE_VALUES } from '../constants/causes.js';

const organizationRepository = container.getRepositories().organization;

const causeSchema = t.Array(t.String({ pattern: `^(${CAUSE_VALUES.join('|')})$` }));

export const organizationsRouter = new Elysia({ prefix: '/organizations', tags: ['organizations'] })
  .use(cookie())
  .use(authMiddleware)
  .post(
    '/',
    async ({ userId, body }) => {
      const org = await organizationRepository.create({
        createdBy: userId,
        orgName: body.orgName,
        description: body.description,
        causes: body.causes ?? [],
        website: body.website,
        registrationNumber: body.registrationNumber,
        contactPersonName: body.contactPersonName,
        contactPersonEmail: body.contactPersonEmail,
        contactPersonNumber: body.contactPersonNumber,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country ?? 'India',
      });
      return { organization: org };
    },
    {
      body: t.Object({
        orgName: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        causes: t.Optional(causeSchema),
        website: t.Optional(t.String()),
        registrationNumber: t.Optional(t.String()),
        contactPersonName: t.String({ minLength: 1 }),
        contactPersonEmail: t.String({ format: 'email' }),
        contactPersonNumber: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        country: t.Optional(t.String()),
      }),
    }
  )
  .get('/me', async ({ userId }) => {
    const orgs = await organizationRepository.findByCreatedBy(userId);
    return { organizations: orgs };
  });
