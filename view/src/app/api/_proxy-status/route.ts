import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic route to check if the Next.js server can reach the backend API.
 * Visit /api/_proxy-status to see connection status.
 * Helpful when debugging 500 errors from proxied API calls.
 */
export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const res = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const ok = res.ok;
    const body = await res.json().catch(() => null);

    return NextResponse.json({
      ok: !!ok,
      backendReachable: true,
      backendUrl: isDev ? API_URL : '[hidden]',
      backendStatus: res.status,
      backendResponse: body,
      message: ok
        ? 'Backend is reachable and healthy'
        : `Backend responded with status ${res.status}`,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const cause = err.cause instanceof Error ? err.cause.message : err.cause;
    return NextResponse.json(
      {
        ok: false,
        backendReachable: false,
        backendUrl: isDev ? API_URL : '[hidden]',
        error: err.message,
        cause: cause ?? undefined,
        hint:
          'Is the backend running? Start it with: cd api && bun run dev',
      },
      { status: 503 }
    );
  }
}
