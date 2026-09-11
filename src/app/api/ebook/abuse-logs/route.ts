import { NextResponse } from 'next/server';
import { getAbuseReport } from '@/lib/ebook/abuseTracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = getAbuseReport();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    });
  } catch (error: unknown) {
    console.error('[abuse-logs] Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve abuse report.' },
      { status: 500 }
    );
  }
}
