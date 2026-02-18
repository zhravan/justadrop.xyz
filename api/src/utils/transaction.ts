import { db } from '../db/index.js';

/**
 * Transaction callback receives a tx with the same interface as db.
 * Use it for inserts, updates, deletes, selects - all run atomically.
 */
type TransactionCallback<T> = (tx: Transaction) => Promise<T>;

/** Transaction client - same query API as db, use inside withTransaction callback */
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Use when a repo method can run inside or outside a transaction.
 * In method: `const client = tx ?? db;` then use `client` for queries.
 */
export type DbOrTx = typeof db | Transaction;

/**
 * Run multiple DB operations atomically. On error, everything rolls back.
 *
 * @example: in a repository (multi-table insert)
 * const org = await withTransaction(async (tx) => {
 *   await tx.insert(organizations).values({ ... });
 *   await tx.insert(organizationMembers).values({ ... });
 *   return tx.query.organizations.findFirst({ where: eq(organizations.id, id) });
 * });
 *
 * @example: in a service (cross-repository - pass tx to repos that support it)
 * await withTransaction(async (tx) => {
 *   const user = await userRepo.create(data, { tx });
 *   await sessionRepo.create(user.id, token, expiresAt, { tx });
 * });
 */
export async function withTransaction<T>(fn: TransactionCallback<T>): Promise<T> {
  return db.transaction(fn);
}
