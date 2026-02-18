/**
 * Shared config for Next.js API routes that proxy to the backend.
 * Use getBackendErrorHint() in catch blocks to return helpful errors when
 * the backend is unreachable.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getBackendUrl(): string {
  return API_URL;
}

export function getBackendErrorHint(error: unknown): string {
  const err = error instanceof Error ? error : new Error(String(error));
  const cause = err.cause instanceof Error ? err.cause : null;
  const message = cause?.message ?? err.message ?? String(error);

  // Common connection errors
  if (
    message.includes('ECONNREFUSED') ||
    message.includes('fetch failed') ||
    message.includes('network')
  ) {
    return `Backend unreachable at ${API_URL}. Is it running? Start with: cd api && bun run dev`;
  }

  return `Backend error: ${message}`;
}
