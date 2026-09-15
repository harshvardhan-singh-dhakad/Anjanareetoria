import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClassroomClient } from './ClassroomClient';
import { getCourses, getCourseBySlug } from '@/lib/db/cmsStore';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const courses = getCourses();
  return courses.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    return { title: 'Classroom | AR Blessings' };
  }
  return {
    title: `Classroom: ${course.title} | AR Blessings Gurukul`,
    description: `Interactive learning player for ${course.title}. Protected video stream with structured chapters and progress tracking.`,
  };
}

export default function ClassroomPage({ params }: PageProps) {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }

  return <ClassroomClient course={course} />;
}
