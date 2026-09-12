import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getProducts, saveProduct, deleteProduct } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = {
      id: body.id || Date.now().toString(),
      slug,
      name: body.name,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 10,
      image: body.image || '/images/products/dollar.jpg',
      hoverImage: body.hoverImage,
      inStock: body.inStock !== false,
      category: body.category || 'General',
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      features: Array.isArray(body.features) ? body.features : [],
    };

    saveProduct(product);
    return NextResponse.json({ success: true, message: 'Product saved successfully.', product });
  } catch (err: unknown) {
    console.error('[admin/products] Error:', err);
    return NextResponse.json({ error: 'Failed to save product.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Product ID required for deletion.' }, { status: 400 });
  }

  deleteProduct(id);
  return NextResponse.json({ success: true, message: 'Product deleted.' });
}
