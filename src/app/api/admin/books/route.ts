import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getBooksAsync, saveBookAsync, deleteBookAsync, ExtendedBook } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const books = await getBooksAsync();
  return NextResponse.json({ success: true, books });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Book title and price are required.' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const book: ExtendedBook = {
      id: body.id || `bk-${Date.now().toString().slice(-4)}`,
      slug,
      name: body.name,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 12,
      image: body.image || '/images/books/karodon-ka-rahasya.svg',
      inStock: body.inStock !== false,
      category: 'Books & E-Books',
      author: body.author || 'AR Blessings Research Guild',
      formatType: body.formatType || 'both',
      ebookPrice: body.ebookPrice ? Number(body.ebookPrice) : Number(body.price),
      physicalPrice: body.physicalPrice ? Number(body.physicalPrice) : Number(body.price) + 200,
      pages: body.pages ? Number(body.pages) : 200,
      language: body.language || 'Hindi & English',
      publishedYear: body.publishedYear ? Number(body.publishedYear) : new Date().getFullYear(),
      isbn: body.isbn,
      downloadFormat: body.downloadFormat || 'Instant PDF & EPUB',
      badge: body.badge,
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      features: Array.isArray(body.features) ? body.features : [],
      tableOfContents: Array.isArray(body.tableOfContents) ? body.tableOfContents : [],
      sampleExcerpt: body.sampleExcerpt || {
        chapterTitle: 'Sample Preview',
        paragraphs: ['Sample chapter preview content will appear here.']
      },
      pdfSourceFile: body.pdfSourceFile || 'karodon-ka-rahasya.pdf',
    };

    await saveBookAsync(book);
    return NextResponse.json({ success: true, message: 'Book saved successfully.', book });
  } catch (err: unknown) {
    console.error('[admin/books] Error:', err);
    return NextResponse.json({ error: 'Failed to save book.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Book ID required.' }, { status: 400 });
  }

  await deleteBookAsync(id);
  return NextResponse.json({ success: true, message: 'Book deleted.' });
}
