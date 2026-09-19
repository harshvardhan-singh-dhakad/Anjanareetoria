import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getMySQLPool, initializeDatabaseTables } from '@/lib/db/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded. Please select a file.' }, { status: 400 });
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    const ext = path.extname(file.name).toLowerCase();
    const mimeType = file.type || '';
    if (!validExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file format. Use JPG, PNG, WebP, SVG or GIF.' }, { status: 400 });
    }
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'The uploaded file is not a valid image.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image is too large. Maximum size is 10 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prefer database-backed media so a Hostinger code deployment cannot remove an
    // image that the admin uploaded after the deployment. The returned URL is stable
    // and the image is served by /api/media/:id.
    const pool = getMySQLPool();
    if (pool) {
      try {
        await initializeDatabaseTables();
        const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        await pool.query(
          `INSERT INTO media_assets (id, original_name, mime_type, byte_size, data)
           VALUES (?, ?, ?, ?, ?)`,
          [id, file.name.slice(0, 255), mimeType, buffer.length, buffer]
        );

        return NextResponse.json({
          success: true,
          url: `/api/media/${id}`,
          filename: id,
          storage: 'mysql',
        });
      } catch (dbErr) {
        console.error('[admin/upload-image] MySQL media storage failed:', dbErr);
        return NextResponse.json(
          { error: 'Image could not be saved to persistent media storage. Please retry.' },
          { status: 500 }
        );
      }
    }

    // Development / no-MySQL fallback.
    const publicUploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    const rootUploadsDir = path.join(process.cwd(), 'images', 'uploads');

    if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
    if (!fs.existsSync(rootUploadsDir)) fs.mkdirSync(rootUploadsDir, { recursive: true });

    const cleanBaseName = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${Date.now()}_${cleanBaseName}${ext}`;

    fs.writeFileSync(path.join(publicUploadsDir, filename), buffer);
    fs.writeFileSync(path.join(rootUploadsDir, filename), buffer);

    const publicUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      storage: 'filesystem',
    });
  } catch (err: unknown) {
    console.error('[admin/upload-image] Error:', err);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
