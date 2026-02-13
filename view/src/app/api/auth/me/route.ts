import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
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
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
