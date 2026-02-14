import { createId } from '@paralleldrive/cuid2';
import type { User } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createSession(userId: string): Promise<string> {
    const token = createId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await this.sessionRepository.create(userId, token, expiresAt);
    logger.info({ userId }, 'Session created');
    return token;
  }

  async validateSession(token: string): Promise<{ userId: string; user: User } | null> {
    const session = await this.sessionRepository.findByToken(token);

    if (!session) {
      return null;
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user) {
      await this.deleteSession(token);
      return null;
    }

    if (user.isBanned || user.deletedAt) {
      await this.deleteSession(token);
      return null;
    }

    await this.sessionRepository.updateLastAccessed(session.id);

    return {
      userId: session.userId,
      user,
    };
  }

  async deleteSession(token: string): Promise<void> {
    await this.sessionRepository.deleteByToken(token);
    logger.info({ token }, 'Session deleted');
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
    logger.info({ userId }, 'All user sessions deleted');
  }
}
