import { NextRequest, NextResponse } from 'next/server';
import {
  upsertFirebaseUserAsync,
  createCustomerSessionToken,
} from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const name = body.name ? String(body.name).trim() : undefined;
    const avatar = body.avatar ? String(body.avatar).trim() : undefined;
    const firebaseUid = body.firebaseUid ? String(body.firebaseUid).trim() : undefined;
    const provider = body.provider ? String(body.provider).trim() : 'firebase';

    if (!email && !firebaseUid) {
      return NextResponse.json(
        { error: 'Email or Firebase UID required for authentication.' },
        { status: 400 }
      );
    }

    const user = await upsertFirebaseUserAsync({
      email,
      name,
      avatar,
      firebaseUid,
      provider,
    });

    const token = createCustomerSessionToken(user);
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${user.name || user.email || 'Devotee'}!`,
      token,
      user: {
        id: user.id,
        email: user.email || null,
        phone: user.phone || null,
        name: user.name || null,
        avatar: user.avatar || null,
        role: user.role || 'customer',
        provider: user.provider || provider,
      },
    });

    response.cookies.set({
      name: 'customer_session',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('[auth/firebase-session] Error:', error);
    return NextResponse.json(
      { error: 'Session creation failed.' },
      { status: 500 }
    );
  }
}
