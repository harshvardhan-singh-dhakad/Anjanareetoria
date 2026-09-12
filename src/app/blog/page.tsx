import React from 'react';
import type { Metadata } from 'next';
import { BlogCatalogClient } from './BlogCatalogClient';
import { getBlogs } from '@/lib/db/cmsStore';

export const metadata: Metadata = {
  title: 'Blog & Spiritual Insights | AR Blessings',
  description: 'Explore authentic articles on Vedic manifestation laws, sacred geometry of prosperity wallets, home Vastu guidelines, and morning abundance rituals.',
};

export default function BlogPage() {
  const blogs = getBlogs();
  return <BlogCatalogClient initialBlogs={blogs} />;
}
