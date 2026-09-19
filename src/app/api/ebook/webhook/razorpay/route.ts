import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrderAsync } from '@/lib/ebook/orderStore';
import { watermarkAndCache } from '@/lib/ebook/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Razorpay webhook endpoint.
 * Raw-body signature validation is mandatory; simulated/manual payloads are rejected.
 */
export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[webhook/razorpay] Missing RAZORPAY_WEBHOOK_SECRET.');
      return NextResponse.json({ error: 'Webhook configuration error.' }, { status: 500 });
    }

    const rawBody = await req.text();
    const receivedSignature = req.headers.get('x-razorpay-signature') || '';
    if (!receivedSignature) {
      return NextResponse.json({ error: 'Missing Razorpay webhook signature.' }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(receivedSignature, 'utf8')
    )) {
      console.error('[webhook/razorpay] Signature verification failed.');
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = String(body?.event || '');

    if (!['payment.captured', 'order.paid'].includes(event)) {
      return NextResponse.json({ success: true, ignored: true, event });
    }

    const payment = body?.payload?.payment?.entity;
    const orderEntity = body?.payload?.order?.entity;
    if (!payment && !orderEntity) {
      return NextResponse.json({ error: 'Invalid Razorpay webhook payload.' }, { status: 400 });
    }

    const entity = payment || {};
    const notes = entity.notes || orderEntity?.notes || {};

    const orderId = String(entity.order_id || orderEntity?.id || '').toUpperCase();
    const paymentId = String(entity.id || '');
    const buyerPhone = String(entity.contact || notes.customerPhone || '').replace(/\D/g, '').slice(-10);
    const buyerEmail = String(entity.email || notes.customerEmail || '').trim();
    const amount = Number(entity.amount || orderEntity?.amount || 0) / 100;

    if (!orderId || !paymentId || amount <= 0) {
      return NextResponse.json({ error: 'Webhook payment data is incomplete.' }, { status: 400 });
    }

    const newOrder = {
      orderId,
      buyerPhone,
      buyerEmail,
      productId: String(notes.itemId || ''),
      paymentId,
      purchaseTimestamp: Date.now(),
      amount,
      status: 'paid' as const,
      itemType: (notes.type || 'product') as any,
      itemTitle: notes.description || undefined,
      customerName: notes.customerName || undefined,
      metadata: {
        source: 'razorpay_webhook',
        event,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        notes,
      },
    };

    await saveOrderAsync(newOrder);

    try {
      if (newOrder.itemType === 'book') {
        await watermarkAndCache(newOrder.orderId);
      }
    } catch (wmError) {
      console.error('[webhook/razorpay] Watermark pre-generation error:', wmError);
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay webhook verified and order recorded.',
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
