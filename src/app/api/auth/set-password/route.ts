import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByPhoneAsync,
  findUserByIdAsync,
  updateUserPasswordAsync,
  updateUserProfileAsync,
  verifyCustomerSessionToken,
} from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, confirmPassword, phone, name, email } = body;

    // Determine user either from cookie or phone
    const sessionCookie = req.cookies.get('customer_session')?.value;
    const session = sessionCookie ? verifyCustomerSessionToken(sessionCookie) : null;

    let targetUser = null;
    if (session) {
      targetUser = await findUserByIdAsync(session.userId);
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      targetUser = await findUserByPhoneAsync(cleanPhone);
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User session not found. Please verify your phone number with OTP first.' },
        { status: 401 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please verify both fields.' },
        { status: 400 }
      );
    }

    await updateUserPasswordAsync(targetUser.id, password);

    // Optionally update name/email if passed
    if (name || email) {
      await updateUserProfileAsync(targetUser.id, { name, email });
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated! You can now sign in with your mobile number and password.',
    });
  } catch (error: unknown) {
    console.error('[auth/set-password] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update password.' },
      { status: 500 }
    );
  }
}