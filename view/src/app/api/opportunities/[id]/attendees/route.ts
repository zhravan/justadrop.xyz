import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const res = await fetch(`${API_URL}/opportunities/${id}/attendees`, {
      method: 'GET',
      headers: { Cookie: `sessionToken=${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Failed to fetch attendees' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Attendees GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendees' }, { status: 500 });
  }
}
