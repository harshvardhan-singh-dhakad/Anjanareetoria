"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SiteSettings } from '@/lib/db/cmsStore';

export const HeroBanner: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  return (
    <section className="w-full bg-white py-2 sm:py-4">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <Link
          href={settings.heroLink || "/product/karodon-ka-wallet"}
          className="block relative w-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group"
        >
          <div className="relative w-full aspect-[1920/860]">
            <Image
              src={settings.heroImage || "/images/banner-karodon-ka-wallet.png"}
              alt={settings.heroAlt || "Karodon Ka Wallet"}
              fill
              priority
              className="object-cover group-hover:scale-[1.01] transition-transform duration-500"
              sizes="(max-width: 1240px) 100vw, 1240px"
            />
          </div>
        </Link>
      </div>
    </section>
  );
};
