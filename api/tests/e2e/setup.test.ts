import { describe, it, expect, beforeAll } from 'bun:test';
import postgres from 'postgres';

/**
 * Setup and Configuration Tests
 * 
 * These tests verify that the environment is properly configured
 * before running E2E tests.
 */

function getConnectionString(): string {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

describe('Test Environment Setup', () => {
  describe('Environment Variables', () => {
    it('should have required database environment variables', () => {
      expect(process.env.POSTGRES_HOST).toBeDefined();
      expect(process.env.POSTGRES_PORT).toBeDefined();
      expect(process.env.POSTGRES_USER).toBeDefined();
      expect(process.env.POSTGRES_PASSWORD).toBeDefined();
      expect(process.env.POSTGRES_DB).toBeDefined();
    });

    it('should have API URL configured', () => {
      expect(API_URL).toBeDefined();
      expect(API_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('Database Connection', () => {
    let dbClient: postgres.Sql;

    beforeAll(async () => {
      const connectionString = getConnectionString();
      dbClient = postgres(connectionString, { max: 1 });
    });

    it('should connect to PostgreSQL database', async () => {
      const result = await dbClient`SELECT 1 as test`;
      expect(result[0].test).toBe(1);
      await dbClient.end();
    });

    it('should have required tables', async () => {
      const connectionString = getConnectionString();
      const client = postgres(connectionString, { max: 1 });
      
      const tables = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'otp_tokens', 'sessions')
      `;
      
      const tableNames = tables.map((t: any) => t.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('otp_tokens');
      expect(tableNames).toContain('sessions');
      
      await client.end();
    });

    it('should have correct schema structure', async () => {
      const connectionString = getConnectionString();
      const client = postgres(connectionString, { max: 1 });

      // Check users table
      const usersColumns = await client`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
      `;
      const userColumnNames = usersColumns.map((c: any) => c.column_name);
      expect(userColumnNames).toContain('id');
      expect(userColumnNames).toContain('email');
      expect(userColumnNames).toContain('email_verified');

      // Check otp_tokens table
      const otpColumns = await client`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'otp_tokens'
      `;
      const otpColumnNames = otpColumns.map((c: any) => c.column_name);
      expect(otpColumnNames).toContain('id');
      expect(otpColumnNames).toContain('email');
      expect(otpColumnNames).toContain('code');
      expect(otpColumnNames).toContain('used');

      // Check sessions table
      const sessionColumns = await client`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'sessions'
      `;
      const sessionColumnNames = sessionColumns.map((c: any) => c.column_name);
      expect(sessionColumnNames).toContain('id');
      expect(sessionColumnNames).toContain('user_id');
      expect(sessionColumnNames).toContain('token');

      await client.end();
    });
  });

  describe('API Server', () => {
    it('should have API server running', async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          signal: AbortSignal.timeout(5000),
        });
        expect(response.ok).toBe(true);
      } catch (error) {
        throw new Error(
          `API server is not running at ${API_URL}. ` +
          `Please start it with: bun run dev`
        );
      }
    });

    it('should respond to health check endpoint', async () => {
      const response = await fetch(`${API_URL}/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
  });

  describe('Email Configuration', () => {
    it('should have Resend API key configured (optional)', () => {
      // This is optional - tests will still run without it
      // but email functionality won't work
      if (!process.env.RESEND_API_KEY) {
        console.warn('WARNING: RESEND_API_KEY not set - email tests may be skipped');
      }
    });
  });
});
