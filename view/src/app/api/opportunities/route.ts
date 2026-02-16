import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl, getBackendErrorHint } from '@/lib/api-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const API_URL = getBackendUrl();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = `${API_URL}/opportunities${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = json?.error?.message ?? json?.message ?? (typeof json?.error === 'object' ? json?.error?.message : null);
      return NextResponse.json(
        { error: errMsg || 'Failed to fetch opportunities' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Opportunities GET error:', error);
    const hint = getBackendErrorHint(error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities', hint: process.env.NODE_ENV === 'development' ? hint : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const API_URL = getBackendUrl();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const res = await fetch(`${API_URL}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sessionToken=${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Failed to create opportunity' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Opportunities POST error:', error);
    const hint = getBackendErrorHint(error);
    return NextResponse.json(
      { error: 'Failed to create opportunity', hint: process.env.NODE_ENV === 'development' ? hint : undefined },
      { status: 500 }
    );
  }
}
