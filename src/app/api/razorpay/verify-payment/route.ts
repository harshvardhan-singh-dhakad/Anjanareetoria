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

    // 2. Confirm the payment directly with Razorpay. Never trust the browser-supplied amount.
    const keyId = process.env.RAZORPAY_KEY_ID;
    const gatewayAuth = keyId && keySecret
      ? 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
      : '';

    if (!gatewayAuth) {
      return NextResponse.json({ error: 'Razorpay server configuration is incomplete.' }, { status: 500 });
    }

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      {
        headers: { Authorization: gatewayAuth },
        cache: 'no-store',
      }
    );

    if (!paymentResponse.ok) {
      const raw = await paymentResponse.text();
      console.error('[razorpay/verify-payment] Razorpay payment lookup failed:', raw);
      return NextResponse.json({ error: 'Unable to confirm payment with Razorpay.' }, { status: 502 });
    }

    const paymentEntity = await paymentResponse.json();
    if (
      paymentEntity?.id !== razorpay_payment_id ||
      paymentEntity?.order_id !== razorpay_order_id ||
      !['captured', 'authorized'].includes(String(paymentEntity?.status || '').toLowerCase())
    ) {
      return NextResponse.json({ error: 'Razorpay payment is not in a verified captured state.' }, { status: 400 });
    }

    const gatewayAmountInInr = Number(paymentEntity.amount || 0) / 100;
    if (gatewayAmountInInr <= 0) {
      return NextResponse.json({ error: 'Verified payment amount is invalid.' }, { status: 400 });
    }

    // Idempotency: a payment can only create one AR Blessings order.
    const existingOrders = await (async () => {
      const { getMySQLPool, initializeDatabaseTables } = await import('@/lib/db/database');
      const pool = getMySQLPool();
      if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');
      if (!(await initializeDatabaseTables())) throw new Error('MYSQL_INITIALIZATION_FAILED');
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE payment_id = ? ORDER BY created_at DESC LIMIT 1',
        [razorpay_payment_id]
      ) as [any[], any];
      return rows || [];
    })();

    if (existingOrders.length > 0) {
      const existing = existingOrders[0];
      return NextResponse.json({
        success: true,
        message: 'Payment already verified; existing order returned.',
        orderId: existing.order_id,
        paymentId: existing.payment_id,
        readerUrl: existing.status === 'PAID' && String(existing.item_type || '').toLowerCase() === 'book'
          ? `/reader?phone=${encodeURIComponent(existing.buyer_phone)}&orderId=${encodeURIComponent(existing.order_id)}`
          : null,
      });
    }

    // 3. Generate unique internal AR Blessings Order ID
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

    const prodKey = String(itemId || (items?.[0]?.productId || '')).toLowerCase();
    let crmTag: string | null = null;
    let requiresDispatch = false;

    if (prodKey.includes('lakshmi-75') || String(itemTitle).includes('75 दिन')) {
      crmTag = 'lakshmi-75-days-digital';
    } else if (prodKey.includes('lakshmi-combo') || String(itemTitle).includes('Complete Lakshmi Journey')) {
      crmTag = 'lakshmi-combo';
      requiresDispatch = true;
    } else if (prodKey.includes('main-lakshmi-hoon') || String(itemTitle).includes('Main Lakshmi Hoon')) {
      crmTag = 'main-lakshmi-hoon-book';
      requiresDispatch = true;
    } else if (shippingAddress && shippingAddress.length > 5 && !shippingAddress.toLowerCase().includes('digital delivery')) {
      requiresDispatch = true;
    }

    const hasDigitalEbook =
      crmTag === 'lakshmi-75-days-digital' ||
      crmTag === 'lakshmi-combo' ||
      (type === 'book' && format === 'ebook') ||
      (Array.isArray(items) &&
        items.some(
          (it: any) =>
            String(it.productId || it.id).includes('ebook') ||
            String(it.productId || it.id).includes('bk-lakshmi-75') ||
            String(it.productId || it.id).includes('lakshmi-combo') ||
            String(it.name || '').toLowerCase().includes('e-book') ||
            String(it.name || '').toLowerCase().includes('digital')
        ));

    // 4. Persist order record into MySQL orders table
    const orderRecord = {
      orderId: internalOrderId,
      paymentId: razorpay_payment_id,
      buyerPhone: cleanPhone,
      buyerEmail,
      productId: String(itemId || (items?.[0]?.productId || 'cart-checkout')),
      purchaseTimestamp: Date.now(),
      amount: gatewayAmountInInr,
      status: 'paid' as const,
      itemType: (crmTag?.includes('book') ? 'book' : hasDigitalEbook ? 'book' : (type || 'product')) as any,
      itemTitle: itemTitle || `${type ? type.toUpperCase() : 'PRODUCT'} Purchase`,
      customerName,
      shippingAddress: shippingAddress ? String(shippingAddress).trim() : undefined,
      metadata: {
        razorpay_order_id,
        razorpay_payment_id,
        format,
        hasDigitalEbook,
        requiresDispatch,
        crmTag,
        items,
        notes,
        webinarDetails,
      },
    };

    await saveOrderAsync(orderRecord);

    // 5. If eBook, pre-warm watermarked PDF and return reader & download URLs
    let readerUrl = null;
    let downloadUrl = null;
    if (hasDigitalEbook) {
      readerUrl = `/reader?phone=${encodeURIComponent(cleanPhone)}&orderId=${internalOrderId}`;
      downloadUrl = `/api/ebook/download?orderId=${internalOrderId}&phone=${encodeURIComponent(cleanPhone)}`;
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
      downloadUrl,
      hasDigitalEbook,
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
