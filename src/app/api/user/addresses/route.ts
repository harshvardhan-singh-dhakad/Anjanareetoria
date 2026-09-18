import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCustomerSessionToken,
  getUserAddressesAsync,
  saveUserAddressAsync,
  deleteUserAddressAsync,
} from '@/lib/auth/userStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get('customer_session')?.value;
  if (!cookie) return null;
  const session = verifyCustomerSessionToken(cookie);
  return session ? session.userId : null;
}

export async function GET(req: NextRequest) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const addresses = await getUserAddressesAsync(userId);
    return NextResponse.json({ success: true, addresses });
  } catch (error: unknown) {
    console.error('[user/addresses] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, fullName, phone, altPhone, streetAddress, landmark, city, state, pincode, isDefault } = body;

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanPincode = String(pincode || '').replace(/\D/g, '');

    if (!fullName || !streetAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Please provide recipient name, street address, city, state, and pincode.' },
        { status: 400 }
      );
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Mobile number is mandatory. Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    if (cleanPincode.length !== 6) {
      return NextResponse.json(
        { error: 'Please provide a valid 6-digit PIN code.' },
        { status: 400 }
      );
    }

    const saved = await saveUserAddressAsync(userId, {
      id,
      fullName: String(fullName).trim(),
      phone: cleanPhone,
      altPhone: altPhone ? String(altPhone).replace(/\D/g, '').slice(-10) : undefined,
      streetAddress: String(streetAddress).trim(),
      landmark: landmark ? String(landmark).trim() : undefined,
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: cleanPincode,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully.',
      address: saved,
    });
  } catch (error: unknown) {
    console.error('[user/addresses] POST error:', error);
    return NextResponse.json({ error: 'Failed to save address.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Address ID required.' }, { status: 400 });
    }

    const success = await deleteUserAddressAsync(userId, id);
    return NextResponse.json({ success, message: 'Address removed.' });
  } catch (error: unknown) {
    console.error('[user/addresses] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete address.' }, { status: 500 });
  }
}