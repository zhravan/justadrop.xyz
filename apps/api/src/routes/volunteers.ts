import { Elysia, t } from 'elysia';
import { db, volunteers } from '@justadrop/db';
import { eq } from 'drizzle-orm';

export const volunteersRouter = new Elysia({ prefix: '/volunteers', tags: ['volunteers'] })
  .get('/', async () => {
    const allVolunteers = await db.select().from(volunteers);
    return allVolunteers;
  }, {
    detail: {
      summary: 'Get all volunteers',
      description: 'Retrieve a list of all registered volunteers',
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    const volunteer = await db.select().from(volunteers).where(eq(volunteers.id, id));
    if (volunteer.length === 0) {
      throw new Error('Volunteer not found');
    }
    return volunteer[0];
  }, {
    detail: {
      summary: 'Get volunteer by ID',
      description: 'Retrieve a specific volunteer by their ID',
    }
  })
  .post('/', async ({ body }) => {
    const newVolunteer = await db.insert(volunteers).values(body).returning();
    return newVolunteer[0];
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      skills: t.Array(t.String()),
      availability: t.String(),
    }),
    detail: {
      summary: 'Create volunteer',
      description: 'Register a new volunteer',
    }
  })
  .patch('/:id', async ({ params: { id }, body }) => {
    const updated = await db.update(volunteers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(volunteers.id, id))
      .returning();
    if (updated.length === 0) {
      throw new Error('Volunteer not found');
    }
    return updated[0];
  }, {
    body: t.Partial(t.Object({
      name: t.String(),
      email: t.String(),
      skills: t.Array(t.String()),
      availability: t.String(),
    })),
    detail: {
      summary: 'Update volunteer',
      description: 'Update volunteer information',
    }
  })
  .delete('/:id', async ({ params: { id } }) => {
    await db.delete(volunteers).where(eq(volunteers.id, id));
    return { success: true };
  }, {
    detail: {
      summary: 'Delete volunteer',
      description: 'Remove a volunteer from the system',
    }
  });
