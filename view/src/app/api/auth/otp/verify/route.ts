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
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/sessionToken=([^;]+)/);
      if (match) {
        const token = match[1];
        const cookieStore = await cookies();
        cookieStore.set('sessionToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
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
