import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/ebook/orderStore';
import { watermarkAndCache } from '@/lib/ebook/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles Razorpay payment webhook (e.g. payment.captured, order.paid)
 * and generates the per-buyer watermarked PDF copy immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both raw Razorpay webhook format and custom manual test triggers
    let orderId: string;
    let buyerPhone: string;
    let buyerEmail: string;
    let paymentId: string;
    let amount: number;

    if (body.event && body.payload?.payment?.entity) {
      // Standard Razorpay Webhook structure
      const payment = body.payload.payment.entity;
      orderId = payment.order_id || `ORD-${Date.now().toString().slice(-6)}`;
      buyerPhone = payment.contact || '9876543210';
      buyerEmail = payment.email || 'customer@example.com';
      paymentId = payment.id;
      amount = (payment.amount || 50000) / 100;
    } else {
      // Direct simulation payload
      orderId = body.orderId || `ARB-${Date.now().toString().slice(-5)}`;
      buyerPhone = body.buyerPhone || '9876543210';
      buyerEmail = body.buyerEmail || 'buyer@example.com';
      paymentId = body.paymentId || `pay_sim_${Date.now().toString().slice(-6)}`;
      amount = body.amount || 500;
    }

    // 1. Create and persist the order record
    const newOrder = {
      orderId: orderId.toUpperCase(),
      buyerPhone,
      buyerEmail,
      productId: body.productId || 'bk-101',
      paymentId,
      purchaseTimestamp: Date.now(),
      amount,
      status: 'paid' as const,
    };

    saveOrder(newOrder);

    // 2. Pre-generate and cache the watermarked PDF in background
    try {
      await watermarkAndCache(newOrder.orderId);
    } catch (wmError) {
      console.error('[webhook/razorpay] Background watermarking error:', wmError);
      // Even if background pre-generation fails, order is saved and view-token will retry on demand
    }

    return NextResponse.json({
      success: true,
      message: 'Payment received, order recorded, and watermarked copy generated.',
      order: newOrder,
    });
  } catch (error: unknown) {
    console.error('[webhook/razorpay] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
