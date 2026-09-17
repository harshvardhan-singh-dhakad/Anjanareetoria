import React from 'react';
import type { Metadata } from 'next';
import { BlogCatalogClient } from './BlogCatalogClient';
import { getBlogsAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & Spiritual Insights | AR Blessings',
  description: 'Explore authentic articles on Vedic manifestation laws, sacred geometry of prosperity wallets, home Vastu guidelines, and morning abundance rituals.',
};

export default async function BlogPage() {
  const blogs = await getBlogsAsync();
  return <BlogCatalogClient initialBlogs={blogs} />;
}
