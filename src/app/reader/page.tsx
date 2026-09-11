import React from 'react';
import type { Metadata } from 'next';
import { ReaderClient } from './ReaderClient';

export const metadata: Metadata = {
  title: 'Protected E-Book Reader | AR Blessings',
  description: 'Access and read your licensed consecrated e-book booklet with digital watermarking security.',
};

export default function ReaderPage() {
  return <ReaderClient />;
}
