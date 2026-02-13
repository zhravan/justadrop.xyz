/**
 * Test Utilities and Helpers
 * 
 * Common utilities for E2E tests
 */

import postgres from 'postgres';

export function getConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const database = process.env.POSTGRES_DB || 'justadrop';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

export async function createTestUser(
  dbClient: postgres.Sql,
  email: string
): Promise<string> {
  const result = await dbClient`
    INSERT INTO users (email, email_verified)
    VALUES (${email.toLowerCase()}, true)
    RETURNING id
  `;
  return result[0].id;
}

export async function createTestSession(
  dbClient: postgres.Sql,
  userId: string,
  token?: string
): Promise<string> {
  const sessionToken = token || `test-token-${Date.now()}-${Math.random()}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await dbClient`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt})
  `;

  return sessionToken;
}

export async function createTestOtp(
  dbClient: postgres.Sql,
  email: string,
  code?: string
): Promise<string> {
  const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await dbClient`
    INSERT INTO otp_tokens (email, code, expires_at, used)
    VALUES (${email.toLowerCase()}, ${otpCode}, ${expiresAt}, false)
  `;

  return otpCode;
}

export async function cleanupTestData(
  dbClient: postgres.Sql,
  email: string
): Promise<void> {
  await dbClient`
    DELETE FROM sessions WHERE user_id IN (
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    )
  `;
  await dbClient`
    DELETE FROM otp_tokens WHERE email = ${email.toLowerCase()}
  `;
  await dbClient`
    DELETE FROM users WHERE email = ${email.toLowerCase()}
  `;
}

export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

export async function waitForApi(apiUrl: string, maxRetries = 10): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${apiUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Continue retrying
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`API server not available at ${apiUrl} after ${maxRetries} retries`);
}
