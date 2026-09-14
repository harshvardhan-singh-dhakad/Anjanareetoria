import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { SOURCE_DIR, ensureStorageDirs } from '@/lib/ebook/storage';
import { getBooksAsync, saveBookAsync } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    const bookId = formData.get('bookId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Uploaded file must be a PDF document.' }, { status: 400 });
    }

    ensureStorageDirs();
    const cleanFilename = file.name.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
    const targetPath = path.join(SOURCE_DIR, cleanFilename);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(bytes));

    // If a bookId was passed, link this source file directly to the book record
    if (bookId) {
      const books = await getBooksAsync();
      const targetBook = books.find((b) => b.id === bookId || b.slug === bookId);
      if (targetBook) {
        targetBook.pdfSourceFile = cleanFilename;
        await saveBookAsync(targetBook);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Master PDF successfully uploaded to private storage as "${cleanFilename}".`,
      filename: cleanFilename,
    });
  } catch (err: unknown) {
    console.error('[admin/upload-pdf] Error:', err);
    return NextResponse.json({ error: 'Failed to upload PDF.' }, { status: 500 });
  }
}
