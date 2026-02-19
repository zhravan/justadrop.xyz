#!/usr/bin/env bun

/**
 * Auth Setup Verification Script
 *
 * This script verifies that the authentication system is properly configured
 * and all components are working correctly.
 *
 * Usage:
 *   bun run verify:auth
 *   or: bun scripts/verify-auth.ts
 *
 * Note: This script must be run with Bun, not Node.js
 */

import postgres from 'postgres';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? '[PASS]' : '[FAIL]';
  const color = passed ? 'green' : 'red';
  log(`  ${icon} ${name}: ${message}`, color);
}

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

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connectionString = getConnectionString();
    const client = postgres(connectionString, { max: 1 });

    // Test basic connection
    await client`SELECT 1`;

    // Check if required tables exist
    const tables = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'otp_tokens', 'sessions')
    `;

    const tableNames = tables.map((t: any) => t.table_name);
    const requiredTables = ['users', 'otp_tokens', 'sessions'];
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t));

    if (missingTables.length > 0) {
      addResult('Database Tables', false, `Missing tables: ${missingTables.join(', ')}`, {
        found: tableNames,
        required: requiredTables,
      });
      await client.end();
      return false;
    }

    addResult('Database Connection', true, 'Connected successfully');
    addResult('Database Tables', true, 'All required tables exist', { tables: tableNames });

    await client.end();
    return true;
  } catch (error: any) {
    addResult('Database Connection', false, error.message || 'Connection failed', error);
    return false;
  }
}

async function testEmailConfiguration(): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const resendFromName = process.env.RESEND_FROM_NAME;

  if (!resendApiKey) {
    addResult('Email Configuration', false, 'RESEND_API_KEY is not set (emails will not be sent)', {
      note: 'Set RESEND_API_KEY in .env to enable email functionality',
      resendFromEmail,
      resendFromName,
    });
    return false;
  }

  if (!resendFromEmail) {
    addResult('Email Configuration', false, 'RESEND_FROM_EMAIL is not set');
    return false;
  }

  addResult('Email Configuration', true, 'Resend API key configured', {
    fromEmail: resendFromEmail,
    fromName: resendFromName,
  });

  return true;
}

async function testApiEndpoints(): Promise<boolean> {
  const apiUrl = getApiUrl();
  const testEmail = `test-${Date.now()}@example.com`;

  try {
    // Test 1: Health check
    log('\nTesting API Endpoints...', 'cyan');

    try {
      const healthResponse = await fetch(`${apiUrl}/health`);
      if (healthResponse.ok) {
        addResult('API Health Check', true, 'API is running');
      } else {
        addResult('API Health Check', false, `API returned status ${healthResponse.status}`);
        return false;
      }
    } catch (error: any) {
      addResult('API Health Check', false, `Cannot reach API: ${error.message}`, {
        url: apiUrl,
        note: 'Make sure the API server is running (bun run dev)',
      });
      return false;
    }

    // Test 2: Send OTP
    try {
      const sendOtpResponse = await fetch(`${apiUrl}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const sendOtpData = await sendOtpResponse.json();

      if (sendOtpResponse.ok) {
        addResult('Send OTP Endpoint', true, 'OTP sent successfully');
      } else {
        addResult(
          'Send OTP Endpoint',
          false,
          `Failed: ${sendOtpData.message || 'Unknown error'}`,
          sendOtpData
        );
        return false;
      }
    } catch (error: any) {
      addResult('Send OTP Endpoint', false, error.message);
      return false;
    }

    // Test 3: Verify OTP (this will fail without a real OTP, but we can check the endpoint exists)
    try {
      const verifyOtpResponse = await fetch(`${apiUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, code: '000000' }),
      });

      const contentType = verifyOtpResponse.headers.get('content-type') || '';
      let verifyOtpData: any = null;

      if (contentType.includes('application/json')) {
        try {
          verifyOtpData = await verifyOtpResponse.json();
        } catch (e) {
          const text = await verifyOtpResponse.text();
          addResult('Verify OTP Endpoint', false, `Failed to parse JSON response`, {
            status: verifyOtpResponse.status,
            contentType,
            responseText: text.substring(0, 200),
          });
          return true; // Continue with other tests
        }
      } else {
        const text = await verifyOtpResponse.text();
        // Accept plain text error responses for invalid OTP as valid (endpoint is working)
        const isInvalidOtpError =
          verifyOtpResponse.status === 500 && text.includes('Invalid or expired OTP');

        if (isInvalidOtpError) {
          addResult(
            'Verify OTP Endpoint',
            true,
            'Endpoint exists (invalid OTP rejected as expected)',
            {
              note: 'Endpoint returns plain text error. Consider using ValidationError for JSON error responses.',
              status: verifyOtpResponse.status,
              responseText: text,
            }
          );
        } else {
          addResult('Verify OTP Endpoint', false, `Non-JSON response received`, {
            status: verifyOtpResponse.status,
            contentType,
            responseText: text.substring(0, 200),
          });
        }
        return true; // Continue with other tests
      }

      // We expect this to fail with invalid OTP, but endpoint should exist
      // Accept 400, 401, or 500 with error message about invalid OTP as valid responses
      const responseText = verifyOtpData ? JSON.stringify(verifyOtpData) : '';
      const isInvalidOtpError =
        verifyOtpResponse.status === 400 ||
        verifyOtpResponse.status === 401 ||
        (verifyOtpResponse.status === 500 &&
          (responseText.includes('Invalid or expired OTP') ||
            responseText.includes('invalid') ||
            responseText.includes('expired')));

      if (isInvalidOtpError) {
        addResult(
          'Verify OTP Endpoint',
          true,
          'Endpoint exists (invalid OTP rejected as expected)',
          {
            note:
              verifyOtpResponse.status === 500
                ? 'Consider using proper error types (ValidationError) instead of plain Error for better JSON responses'
                : undefined,
          }
        );
      } else if (verifyOtpResponse.ok) {
        addResult('Verify OTP Endpoint', true, 'Endpoint exists and accepts requests');
      } else {
        addResult(
          'Verify OTP Endpoint',
          false,
          `Unexpected status: ${verifyOtpResponse.status}`,
          verifyOtpData
        );
      }
    } catch (error: any) {
      addResult('Verify OTP Endpoint', false, error.message, { error: String(error) });
    }

    // Test 4: Get current user (should fail without auth)
    try {
      const meResponse = await fetch(`${apiUrl}/auth/me`);

      if (meResponse.status === 401) {
        addResult('Get Current User Endpoint', true, 'Endpoint exists and requires authentication');
      } else if (meResponse.status === 500) {
        // Try to get error details
        const contentType = meResponse.headers.get('content-type') || '';
        let errorData: any = null;
        try {
          if (contentType.includes('application/json')) {
            errorData = await meResponse.json();
          } else {
            const text = await meResponse.text();
            errorData = { responseText: text.substring(0, 200) };
          }
        } catch (e) {
          errorData = { note: 'Could not parse error response' };
        }
        addResult('Get Current User Endpoint', false, `Server error (500)`, {
          status: meResponse.status,
          contentType,
          error: errorData,
        });
      } else {
        addResult('Get Current User Endpoint', false, `Unexpected status: ${meResponse.status}`, {
          status: meResponse.status,
          statusText: meResponse.statusText,
        });
      }
    } catch (error: any) {
      addResult('Get Current User Endpoint', false, error.message, { error: String(error) });
    }

    // Test 5: Logout endpoint
    try {
      const logoutResponse = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
      });

      const contentType = logoutResponse.headers.get('content-type') || '';
      let logoutData: any = null;

      if (contentType.includes('application/json')) {
        try {
          logoutData = await logoutResponse.json();
        } catch (e) {
          const text = await logoutResponse.text();
          addResult('Logout Endpoint', false, `Failed to parse JSON response`, {
            status: logoutResponse.status,
            contentType,
            responseText: text.substring(0, 200),
          });
          return false;
        }
      } else {
        const text = await logoutResponse.text();
        // Logout might return empty response, which is OK
        if (logoutResponse.ok || logoutResponse.status === 200) {
          addResult('Logout Endpoint', true, 'Endpoint exists (empty response is OK)');
        } else {
          addResult('Logout Endpoint', false, `Non-JSON response received`, {
            status: logoutResponse.status,
            contentType,
            responseText: text.substring(0, 200),
          });
        }
        return true; // Continue (test completed)
      }

      if (logoutResponse.ok || logoutResponse.status === 200) {
        addResult('Logout Endpoint', true, 'Endpoint exists');
      } else {
        addResult(
          'Logout Endpoint',
          false,
          `Unexpected status: ${logoutResponse.status}`,
          logoutData
        );
      }
    } catch (error: any) {
      addResult('Logout Endpoint', false, error.message, { error: String(error) });
    }

    return true;
  } catch (error: any) {
    addResult('API Endpoints', false, error.message);
    return false;
  }
}

async function testDatabaseSchema(): Promise<boolean> {
  try {
    log('\nTesting Database Schema...', 'cyan');

    const connectionString = getConnectionString();
    const client = postgres(connectionString, { max: 1 });

    // Check users table structure
    const usersColumns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;

    const requiredUserColumns = ['id', 'email', 'email_verified'];
    const userColumnNames = usersColumns.map((c: any) => c.column_name);
    const missingUserColumns = requiredUserColumns.filter((col) => !userColumnNames.includes(col));

    if (missingUserColumns.length > 0) {
      addResult('Users Table Schema', false, `Missing columns: ${missingUserColumns.join(', ')}`);
      await client.end();
      return false;
    }

    addResult('Users Table Schema', true, 'All required columns exist', {
      columns: userColumnNames.length,
    });

    // Check otp_tokens table structure
    const otpColumns = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'otp_tokens'
      ORDER BY ordinal_position
    `;

    const requiredOtpColumns = ['id', 'email', 'code', 'expires_at', 'used'];
    const otpColumnNames = otpColumns.map((c: any) => c.column_name);
    const missingOtpColumns = requiredOtpColumns.filter((col) => !otpColumnNames.includes(col));

    if (missingOtpColumns.length > 0) {
      addResult(
        'OTP Tokens Table Schema',
        false,
        `Missing columns: ${missingOtpColumns.join(', ')}`
      );
      await client.end();
      return false;
    }

    addResult('OTP Tokens Table Schema', true, 'All required columns exist', {
      columns: otpColumnNames.length,
    });

    // Check sessions table structure
    const sessionColumns = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `;

    const requiredSessionColumns = ['id', 'user_id', 'token', 'expires_at'];
    const sessionColumnNames = sessionColumns.map((c: any) => c.column_name);
    const missingSessionColumns = requiredSessionColumns.filter(
      (col) => !sessionColumnNames.includes(col)
    );

    if (missingSessionColumns.length > 0) {
      addResult(
        'Sessions Table Schema',
        false,
        `Missing columns: ${missingSessionColumns.join(', ')}`
      );
      await client.end();
      return false;
    }

    addResult('Sessions Table Schema', true, 'All required columns exist', {
      columns: sessionColumnNames.length,
    });

    await client.end();
    return true;
  } catch (error: any) {
    addResult('Database Schema', false, error.message);
    return false;
  }
}

async function testEnvironmentVariables(): Promise<boolean> {
  log('\nChecking Environment Variables...', 'cyan');

  const required = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];

  const optional = ['DATABASE_URL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'NODE_ENV', 'API_PORT'];

  let allPresent = true;

  for (const varName of required) {
    if (process.env[varName]) {
      addResult(`Env: ${varName}`, true, 'Set');
    } else {
      addResult(`Env: ${varName}`, false, 'Missing (required)');
      allPresent = false;
    }
  }

  for (const varName of optional) {
    if (process.env[varName]) {
      addResult(`Env: ${varName}`, true, 'Set');
    } else {
      addResult(`Env: ${varName}`, false, 'Not set (optional)', {
        note: varName === 'RESEND_API_KEY' ? 'Required for email functionality' : 'Optional',
      });
    }
  }

  return allPresent;
}

async function main() {
  log('\nAuth Setup Verification\n', 'blue');
  log('='.repeat(50), 'blue');

  // Load environment variables
  try {
    // Try to load .env file if it exists
    const envPath = new URL('../.env', import.meta.url);
    // Note: Bun doesn't have dotenv built-in, but environment variables should be loaded
    // by the shell or process manager
  } catch (error) {
    // Ignore if .env file doesn't exist
  }

  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Email Configuration', fn: testEmailConfiguration },
    { name: 'API Endpoints', fn: testApiEndpoints },
  ];

  for (const test of tests) {
    try {
      await test.fn();
    } catch (error: any) {
      addResult(test.name, false, `Test failed: ${error.message}`, error);
    }
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('\nSummary\n', 'blue');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  log(`Total Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');

  if (failed > 0) {
    log('\nFailed Tests:', 'red');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        log(`  • ${r.name}: ${r.message}`, 'red');
        if (r.details) {
          log(`    Details: ${JSON.stringify(r.details, null, 2)}`, 'yellow');
        }
      });
  }

  log('\n' + '='.repeat(50), 'blue');

  if (failed === 0) {
    log('\nAll tests passed! Auth setup is properly configured.\n', 'green');
    process.exit(0);
  } else {
    log('\nWARNING: Some tests failed. Please review the issues above.\n', 'yellow');
    process.exit(1);
  }
}

// Run if executed directly
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
