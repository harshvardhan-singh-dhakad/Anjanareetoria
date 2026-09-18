import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken, findUserByIdAsync } from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('customer_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = verifyCustomerSessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await findUserByIdAsync(session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || null,
        phone: user.phone || null,
        name: user.name || null,
        avatar: user.avatar || null,
        role: user.role || 'customer',
        provider: user.provider || 'email',
        hasPassword: Boolean(user.passwordHash),
      },
    });
  } catch (error: unknown) {
    console.error('[auth/me] Error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}