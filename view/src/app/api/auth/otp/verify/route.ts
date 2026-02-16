import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json?.error;
      return NextResponse.json(
        { error: err?.message || json?.message || 'Invalid or expired code' },
        { status: res.status }
      );
    }

    // Copy session cookie from API response to our domain
    // Try Set-Cookie header first, fallback to token from JSON (backend returns it for proxy use)
    let token: string | null = null;
    const setCookieHeaders =
      (typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : null) ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
    for (const header of setCookieHeaders) {
      const match = header.match(/sessionToken=([^;\s]+)/);
      if (match?.[1]) {
        token = match[1];
        break;
      }
    }
    if (!token) {
      const data = json?.data ?? json;
      if (data?.token && typeof data.token === 'string') token = data.token;
    }
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set('sessionToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }
    // Don't send token to browser - strip it from response body
    const data = json?.data ?? json;
    const { token: _, ...safe } = typeof data === 'object' && data ? data : {};
    // Return same shape client expects: { user, isNewUser } (not wrapped in data)
    return NextResponse.json(Object.keys(safe).length ? safe : json);
  } catch (error) {
    console.error('Auth OTP verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
