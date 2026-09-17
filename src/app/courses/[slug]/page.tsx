import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseDetailClient } from './CourseDetailClient';
import { getCourseBySlugAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getCourseBySlugAsync(params.slug);
  if (!course) {
    return {
      title: 'Course Not Found | AR Blessings',
    };
  }

  return {
    title: `${course.title} | AR Blessings Vedic Gurukul`,
    description: course.subtitle || course.description.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.subtitle,
      images: [{ url: course.thumbnail }],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = await getCourseBySlugAsync(params.slug);
  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
