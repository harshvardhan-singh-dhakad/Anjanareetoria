import React from 'react';
import type { Metadata } from 'next';
import { WebinarsClient } from './WebinarsClient';
import { getWebinarsAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Spiritual Masterclasses & Webinars | AR Blessings',
  description: 'Join live Vedic masterclasses on Brahma Muhurta manifestation, sacred geometry, zero-demolition Vastu alignment, and wealth frequency calibration.',
};

export default async function WebinarsPage() {
  const webinars = await getWebinarsAsync();
  return <WebinarsClient initialWebinars={webinars} />;
}
