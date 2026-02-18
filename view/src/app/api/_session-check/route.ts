import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Debug route: returns whether a session cookie is present.
 * Visit /api/_session-check to see if cookies are reaching the server.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return NextResponse.json({
    hasSessionCookie: !!token,
    cookieLength: token ? token.length : 0,
  });
}
