# API E2E Tests

End-to-end tests for the Just a Drop API authentication system.

## Prerequisites

Before running tests, ensure:

1. **PostgreSQL is running**:
   ```bash
   docker-compose -f ../../docker-compose.dev.yml up -d postgres
   ```

2. **Database migrations are applied**:
   ```bash
   bun run db:migrate
   ```

3. **API server is running** (in a separate terminal):
   ```bash
   bun run dev
   ```

4. **Environment variables are set**:
   - Copy `../.env.example` to `../.env` if not already done
   - Ensure `POSTGRES_*` variables are configured
   - `RESEND_API_KEY` is optional (tests will skip email-related tests if not set)

## Running Tests

### Run All Tests
```bash
bun test
```

### Run E2E Tests Only
```bash
bun test:e2e
```

### Run Specific Test Suites
```bash
# Setup/configuration tests
bun test:setup

# Authentication flow tests
bun test:auth
```

### Watch Mode
```bash
bun test:watch
```

## Test Structure

```
tests/
├── e2e/
│   ├── setup.test.ts          # Environment and setup verification
│   └── auth.e2e.test.ts       # Authentication E2E tests
├── helpers/
│   └── test-utils.ts          # Test utilities and helpers
└── bunfig.toml                # Bun test configuration
```

## Test Coverage

### Setup Tests (`setup.test.ts`)
- Environment variable validation
- Database connectivity
- Schema verification
- API server availability

### Authentication E2E Tests (`auth.e2e.test.ts`)
- **Database Setup**: Connection and schema validation
- **API Health**: Basic API availability
- **OTP Flow**:
  - Sending OTP
  - Verifying valid OTP
  - Rejecting invalid OTP
  - Rejecting already-used OTP
- **Session Management**:
  - Getting current user with valid session
  - Rejecting requests without session
  - Rejecting requests with invalid session
  - Logging out
- **User Creation**: New user creation on first OTP verification
- **Cleanup**: Test data cleanup

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { getApiUrl, generateTestEmail, cleanupTestData } from '../helpers/test-utils';
import postgres from 'postgres';

describe('My Feature', () => {
  let dbClient: postgres.Sql;
  const testEmail = generateTestEmail();

  beforeAll(async () => {
    const connectionString = getConnectionString();
    dbClient = postgres(connectionString, { max: 1 });
  });

  afterAll(async () => {
    await cleanupTestData(dbClient, testEmail);
    await dbClient.end();
  });

  it('should do something', async () => {
    const response = await fetch(`${getApiUrl()}/endpoint`);
    expect(response.ok).toBe(true);
  });
});
```

### Test Utilities

Available helpers in `tests/helpers/test-utils.ts`:

- `getConnectionString()` - Get database connection string
- `getApiUrl()` - Get API base URL
- `generateTestEmail()` - Generate unique test email
- `createTestUser()` - Create a test user in database
- `createTestSession()` - Create a test session
- `createTestOtp()` - Create a test OTP token
- `cleanupTestData()` - Clean up test data
- `waitForApi()` - Wait for API to be available

## Best Practices

1. **Always clean up test data** - Use `afterAll` to clean up created test data
2. **Use unique test emails** - Use `generateTestEmail()` to avoid conflicts
3. **Test isolation** - Each test should be independent
4. **Error handling** - Test both success and error cases
5. **Async/await** - Always use async/await for async operations
6. **Descriptive test names** - Use clear, descriptive test names

## Troubleshooting

### Tests fail with "API server not running"
- Make sure the API server is running: `bun run dev`
- Check that `NEXT_PUBLIC_API_URL` is set correctly (defaults to `http://localhost:3001`)

### Tests fail with database connection errors
- Ensure PostgreSQL is running: `docker-compose -f ../../docker-compose.dev.yml ps`
- Check environment variables in `../.env`
- Verify migrations are applied: `bun run db:migrate`

### Tests timeout
- Increase timeout in `bunfig.toml` if needed
- Check if database or API server is slow to respond

### OTP tests fail
- If `RESEND_API_KEY` is not set, OTP emails won't be sent
- Tests retrieve OTP codes directly from the database
- Ensure database has recent OTP tokens

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    docker-compose -f docker-compose.dev.yml up -d postgres
    sleep 5
    bun run db:migrate
    bun run dev &
    sleep 5
    bun test:e2e
```

## Notes

- Tests use real database connections (not mocks)
- Tests should be run against a test database in CI/CD
- Some tests require the API server to be running
- Tests clean up after themselves, but manual cleanup may be needed if tests crash
