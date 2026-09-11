import React from 'react';
import type { Metadata } from 'next';
import { BlogCatalogClient } from './BlogCatalogClient';

export const metadata: Metadata = {
  title: 'Blog & Spiritual Insights | AR Blessings',
  description: 'Explore authentic articles on Vedic manifestation laws, sacred geometry of prosperity wallets, home Vastu guidelines, and morning abundance rituals.',
};

export default function BlogPage() {
  return <BlogCatalogClient />;
}
