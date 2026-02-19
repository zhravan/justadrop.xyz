import { UserRepository } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';
import { ValidationError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { ModeratorRepository, Moderator } from '@/repositories/moderator.repository.js';
import { withTransaction } from '@/utils/transaction.js';
import { createId } from '@paralleldrive/cuid2';
import { db, moderators, users } from '@/db/index.js';

export class ModeratorService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderatorRepository: ModeratorRepository
  ) {}

  verifyXAuthId(XAuthId: string) {
    if (!(XAuthId === process.env.X_AUTH_ID)) {
      throw new UnauthorizedError('Invalid x-auth-id');
    }
  }

  async seedModerator(XAuthId: string, email: string): Promise<Moderator> {
    this.verifyXAuthId(XAuthId);

    const totalModerators = await this.moderatorRepository.getTotalModerators();
    if (totalModerators !== 0) {
      throw new ValidationError('Moderator already exists');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ForbiddenError('User already exists');
    }
    const moderator = await this.createNewModerator(normalizedEmail);

    this.validateModeratorAccount(moderator);
    return moderator;
  }

  private async createNewModerator(email: string) {
    const userId = createId();
    const moderatorId = createId();

    await withTransaction(
      db,
      async (tx) => {
        await tx.insert(users).values({
          id: userId,
          email,
          emailVerified: true,
        });
        await tx.insert(moderators).values({
          id: moderatorId,
          userId,
          isActive: true,
          assignedRegions: [],
        });
      },
      { errorMessage: 'Failed to create moderator (transaction)' }
    );

    const moderator = await this.moderatorRepository.findById(moderatorId);
    if (!moderator) throw new ForbiddenError('Failed to create moderator');

    logger.info({ email }, 'moderator created');
    return moderator;
  }

  private validateModeratorAccount(moderator: Moderator): void {
    if (!moderator || moderator.user.isBanned || moderator.user.deletedAt) {
      throw new ForbiddenError('Account is banned or deleted');
    }
  }
}
