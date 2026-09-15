import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseDetailClient } from './CourseDetailClient';
import { getCourses, getCourseBySlug } from '@/lib/db/cmsStore';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const courses = getCourses();
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
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

export default function CourseDetailPage({ params }: PageProps) {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
