import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { blogs } from '@/data/blogs';
import { BlogPostClient } from './BlogPostClient';

export function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = blogs.find((b) => b.slug === params.slug);
  if (!post) {
    return {
      title: 'Article Not Found | AR Blessings',
    };
  }

  return {
    title: `${post.title} | AR Blessings Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogs.find((b) => b.slug === params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
