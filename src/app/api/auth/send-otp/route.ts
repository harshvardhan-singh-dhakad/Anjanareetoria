import { NextRequest, NextResponse } from 'next/server';
import { generateAndSaveOtpAsync, findUserByPhoneAsync } from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || '');
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const { otp, expiresAt } = await generateAndSaveOtpAsync(cleanPhone);
    const existingUser = await findUserByPhoneAsync(cleanPhone);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}.`,
      isExistingUser: Boolean(existingUser),
      hasPassword: Boolean(existingUser?.passwordHash),
      // In development/demo, send preview OTP so user can test seamlessly
      devOtp: otp,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[auth/send-otp] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}