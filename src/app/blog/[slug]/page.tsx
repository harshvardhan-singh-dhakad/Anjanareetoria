import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogs } from '@/lib/db/cmsStore';
import { BlogPostClient } from './BlogPostClient';

export function generateStaticParams() {
  const allBlogs = getBlogs();
  return allBlogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const allBlogs = getBlogs();
  const post = allBlogs.find((b) => b.slug === params.slug);
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

import { getCrossRecommendations } from '@/lib/recommendations';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const allBlogs = getBlogs();
  const post = allBlogs.find((b) => b.slug === params.slug);

  if (!post) {
    notFound();
  }

  const recommendations = getCrossRecommendations({
    currentType: 'blog',
    currentSlug: post.slug,
    category: post.category,
    limitBlogs: 3,
    limitProducts: 3,
    limitBooks: 3,
    limitWebinars: 2,
  });

  return (
    <BlogPostClient
      post={post}
      relatedBlogs={recommendations.relatedBlogs}
      relatedProducts={recommendations.relatedProducts}
      relatedBooks={recommendations.relatedBooks}
      relatedWebinars={recommendations.relatedWebinars}
    />
  );
}
