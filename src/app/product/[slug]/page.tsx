import React from 'react';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { ProductDetailClient } from './ProductDetailClient';

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
