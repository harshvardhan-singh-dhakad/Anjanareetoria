import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOtpAsync,
  findUserByPhoneAsync,
  createUserAsync,
  createCustomerSessionToken,
} from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || '');
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const otpCode = String(body.otp || '');
    const optionalName = body.name ? String(body.name).trim() : undefined;
    const optionalEmail = body.email ? String(body.email).trim() : undefined;

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number required.' },
        { status: 400 }
      );
    }

    if (!otpCode || otpCode.length < 4) {
      return NextResponse.json(
        { error: 'Please enter the 6-digit OTP.' },
        { status: 400 }
      );
    }

    const isValid = await verifyOtpAsync(cleanPhone, otpCode);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await findUserByPhoneAsync(cleanPhone);
    const isNewUser = !user;

    if (!user) {
      user = await createUserAsync(cleanPhone, optionalName, optionalEmail);
    }

    const token = createCustomerSessionToken(user);
    const response = NextResponse.json({
      success: true,
      message: isNewUser ? 'Welcome to AR Blessings!' : 'Welcome back!',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || null,
        email: user.email || null,
        hasPassword: Boolean(user.passwordHash),
      },
      isNewUser,
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
    console.error('[auth/verify-otp] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}