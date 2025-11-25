import { Elysia, t } from 'elysia';
import { db, applications } from '@justadrop/db';
import { eq } from 'drizzle-orm';

export const applicationsRouter = new Elysia({ prefix: '/applications', tags: ['applications'] })
  .get('/', async () => {
    const allApplications = await db.select().from(applications);
    return allApplications;
  })
  .get('/:id', async ({ params: { id } }) => {
    const application = await db.select().from(applications).where(eq(applications.id, id));
    if (application.length === 0) {
      throw new Error('Application not found');
    }
    return application[0];
  })
  .post('/', async ({ body }) => {
    const newApplication = await db.insert(applications).values(body).returning();
    return newApplication[0];
  }, {
    body: t.Object({
      volunteerId: t.String(),
      opportunityId: t.String(),
      message: t.Optional(t.String()),
    })
  })
  .patch('/:id', async ({ params: { id }, body }) => {
    const updated = await db.update(applications)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    if (updated.length === 0) {
      throw new Error('Application not found');
    }
    return updated[0];
  }, {
    body: t.Partial(t.Object({
      status: t.Union([t.Literal('pending'), t.Literal('accepted'), t.Literal('rejected')]),
      message: t.String(),
    }))
  })
  .delete('/:id', async ({ params: { id } }) => {
    await db.delete(applications).where(eq(applications.id, id));
    return { success: true };
  });
