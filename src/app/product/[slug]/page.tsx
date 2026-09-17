import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductsAsync } from '@/lib/db/cmsStore';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductSchema, BreadcrumbSchema } from '@/components/SchemaMarkup';
import { getCrossRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const allProducts = await getProductsAsync();
  const product = allProducts.find((p) => p.slug === params.slug);
  if (!product) {
    return { title: 'Product Not Found | AR Blessings' };
  }

  return {
    title: `${product.name} — AR Blessings`,
    description: product.shortDescription,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.image }],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const allProducts = await getProductsAsync();
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
    <>
      <ProductSchema product={product} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://arblessings.com' },
          { name: 'Products', url: 'https://arblessings.com/#products' },
          { name: product.name, url: `https://arblessings.com/product/${product.slug}` },
        ]}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={recommendations.relatedProducts}
        relatedBooks={recommendations.relatedBooks}
        relatedWebinars={recommendations.relatedWebinars}
      />
    </>
  );
}
