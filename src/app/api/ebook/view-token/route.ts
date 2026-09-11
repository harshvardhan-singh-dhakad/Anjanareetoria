import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, createStreamToken } from '@/lib/ebook/token';
import { watermarkAndCache } from '@/lib/ebook/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check cookie first, fallback to Authorization header
    const cookieToken = req.cookies.get('ebook_session')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. No valid session found.' },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Session has expired or is invalid. Please log in again.' },
        { status: 401 }
      );
    }

    // Ensure the watermarked copy is generated on disk
    try {
      await watermarkAndCache(session.orderId);
    } catch (err: unknown) {
      console.error('[view-token] Watermarking failed:', err);
      return NextResponse.json(
        { error: 'Failed to prepare personalized watermarked document.' },
        { status: 500 }
      );
    }

    // Generate short-lived (15-minute) single-purpose stream token
    const streamToken = createStreamToken({
      orderId: session.orderId,
      buyerPhone: session.buyerPhone,
    });

    return NextResponse.json({
      success: true,
      streamToken,
      expiresInSeconds: 15 * 60,
      streamUrl: `/api/ebook/view?token=${streamToken}`,
      orderId: session.orderId,
      buyerPhone: session.buyerPhone,
    });
  } catch (error: unknown) {
    console.error('[view-token] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while issuing view token.' },
      { status: 500 }
    );
  }
}
