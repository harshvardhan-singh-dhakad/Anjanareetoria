import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { BooksHomeSection } from '@/components/BooksHomeSection';
import { BlogHomeSection } from '@/components/BlogHomeSection';
import { VideoSection } from '@/components/VideoSection';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { getProductsAsync, getBooksAsync, getBlogsAsync, getSiteSettingsAsync } from '@/lib/db/cmsStore';
import { ProductListSchema } from '@/components/SchemaMarkup';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, books, blogs, siteSettings] = await Promise.all([
    getProductsAsync(),
    getBooksAsync(),
    getBlogsAsync(),
    getSiteSettingsAsync(),
  ]);

  return (
    <div className="w-full">
      <ProductListSchema products={products} />
      {/* Hero Banner Section */}
      <HeroBanner settings={siteSettings} />

      {/* Products Catalog Section */}
      <section id="products" className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          {/* Section Headers */}
          <div className="text-center mb-10">
            <h3 className="text-sm font-bold tracking-widest text-[#0008c1] uppercase mb-2">
              {siteSettings.productsKicker}
            </h3>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
              {siteSettings.productsTitle}
            </h2>
          </div>

          {/* 3-Column Products Grid matching Elementor / WooCommerce */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sacred Books & E-Books Showcase */}
      <BooksHomeSection initialBooks={books} settings={siteSettings} />

      {/* Video Insights Section */}
      <VideoSection settings={siteSettings} />

      {/* Accomplishment Sagas / Reviews */}
      <TestimonialCarousel settings={siteSettings} />

      {/* Spiritual Journal & Blog Section */}
      <BlogHomeSection initialBlogs={blogs} />
    </div>
  );
}
