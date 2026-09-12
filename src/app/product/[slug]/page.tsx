import React from 'react';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/db/cmsStore';
import { ProductDetailClient } from './ProductDetailClient';

export function generateStaticParams() {
  const allProducts = getProducts();
  return allProducts.map((product) => ({
    slug: product.slug,
  }));
}

import { getCrossRecommendations } from '@/lib/recommendations';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const allProducts = getProducts();
  const product = allProducts.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const recommendations = getCrossRecommendations({
    currentType: 'product',
    currentSlug: product.slug,
    category: product.category,
    limitProducts: 4,
    limitBooks: 3,
    limitWebinars: 2,
  });

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={recommendations.relatedProducts}
      relatedBooks={recommendations.relatedBooks}
      relatedWebinars={recommendations.relatedWebinars}
    />
  );
}
