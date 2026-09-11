import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { books } from '@/data/books';
import { BookDetailClient } from './BookDetailClient';

export function generateStaticParams() {
  return books.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const book = books.find((b) => b.slug === params.slug);
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

export default function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = books.find((b) => b.slug === params.slug);

  if (!book) {
    notFound();
  }

  return <BookDetailClient book={book} />;
}
