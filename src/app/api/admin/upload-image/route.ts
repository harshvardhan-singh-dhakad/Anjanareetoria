import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';

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
    if (!validExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file format. Use JPG, PNG, WebP or SVG.' }, { status: 400 });
    }

    const publicUploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    const rootUploadsDir = path.join(process.cwd(), 'images', 'uploads');

    if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
    if (!fs.existsSync(rootUploadsDir)) fs.mkdirSync(rootUploadsDir, { recursive: true });

    const cleanBaseName = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${Date.now()}_${cleanBaseName}${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(path.join(publicUploadsDir, filename), buffer);
    fs.writeFileSync(path.join(rootUploadsDir, filename), buffer);

    const publicUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (err: unknown) {
    console.error('[admin/upload-image] Error:', err);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
