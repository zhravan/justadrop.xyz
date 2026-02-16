import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, getBackendErrorHint } from '@/lib/api-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const API_URL = getBackendUrl();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const url = query ? `${API_URL}/volunteers?${query}` : `${API_URL}/volunteers`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Failed to fetch volunteers' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Volunteers GET error:', error);
    const hint = getBackendErrorHint(error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers', hint: process.env.NODE_ENV === 'development' ? hint : undefined },
      { status: 500 }
    );
  }
}
