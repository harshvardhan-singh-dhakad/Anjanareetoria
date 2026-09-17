import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, ADMIN_EMAIL } from '@/lib/admin/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getAdminSession(req);
  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user || ADMIN_EMAIL,
    role: session.role || 'super_admin',
    fullControl: true,
  });
}
