import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_USERNAME,
  ADMIN_DEFAULT_PASSWORD,
  createAdminToken,
} from '@/lib/admin/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_DEFAULT_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin username or password.' },
        { status: 401 }
      );
    }

    const token = createAdminToken();
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
    });

    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('[admin/login] Error:', error);
    return NextResponse.json({ error: 'Server error during login.' }, { status: 500 });
  }
}
