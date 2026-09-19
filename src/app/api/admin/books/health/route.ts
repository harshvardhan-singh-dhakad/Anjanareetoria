import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getMySQLPool, initializeDatabaseTables, isMySQLConfigured } from '@/lib/db/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const configured = isMySQLConfigured();
  const pool = getMySQLPool();

  if (!configured || !pool) {
    return NextResponse.json({
      success: false,
      status: 'mysql_not_configured',
      message: 'Live MySQL environment variables are not configured for the application.',
    }, { status: 503 });
  }

  const initialized = await initializeDatabaseTables();
  if (!initialized) {
    return NextResponse.json({
      success: false,
      status: 'mysql_initialization_failed',
      message: 'MySQL credentials exist, but the application could not initialize the required CMS tables.',
    }, { status: 503 });
  }

  try {
    const [bookRows] = await pool.query('SELECT COUNT(*) AS count FROM books') as [any[], any];
    const [mediaRows] = await pool.query('SELECT COUNT(*) AS count FROM media_assets') as [any[], any];
    const [specialRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM special_sections WHERE id = ?',
      ['lakshmi-journey']
    ) as [any[], any];

    return NextResponse.json({
      success: true,
      status: 'connected',
      storage: {
        books: Number(bookRows?.[0]?.count || 0),
        media: Number(mediaRows?.[0]?.count || 0),
        lakshmiSpecialSection: Number(specialRows?.[0]?.count || 0),
      },
      databaseConfigured: true,
    });
  } catch (error) {
    console.error('[admin/books/health] MySQL health check failed:', error);
    return NextResponse.json({
      success: false,
      status: 'mysql_query_failed',
      message: 'MySQL is configured but the live CMS query failed.',
    }, { status: 503 });
  }
}
