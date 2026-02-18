import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl, getBackendErrorHint } from '@/lib/api-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const API_URL = getBackendUrl();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized', hint: 'No session cookie. Try logging in again.' }, { status: 401 });
    }
    const res = await fetch(`${API_URL}/applications/me`, {
      method: 'GET',
      headers: { Cookie: `sessionToken=${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = json?.error?.message ?? json?.error ?? json?.message ?? 'Failed to fetch applications';
      return NextResponse.json(
        { error: typeof errMsg === 'string' ? errMsg : 'Failed to fetch applications' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Applications me GET error:', error);
    const hint = getBackendErrorHint(error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', hint: process.env.NODE_ENV === 'development' ? hint : undefined },
      { status: 500 }
    );
  }
}
