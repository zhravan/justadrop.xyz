import { db } from '../src/db/index';
import { users, moderators } from '../src/db/schema';
import { logger } from '../src/utils/logger';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      logger.error('ADMIN_EMAIL is not set in environment');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail),
    });

    if (existingUser) {
      if (existingUser.isAdmin) {
        logger.info({ email: adminEmail }, 'Admin user already exists');

        // Ensure moderator entry exists
        const existingModerator = await db.query.moderators.findFirst({
          where: (moderators, { eq }) => eq(moderators.userId, existingUser.id),
        });

        if (!existingModerator) {
          await db.insert(moderators).values({
            userId: existingUser.id,
            isActive: true,
          });
          logger.info(
            { userId: existingUser.id, email: adminEmail },
            'Admin also added as moderator'
          );
        }

        return;
      }

      // Upgrade existing user to admin
      await db.update(users).set({ isAdmin: true }).where(eq(users.email, adminEmail));

      // Add moderator entry if not present
      const existingModerator = await db.query.moderators.findFirst({
        where: (moderators, { eq }) => eq(moderators.userId, existingUser.id),
      });

      if (!existingModerator) {
        await db.insert(moderators).values({
          userId: existingUser.id,
          isActive: true,
        });
      }

      logger.info(
        { userId: existingUser.id, email: adminEmail },
        'User upgraded to admin and added as moderator successfully'
      );

      return;
    }

    // Create new admin user
    const adminUser = await db
      .insert(users)
      .values({
        email: adminEmail,
        emailVerified: true,
        isAdmin: true,
        name: 'Admin',
        isBanned: false,
      })
      .returning();

    const newAdmin = adminUser[0];

    // Create moderator record for the admin
    await db.insert(moderators).values({
      userId: newAdmin.id,
      isActive: true,
    });

    logger.info(
      { userId: newAdmin.id, email: adminEmail },
      'Admin user created and added as moderator successfully'
    );
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to seed admin user');
    process.exit(1);
  }
}

seedAdmin();
