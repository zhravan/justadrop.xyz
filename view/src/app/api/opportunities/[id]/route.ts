import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/opportunities/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Opportunity not found' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Opportunity GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await request.json();
    const res = await fetch(`${API_URL}/opportunities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sessionToken=${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Failed to update opportunity' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Opportunity PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

export async function DELETE(
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
    const res = await fetch(`${API_URL}/opportunities/${id}`, {
      method: 'DELETE',
      headers: { Cookie: `sessionToken=${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || json?.message || 'Failed to delete opportunity' },
        { status: res.status }
      );
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    console.error('Opportunity DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
