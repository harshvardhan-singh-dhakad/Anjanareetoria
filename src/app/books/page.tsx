import React from 'react';
import type { Metadata } from 'next';
import { BooksCatalogClient } from './BooksCatalogClient';
import { getBooks } from '@/lib/db/cmsStore';

export const metadata: Metadata = {
  title: 'Spiritual Books & Instant E-Books | AR Blessings',
  description: 'Explore our sacred collection of Vedic manifestation books, prosperity e-books, and daily ritual workbooks. Available in instant digital format and hardcover editions.',
};

export default function BooksPage() {
  const books = getBooks();
  return <BooksCatalogClient initialBooks={books} />;
}
