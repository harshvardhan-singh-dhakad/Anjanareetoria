import { NextRequest, NextResponse } from 'next/server';
import { getMySQLPool, initializeDatabaseTables } from '@/lib/db/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cleanId = String(id || '').trim();

  if (!cleanId || cleanId.length > 120) {
    return new NextResponse('Invalid media id.', { status: 400 });
  }

  const pool = getMySQLPool();
  if (!pool) {
    return new NextResponse('Media storage is not configured.', { status: 404 });
  }

  try {
    await initializeDatabaseTables();

    const [rows] = await pool.query(
      'SELECT mime_type, byte_size, data FROM media_assets WHERE id = ? LIMIT 1',
      [cleanId]
    ) as [any[], any];

    if (!rows || rows.length === 0) {
      return new NextResponse('Media not found.', { status: 404 });
    }

    const row = rows[0];
    const data = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': row.mime_type || 'application/octet-stream',
        'Content-Length': String(row.byte_size || data.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[media] Failed to serve media:', error);
    return new NextResponse('Failed to load media.', { status: 500 });
  }
}
