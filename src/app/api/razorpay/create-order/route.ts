import { NextRequest, NextResponse } from 'next/server';
import { getProductsAsync, getBooksAsync, getWebinarsAsync } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, itemId, format, quantity = 1, items, customer } = body;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[razorpay/create-order] Missing Razorpay credentials in environment.');
      return NextResponse.json(
        { error: 'Payment gateway is temporarily unconfigured. Please contact support.' },
        { status: 500 }
      );
    }

    let calculatedAmount = 0; // in INR
    let orderDescription = '';
    let itemTitle = '';

    if (type === 'webinar') {
      const webinars = await getWebinarsAsync();
      const webinar = webinars.find((w) => w.id === itemId || w.slug === itemId);

      if (!webinar) {
        return NextResponse.json({ error: 'Webinar masterclass not found.' }, { status: 404 });
      }

      calculatedAmount = Number(webinar.price) || 0;
      itemTitle = webinar.title;
      orderDescription = `Enrollment: ${webinar.title}`;

      if (calculatedAmount <= 0) {
        return NextResponse.json({
          isFree: true,
          amount: 0,
          currency: 'INR',
          message: 'This masterclass is complimentary. No payment required.',
        });
      }
    } else if (type === 'book') {
      const books = await getBooksAsync();
      let book = books.find((b) => b.id === itemId || b.slug === itemId);

      if (!book) {
        const { books: staticBooks } = await import('@/data/books');
        book = staticBooks.find((b) => b.id === itemId || b.slug === itemId) as any;
        if (book) {
          const { saveBookAsync } = await import('@/lib/db/cmsStore');
          saveBookAsync(book as any).catch(() => {});
        }
      }

      // Explicit fail-safe for Lakshmi Journey offerings
      if (!book) {
        if (itemId === 'bk-lakshmi-75' || itemId === '75-days-to-welcome-maa-lakshmi') {
          book = {
            id: 'bk-lakshmi-75',
            slug: '75-days-to-welcome-maa-lakshmi',
            name: '75 Days to Welcome Maa Lakshmi',
            title: '75 Days to Welcome Maa Lakshmi',
            price: 500,
            ebookPrice: 500,
            formatType: 'ebook',
          } as any;
        } else if (itemId === 'prod-lakshmi-combo' || itemId === 'the-complete-lakshmi-journey-combo') {
          book = {
            id: 'prod-lakshmi-combo',
            slug: 'the-complete-lakshmi-journey-combo',
            name: 'The Complete Lakshmi Journey (Book + 75-Day Digital Guide Combo)',
            title: 'The Complete Lakshmi Journey (Book + 75-Day Digital Guide Combo)',
            price: 1750,
            physicalPrice: 1750,
            formatType: 'both',
          } as any;
        } else if (itemId === 'bk-main-lakshmi-hoon' || itemId === 'main-lakshmi-hoon') {
          book = {
            id: 'bk-main-lakshmi-hoon',
            slug: 'main-lakshmi-hoon',
            name: 'Main Lakshmi Hoon (Physical Book Edition)',
            title: 'Main Lakshmi Hoon (Physical Book Edition)',
            price: 1250,
            physicalPrice: 1250,
            formatType: 'physical',
          } as any;
        }
      }

      if (!book) {
        return NextResponse.json({ error: 'Book publication not found.' }, { status: 404 });
      }

      let unitPrice = 0;
      const isEbook = format === 'ebook' || book.formatType === 'ebook';

      if (book.id === 'bk-lakshmi-75' || book.slug === '75-days-to-welcome-maa-lakshmi') {
        unitPrice = 500;
        itemTitle = '75 Days to Welcome Maa Lakshmi (75-Day Digital Guide)';
      } else if (book.id === 'prod-lakshmi-combo' || book.slug === 'the-complete-lakshmi-journey-combo') {
        unitPrice = 1750;
        itemTitle = 'The Complete Lakshmi Journey (Book + 75-Day Digital Guide Combo)';
      } else if (book.id === 'bk-main-lakshmi-hoon' || book.slug === 'main-lakshmi-hoon') {
        unitPrice = 1250;
        itemTitle = 'Main Lakshmi Hoon (Physical Book Edition)';
      } else {
        unitPrice = isEbook
          ? (book.ebookPrice || book.price)
          : (book.physicalPrice || (book.price + 200));
        itemTitle = `${book.name || (book as any).title} (${isEbook ? 'Digital E-Book' : 'Printed Edition'})`;
      }

      const qty = Math.max(1, Number(quantity) || 1);
      calculatedAmount = unitPrice * qty;
      orderDescription = `${itemTitle} x ${qty}`;
    } else if (type === 'product') {
      // Cart items checkout or single product buy
      if (Array.isArray(items) && items.length > 0) {
        const allProducts = await getProductsAsync();
        let total = 0;
        const titles: string[] = [];

        for (const it of items) {
          const prodId = it.productId || it.id;
          const cleanId = String(prodId).replace(/-(ebook|physical)$/, '');
          const p = allProducts.find((prod) => prod.id === cleanId || prod.slug === cleanId);
          const price = p ? p.price : Number(it.price) || 0;
          const qty = Math.max(1, Number(it.quantity) || 1);
          total += price * qty;
          titles.push(`${p ? p.name : it.name || 'Sacred Item'} x ${qty}`);
        }

        calculatedAmount = total;
        itemTitle = titles.slice(0, 3).join(', ') + (titles.length > 3 ? '...' : '');
        orderDescription = `AR Blessings Cart Order (${items.length} items)`;
      } else if (itemId) {
        const allProducts = await getProductsAsync();
        const p = allProducts.find((prod) => prod.id === itemId || prod.slug === itemId);
        if (!p) {
          return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }
        const qty = Math.max(1, Number(quantity) || 1);
        calculatedAmount = p.price * qty;
        itemTitle = p.name;
        orderDescription = `${p.name} x ${qty}`;
      } else {
        return NextResponse.json({ error: 'No items provided for order.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid order type specified.' }, { status: 400 });
    }

    if (calculatedAmount <= 0) {
      return NextResponse.json({ error: 'Order amount must be greater than zero.' }, { status: 400 });
    }

    const amountInPaise = Math.round(calculatedAmount * 100);
    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;

    // Call official Razorpay Orders API
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          type,
          itemId: String(itemId || ''),
          format: String(format || ''),
          customerPhone: customer?.phone || '',
          customerName: customer?.name || '',
          customerEmail: customer?.email || '',
          description: orderDescription.slice(0, 200),
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errBody = await rzpResponse.text();
      console.error('[razorpay/create-order] Razorpay API error:', rzpResponse.status, errBody);
      return NextResponse.json(
        { error: 'Failed to create payment order with gateway. Please try again.' },
        { status: 502 }
      );
    }

    const rzpOrder = await rzpResponse.json();

    // Generate hosted payment link / QR code companion
    let paymentLinkUrl: string | undefined = undefined;
    try {
      const cleanCustomerPhone = customer?.phone ? String(customer.phone).replace(/\D/g, '').slice(-10) : '';
      const plResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          description: orderDescription.slice(0, 200),
          customer: {
            name: customer?.name || 'Devotee',
            email: customer?.email || undefined,
            contact: cleanCustomerPhone ? `+91${cleanCustomerPhone}` : undefined,
          },
          notify: {
            sms: false,
            email: false,
          },
          reminder_enable: false,
          notes: {
            type,
            itemId: String(itemId || ''),
            format: String(format || ''),
            orderId: rzpOrder.id,
          },
        }),
      });
      if (plResponse.ok) {
        const plData = await plResponse.json();
        paymentLinkUrl = plData.short_url;
      }
    } catch (plErr) {
      console.warn('[razorpay/create-order] Payment link generation optional fallback:', plErr);
    }

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      amountInInr: calculatedAmount,
      currency: rzpOrder.currency,
      keyId,
      itemTitle,
      description: orderDescription,
      paymentLink: paymentLinkUrl,
      qrCodeUrl: paymentLinkUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLinkUrl)}`
        : undefined,
    });
  } catch (error: unknown) {
    console.error('[razorpay/create-order] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while initiating payment.' },
      { status: 500 }
    );
  }
}
