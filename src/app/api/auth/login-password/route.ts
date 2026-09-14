import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByPhoneAsync,
  verifyPasswordAsync,
  createCustomerSessionToken,
} from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || '');
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const rawPassword = String(body.password || '');

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number required.' },
        { status: 400 }
      );
    }

    if (!rawPassword) {
      return NextResponse.json(
        { error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    const user = await findUserByPhoneAsync(cleanPhone);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this mobile number. Please register via OTP.' },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Password has not been set for this account yet. Please sign in via OTP.' },
        { status: 400 }
      );
    }

    const isMatch = await verifyPasswordAsync(rawPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again or login with OTP.' },
        { status: 401 }
      );
    }

    const token = createCustomerSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name || 'Devotee'}!`,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || null,
        email: user.email || null,
        hasPassword: true,
      },
      token,
    });

    response.cookies.set({
      name: 'customer_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    console.error('[auth/login-password] Error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}