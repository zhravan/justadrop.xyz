import { db, sessions, users } from '@justadrop/db';
import { eq, and, gt } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { logger } from '../utils/logger';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class SessionService {
  async createSession(userId: string): Promise<string> {
    const token = createId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(sessions).values({
      id: createId(),
      userId,
      token,
      expiresAt,
      lastAccessedAt: new Date(),
    });

    logger.info({ userId }, 'Session created');
    return token;
  }

  async validateSession(token: string): Promise<{ userId: string; user: any } | null> {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      ),
    });

    if (!session) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      await this.deleteSession(token);
      return null;
    }

    if (user.isBanned || user.deletedAt) {
      await this.deleteSession(token);
      return null;
    }

    await db
      .update(sessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(sessions.id, session.id));

    return {
      userId: session.userId,
      user,
    };
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
    logger.info({ token }, 'Session deleted');
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
    logger.info({ userId }, 'All user sessions deleted');
  }
}
