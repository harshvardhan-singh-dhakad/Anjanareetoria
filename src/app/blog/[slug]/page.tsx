import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogsAsync } from '@/lib/db/cmsStore';
import { BlogPostClient } from './BlogPostClient';
import { BlogArticleSchema, BreadcrumbSchema } from '@/components/SchemaMarkup';
import { getCrossRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const allBlogs = await getBlogsAsync();
  const post = allBlogs.find((b) => b.slug === params.slug);
  if (!post) {
    return {
      title: 'Article Not Found | AR Blessings',
    };
  }

  return {
    title: `${post.title} | AR Blessings Journal`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
      type: 'article',
      publishedTime: new Date(post.publishedDate).toISOString(),
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const allBlogs = await getBlogsAsync();
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
    <>
      <BlogArticleSchema post={post} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://arblessings.com' },
          { name: 'Spiritual Journal', url: 'https://arblessings.com/blog' },
          { name: post.title, url: `https://arblessings.com/blog/${post.slug}` },
        ]}
      />
      <BlogPostClient
        post={post}
        relatedBlogs={recommendations.relatedBlogs}
        relatedProducts={recommendations.relatedProducts}
        relatedBooks={recommendations.relatedBooks}
        relatedWebinars={recommendations.relatedWebinars}
      />
    </>
  );
}
