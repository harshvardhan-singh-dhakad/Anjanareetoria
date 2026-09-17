import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_EMAIL,
  ADMIN_PHONE,
  ADMIN_DEFAULT_PASSWORD,
  createAdminToken,
} from '@/lib/admin/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const primaryAdminEmail = (process.env.ADMIN_EMAIL || ADMIN_EMAIL).trim().toLowerCase();
    const allowedAdminPhone = (process.env.ADMIN_PHONE || ADMIN_PHONE || '8433558905').replace(/\D/g, '').slice(-10);
    const allowedPassword = process.env.ADMIN_PASSWORD || ADMIN_DEFAULT_PASSWORD;

    const rawInput = (username || '').trim().toLowerCase();
    const cleanInputPhone = rawInput.replace(/\D/g, '').slice(-10);

    // 1. Check identifier: Must strictly match either 40se40crore.merchandise@gmail.com OR 8433558905
    const isEmailValid = rawInput === primaryAdminEmail;
    const isPhoneValid = cleanInputPhone.length === 10 && cleanInputPhone === allowedAdminPhone;
    const isIdentifierValid = isEmailValid || isPhoneValid;

    // 2. Check password: Must strictly match Mahadev@2026
    const isPasswordValid = password === allowedPassword || password === 'Mahadev@2026';

    if (!isIdentifierValid || !isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials. Access is restricted exclusively to authorized Super Admin.' },
        { status: 401 }
      );
    }

    const adminUser = isEmailValid ? primaryAdminEmail : `+91 ${cleanInputPhone}`;
    const token = createAdminToken(adminUser);

    const response = NextResponse.json({
      success: true,
      message: 'Super Admin authentication successful with full access.',
      token,
      user: {
        identifier: adminUser,
        email: primaryAdminEmail,
        role: 'super_admin',
        fullControl: true,
      }
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
    return NextResponse.json({ error: 'Server error during admin login.' }, { status: 500 });
  }
}
