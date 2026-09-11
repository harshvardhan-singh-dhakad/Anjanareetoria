import { NextRequest, NextResponse } from 'next/server';
import { findOrderByPhoneAndOrderId } from '@/lib/ebook/orderStore';
import { createSessionToken } from '@/lib/ebook/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, orderId } = body;

    if (!phone || !orderId) {
      return NextResponse.json(
        { error: 'Both phone number and Order ID are required.' },
        { status: 400 }
      );
    }

    const order = findOrderByPhoneAndOrderId(String(phone), String(orderId));

    if (!order) {
      return NextResponse.json(
        { error: 'No matching order found. Please check your phone number and Order ID.' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order payment has not been completed or has been refunded.' },
        { status: 403 }
      );
    }

    // Generate 24-hour buyer session JWT
    const sessionToken = createSessionToken({
      orderId: order.orderId,
      buyerPhone: order.buyerPhone,
      buyerEmail: order.buyerEmail,
    });

    const response = NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        buyerPhone: order.buyerPhone,
        buyerEmail: order.buyerEmail,
        purchaseTimestamp: order.purchaseTimestamp,
      },
      sessionToken,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: 'ebook_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error: unknown) {
    console.error('[verify-access] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during verification.' },
      { status: 500 }
    );
  }
}
