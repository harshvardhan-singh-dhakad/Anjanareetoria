import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken } from '@/lib/auth/userStore';
import { findOrdersByCustomerAsync } from '@/lib/ebook/orderStore';
import { getBooksAsync } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('customer_session')?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const session = verifyCustomerSessionToken(cookieToken);
    if (!session || (!session.email && !session.phone)) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const orders = await findOrdersByCustomerAsync({
      email: session.email,
      phone: session.phone,
    });
    const books = await getBooksAsync();

    // Filter paid orders containing ebooks
    const paidOrders = orders.filter((o) => o.status === 'paid');

    const purchasedEbooks: any[] = [];

    for (const o of paidOrders) {
      const isBookType = o.itemType === 'book';
      const hasEbookMeta = Boolean(o.metadata?.hasDigitalEbook || o.metadata?.format === 'ebook');
      const hasEbookInTitle = (o.itemTitle || '').toLowerCase().includes('e-book') || (o.itemTitle || '').toLowerCase().includes('digital');
      const isEbookProduct = (o.productId || '').toLowerCase().includes('ebook') || (o.productId || '').startsWith('bk-');

      if (isBookType || hasEbookMeta || hasEbookInTitle || isEbookProduct) {
        // Find matching book data for image and description
        const cleanId = (o.productId || '').replace(/-(ebook|physical)$/, '');
        const bookData = books.find((b) => b.id === cleanId || b.slug === cleanId) || books[0];

        purchasedEbooks.push({
          orderId: o.orderId,
          paymentId: o.paymentId,
          productId: o.productId,
          title: bookData?.name || o.itemTitle || 'Karodon Ka Rahasya',
          author: bookData?.author || 'AR Blessings Research Guild',
          image: bookData?.image || '/images/books/karodon-ka-rahasya.svg',
          slug: bookData?.slug || 'karodon-ka-rahasya',
          purchaseDate: o.purchaseTimestamp,
          amount: o.amount,
          readerUrl: `/reader?phone=${encodeURIComponent(o.buyerPhone || session.phone || '')}&orderId=${o.orderId}`,
          downloadUrl: `/api/ebook/download?orderId=${o.orderId}&phone=${encodeURIComponent(o.buyerPhone || session.phone || '')}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ebooks: purchasedEbooks,
      count: purchasedEbooks.length,
    });
  } catch (error: unknown) {
    console.error('[user/ebooks] Error fetching customer ebooks:', error);
    return NextResponse.json({ error: 'Failed to fetch e-books.' }, { status: 500 });
  }
}
