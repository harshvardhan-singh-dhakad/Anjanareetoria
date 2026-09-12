import React from 'react';
import type { Metadata } from 'next';
import { WebinarsClient } from './WebinarsClient';
import { getWebinars } from '@/lib/db/cmsStore';

export const metadata: Metadata = {
  title: 'Live Spiritual Masterclasses & Webinars | AR Blessings',
  description: 'Join live Vedic masterclasses on Brahma Muhurta manifestation, sacred geometry, zero-demolition Vastu alignment, and wealth frequency calibration.',
};

export default function WebinarsPage() {
  const webinars = getWebinars();
  return <WebinarsClient initialWebinars={webinars} />;
}
