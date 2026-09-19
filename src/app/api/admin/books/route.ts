import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getBooksAsync, saveBookAsync, deleteBookAsync, ExtendedBook } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const books = await getBooksAsync();
  return NextResponse.json({ success: true, books, data: books });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || body.price === undefined || body.price === null || Number.isNaN(Number(body.price))) {
      return NextResponse.json({ error: 'Book title and a valid price are required.' }, { status: 400 });
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

    // Verify the saved record through the same source the public /books page reads.
    // This prevents the admin UI from reporting success when MySQL rejected the write.
    const savedBooks = await getBooksAsync();
    const saved = savedBooks.find((b) => b.id === book.id);
    if (!saved) {
      return NextResponse.json(
        { error: 'Book was not persisted. Please check the database connection.' },
        { status: 500 }
      );
    }

    if (book.image && saved.image !== book.image) {
      return NextResponse.json(
        { error: 'Book was saved but the cover image did not persist. Please retry the image upload and save again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Book saved successfully.', book: saved });
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

  const before = await getBooksAsync();
  const target = before.find((b) => b.id === id || b.slug === id);
  if (!target) {
    return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
  }

  await deleteBookAsync(id);

  const after = await getBooksAsync();
  const stillExists = after.some((b) => b.id === id || b.slug === id);
  if (stillExists) {
    return NextResponse.json(
      { error: 'Book delete was not persisted. Please check the database connection.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'Book deleted.', deletedId: target.id });
}
