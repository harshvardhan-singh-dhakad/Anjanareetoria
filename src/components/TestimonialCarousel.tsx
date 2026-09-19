"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SiteSettings } from '@/lib/db/cmsStore';

export const TestimonialCarousel: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const testimonials = (settings.testimonials || []).filter(t => t.enabled !== false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items per view: 3 desktop, 2 tablet, 1 mobile
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const prev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  return (
    <section id="testimonials" className="py-12 sm:py-16 bg-[#f9fafb]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Headers */}
        <div className="text-center mb-10">
          <h3 className="text-sm font-bold tracking-widest text-[#0008c1] uppercase mb-2">
            {settings.testimonialsKicker || 'Accomplishment Sagas'}
          </h3>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
            {settings.testimonialsTitle || 'Success Stories and Clients&apos; Positive Feedback'}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative px-8 sm:px-12">
          {/* Controls */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#0008c1] hover:shadow-lg transition"
            aria-label="Previous review"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#0008c1] hover:shadow-lg transition"
            aria-label="Next review"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slides Viewport */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition aspect-square relative">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-1.5 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-[#0008c1]' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
