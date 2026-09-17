import React from 'react';
import type { Metadata } from 'next';
import { CoursesClient } from './CoursesClient';
import { getCoursesAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sacred Video Teachings & Vedic Courses | AR Blessings',
  description: 'Master authentic Vedic science, Brahma Muhurta manifestation, zero-demolition Vastu, and spiritual energy alignment through structured video teachings and masterclasses.',
};

export default async function CoursesPage() {
  const allCourses = await getCoursesAsync();
  const courses = allCourses.filter((c) => c.status === 'published');
  return <CoursesClient initialCourses={courses} />;
}
