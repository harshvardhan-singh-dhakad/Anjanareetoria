import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBooks } from '@/lib/db/cmsStore';
import { BookDetailClient } from './BookDetailClient';

export function generateStaticParams() {
  const allBooks = getBooks();
  return allBooks.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const allBooks = getBooks();
  const book = allBooks.find((b) => b.slug === params.slug);
  if (!book) {
    return {
      title: 'Book Not Found | AR Blessings',
    };
  }

  return {
    title: `${book.name} | AR Blessings Publications`,
    description: book.shortDescription,
    openGraph: {
      title: book.name,
      description: book.shortDescription,
      images: [{ url: book.image }],
    },
  };
}

import { getCrossRecommendations } from '@/lib/recommendations';

export default function BookDetailPage({ params }: { params: { slug: string } }) {
  const allBooks = getBooks();
  const book = allBooks.find((b) => b.slug === params.slug);

  if (!book) {
    notFound();
  }

  const recommendations = getCrossRecommendations({
    currentType: 'book',
    currentSlug: book.slug,
    category: book.category,
    limitBooks: 3,
    limitProducts: 3,
    limitWebinars: 2,
  });

  return (
    <BookDetailClient
      book={book}
      relatedBooks={recommendations.relatedBooks}
      relatedProducts={recommendations.relatedProducts}
      relatedWebinars={recommendations.relatedWebinars}
    />
  );
}
