import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;

  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `sessionToken=${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Auth logout error:', error);
  } finally {
    cookieStore.delete('sessionToken');
  }

  return NextResponse.json({ message: 'Logged out successfully' });
}
