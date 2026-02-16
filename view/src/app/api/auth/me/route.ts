import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl, getBackendErrorHint } from '@/lib/api-proxy';

export const dynamic = 'force-dynamic';

export async function GET() {
  const API_URL = getBackendUrl();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json(null, { status: 401 });
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `sessionToken=${token}`,
      },
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(null, { status: res.status });
    }
    const data = json?.data ?? json;
    return NextResponse.json(data?.user ?? data);
  } catch (error) {
    console.error('Auth me error:', error);
    const hint = getBackendErrorHint(error);
    return NextResponse.json(
      { error: 'Failed to get session', hint: process.env.NODE_ENV === 'development' ? hint : undefined },
      { status: 500 }
    );
  }
}
