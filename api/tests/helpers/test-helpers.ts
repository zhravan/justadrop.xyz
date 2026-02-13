/**
 * Test Helpers for better error reporting
 */

export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  testName?: string
): Promise<void> {
  if (response.status !== expectedStatus) {
    const contentType = response.headers.get('content-type') || '';
    let errorDetails: any = {};

    try {
      if (contentType.includes('application/json')) {
        errorDetails = await response.json();
      } else {
        const text = await response.text();
        errorDetails = { responseText: text.substring(0, 500) };
      }
    } catch (e) {
      errorDetails = { note: 'Could not parse error response' };
    }

    const message = testName
      ? `Test "${testName}" failed: Expected status ${expectedStatus}, got ${response.status}`
      : `Expected status ${expectedStatus}, got ${response.status}`;

    throw new Error(`${message}\nDetails: ${JSON.stringify(errorDetails, null, 2)}`);
  }
}

export async function logResponse(response: Response, label: string): Promise<void> {
  const contentType = response.headers.get('content-type') || '';
  let data: any = {};

  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { responseText: text.substring(0, 500) };
    }
  } catch (e) {
    data = { note: 'Could not parse response' };
  }

  console.log(`\n[${label}] Status: ${response.status}`);
  console.log(`[${label}] Content-Type: ${contentType}`);
  console.log(`[${label}] Response:`, JSON.stringify(data, null, 2));
}
