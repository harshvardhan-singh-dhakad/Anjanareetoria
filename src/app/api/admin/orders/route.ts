import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getAllOrdersAsync } from '@/lib/ebook/orderStore';
import { getAbuseReport } from '@/lib/ebook/abuseTracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const orders = await getAllOrdersAsync();
    const abuseReport = getAbuseReport();

    return NextResponse.json({
      success: true,
      orders,
      data: orders,
      abuseReport,
    });
  } catch (err: unknown) {
    console.error('[admin/orders] Error fetching orders:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
