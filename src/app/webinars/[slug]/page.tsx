import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWebinarsAsync } from '@/lib/db/cmsStore';
import { WebinarDetailClient } from './WebinarDetailClient';
import { getCrossRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const webinars = await getWebinarsAsync();
  const webinar = webinars.find((w) => w.slug === params.slug);
  if (!webinar) {
    return {
      title: 'Webinar Not Found | AR Blessings',
    };
  }

  return {
    title: `${webinar.title} | Live Spiritual Masterclass`,
    description: webinar.description,
    openGraph: {
      title: webinar.title,
      description: webinar.subtitle || webinar.description,
      images: [{ url: webinar.bannerImage }],
    },
  };
}

export default async function WebinarDetailPage({ params }: { params: { slug: string } }) {
  const webinars = await getWebinarsAsync();
  const webinar = webinars.find((w) => w.slug === params.slug);

  if (!webinar) {
    notFound();
  }

  const recommendations = getCrossRecommendations({
    currentType: 'webinar',
    currentSlug: webinar.slug,
    limitBooks: 3,
    limitWebinars: 2,
    limitProducts: 3,
  });

  return (
    <WebinarDetailClient
      webinar={webinar}
      allWebinars={webinars}
      relatedBooks={recommendations.relatedBooks}
      relatedProducts={recommendations.relatedProducts}
    />
  );
}
