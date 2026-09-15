import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findOrderByIdAsync } from '@/lib/ebook/orderStore';
import { WATERMARKED_DIR } from '@/lib/ebook/storage';
import { watermarkAndCache } from '@/lib/ebook/watermark';
import { logEbookAccess } from '@/lib/ebook/abuseTracker';
import { verifyCustomerSessionToken } from '@/lib/auth/userStore';
import { verifySessionToken } from '@/lib/ebook/token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const paramPhone = searchParams.get('phone');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Valid Order ID is required to download your e-book.' },
        { status: 400 }
      );
    }

    // 1. Authenticate customer via session cookie or provided phone
    let authenticatedPhone: string | null = null;

    // Check Customer Session
    const customerCookie = req.cookies.get('customer_session')?.value;
    if (customerCookie) {
      const customerSession = verifyCustomerSessionToken(customerCookie);
      if (customerSession?.phone) {
        authenticatedPhone = customerSession.phone.replace(/\D/g, '').slice(-10);
      }
    }

    // Check Ebook Reader Session
    if (!authenticatedPhone) {
      const ebookCookie = req.cookies.get('ebook_session')?.value;
      if (ebookCookie) {
        const ebookSession = verifySessionToken(ebookCookie);
        if (ebookSession?.buyerPhone) {
          authenticatedPhone = ebookSession.buyerPhone.replace(/\D/g, '').slice(-10);
        }
      }
    }

    // Fallback to phone passed in URL (e.g. immediate post-checkout redirect)
    if (!authenticatedPhone && paramPhone) {
      authenticatedPhone = paramPhone.replace(/\D/g, '').slice(-10);
    }

    if (!authenticatedPhone) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in or provide verified phone number.' },
        { status: 401 }
      );
    }

    // 2. Fetch order details from database/disk
    const order = await findOrderByIdAsync(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please verify your order number.' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'This order is not completed or has been refunded.' },
        { status: 403 }
      );
    }

    // 3. Verify that phone number matches order record
    const orderPhone = order.buyerPhone.replace(/\D/g, '').slice(-10);
    if (orderPhone !== authenticatedPhone) {
      return NextResponse.json(
        { error: 'Unauthorized. This e-book license belongs to another mobile number.' },
        { status: 403 }
      );
    }

    // 4. Log download access event for abuse prevention
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    logEbookAccess(order.orderId, clientIp, userAgent);

    // 5. Ensure personalized watermarked PDF exists on disk
    let filePath = path.join(WATERMARKED_DIR, `${order.orderId}.pdf`);
    if (!fs.existsSync(filePath)) {
      filePath = await watermarkAndCache(order.orderId);
    }

    const fileBuffer = fs.readFileSync(filePath);

    // 6. Generate clean, descriptive download filename
    const bookTitleSlug = (order.itemTitle || 'AR-Blessings-EBook')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const downloadFilename = `${bookTitleSlug}-Licensed-Copy.pdf`;

    // 7. Stream file as attachment download with anti-piracy headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Download-Options': 'noopen',
      },
    });
  } catch (error: unknown) {
    console.error('[ebook/download] Error processing download:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while preparing your licensed download.' },
      { status: 500 }
    );
  }
}
