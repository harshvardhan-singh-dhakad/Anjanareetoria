import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrderAsync } from '@/lib/ebook/orderStore';
import { watermarkAndCache } from '@/lib/ebook/watermark';
import { getWebinarsAsync } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      itemId,
      format,
      amount,
      customer,
      items,
      shippingAddress,
      notes,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[razorpay/verify-payment] Missing RAZORPAY_KEY_SECRET in env.');
      return NextResponse.json({ error: 'Gateway configuration error.' }, { status: 500 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment signature verification parameters.' },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic HMAC SHA-256 signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('[razorpay/verify-payment] Signature mismatch!', {
        generated: generatedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // 2. Generate unique internal AR Blessings Order ID
    const internalOrderId = `ARB-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`;
    const cleanPhone = String(customer?.phone || '').replace(/\D/g, '').slice(-10);
    const buyerEmail = customer?.email?.trim() || `${cleanPhone || 'devotee'}@arblessings.com`;
    const customerName = customer?.name?.trim() || 'Valued Devotee';

    let itemTitle = body.itemTitle || '';
    let webinarDetails = null;

    if (type === 'webinar') {
      const webinars = await getWebinarsAsync();
      const webinar = webinars.find((w) => w.id === itemId || w.slug === itemId);
      if (webinar) {
        itemTitle = webinar.title;
        webinarDetails = {
          title: webinar.title,
          dateTime: webinar.dateTime,
          duration: webinar.duration,
          meetingUrl: webinar.registrationUrl || 'https://meet.google.com',
        };
      }
    }

    // 3. Persist order record into MySQL orders table
    const orderRecord = {
      orderId: internalOrderId,
      paymentId: razorpay_payment_id,
      buyerPhone: cleanPhone,
      buyerEmail,
      productId: String(itemId || (items?.[0]?.productId || 'cart-checkout')),
      purchaseTimestamp: Date.now(),
      amount: Number(amount) || 0,
      status: 'paid' as const,
      itemType: (type || 'product') as any,
      itemTitle: itemTitle || `${type ? type.toUpperCase() : 'PRODUCT'} Purchase`,
      customerName,
      shippingAddress: shippingAddress ? String(shippingAddress).trim() : undefined,
      metadata: {
        razorpay_order_id,
        razorpay_payment_id,
        format,
        items,
        notes,
        webinarDetails,
      },
    };

    await saveOrderAsync(orderRecord);

    // 4. If eBook, pre-warm watermarked PDF and return reader url
    let readerUrl = null;
    if (type === 'book' && format === 'ebook') {
      readerUrl = `/reader?phone=${encodeURIComponent(cleanPhone)}&orderId=${internalOrderId}`;
      try {
        await watermarkAndCache(internalOrderId);
      } catch (wmErr) {
        console.warn('[razorpay/verify-payment] Watermark prewarm warning:', wmErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      orderId: internalOrderId,
      paymentId: razorpay_payment_id,
      readerUrl,
      webinarDetails,
    });
  } catch (err: unknown) {
    console.error('[razorpay/verify-payment] Unexpected verification error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while finalizing payment verification.' },
      { status: 500 }
    );
  }
}
