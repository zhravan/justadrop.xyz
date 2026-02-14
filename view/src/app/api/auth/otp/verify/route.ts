import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    const setCookieHeaders =
      (typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : null) ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')!] : []);
    for (const header of setCookieHeaders) {
      const match = header.match(/sessionToken=([^;\s]+)/);
      if (match?.[1]) {
        const cookieStore = await cookies();
        cookieStore.set('sessionToken', match[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
        break;
      }
    }

    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Auth OTP verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
