import { Elysia, t } from 'elysia';
import { db, opportunities } from '@justadrop/db';
import { eq } from 'drizzle-orm';

export const opportunitiesRouter = new Elysia({ prefix: '/opportunities', tags: ['opportunities'] })
  .get('/', async () => {
    const allOpportunities = await db.select().from(opportunities);
    return allOpportunities;
  })
  .get('/:id', async ({ params: { id } }) => {
    const opportunity = await db.select().from(opportunities).where(eq(opportunities.id, id));
    if (opportunity.length === 0) {
      throw new Error('Opportunity not found');
    }
    return opportunity[0];
  })
  .post('/', async ({ body }) => {
    const newOpportunity = await db.insert(opportunities).values(body).returning();
    return newOpportunity[0];
  }, {
    body: t.Object({
      organizationId: t.String(),
      title: t.String(),
      description: t.String(),
      skillsRequired: t.Array(t.String()),
      duration: t.String(),
      location: t.String(),
    })
  })
  .patch('/:id', async ({ params: { id }, body }) => {
    const updated = await db.update(opportunities)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    if (updated.length === 0) {
      throw new Error('Opportunity not found');
    }
    return updated[0];
  }, {
    body: t.Partial(t.Object({
      title: t.String(),
      description: t.String(),
      skillsRequired: t.Array(t.String()),
      duration: t.String(),
      location: t.String(),
      status: t.Union([t.Literal('open'), t.Literal('closed'), t.Literal('filled')]),
    }))
  })
  .delete('/:id', async ({ params: { id } }) => {
    await db.delete(opportunities).where(eq(opportunities.id, id));
    return { success: true };
  });
