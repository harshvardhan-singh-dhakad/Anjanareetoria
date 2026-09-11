import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyStreamToken } from '@/lib/ebook/token';
import { WATERMARKED_DIR } from '@/lib/ebook/storage';
import { watermarkAndCache } from '@/lib/ebook/watermark';
import { logEbookAccess } from '@/lib/ebook/abuseTracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required.' },
        { status: 401 }
      );
    }

    const payload = verifyStreamToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token has expired or is invalid. Please refresh the reader page.' },
        { status: 403 }
      );
    }

    // Determine client IP and User-Agent for abuse logging
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log this access event
    logEbookAccess(payload.orderId, clientIp, userAgent);

    // Locate cached watermarked PDF file
    let filePath = path.join(WATERMARKED_DIR, `${payload.orderId}.pdf`);

    if (!fs.existsSync(filePath)) {
      filePath = await watermarkAndCache(payload.orderId);
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Stream PDF directly to client with security headers (no disk path exposed)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Karodon-Ka-Rahasya.pdf"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (error: unknown) {
    console.error('[ebook/view] Error streaming PDF:', error);
    return NextResponse.json(
      { error: 'Failed to stream document.' },
      { status: 500 }
    );
  }
}
