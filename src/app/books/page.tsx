import React from 'react';
import type { Metadata } from 'next';
import { BooksCatalogClient } from './BooksCatalogClient';

export const metadata: Metadata = {
  title: 'Spiritual Books & Instant E-Books | AR Blessings',
  description: 'Explore our sacred collection of Vedic manifestation books, prosperity e-books, and daily ritual workbooks. Available in instant digital format and hardcover editions.',
};

export default function BooksPage() {
  return <BooksCatalogClient />;
}
