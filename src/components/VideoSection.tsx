"use client";

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  src: string;
}

const videos: VideoItem[] = [
  {
    id: "1",
    title: "Karodon Ki Yatra",
    subtitle: "Passport Cover Spiritual Consecration",
    src: "https://arblessings.com/wp-content/uploads/2023/07/Passport.mp4",
  },
  {
    id: "2",
    title: "Karodon Ka Wallet",
    subtitle: "Divine Blessing & Sacred Geometry",
    src: "https://arblessings.com/wp-content/uploads/2023/07/WALLET-BLESSED-.mp4",
  },
  {
    id: "3",
    title: "Karodon Ka Cup",
    subtitle: "Mindful Rituals for Abundance",
    src: "https://arblessings.com/wp-content/uploads/2023/07/Cup-1.mp4",
  },
];

export const VideoSection: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="videos" className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Headers */}
        <div className="text-center mb-10">
          <h3 className="text-sm font-bold tracking-widest text-[#0008c1] uppercase mb-2">
            Visualized Insights
          </h3>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
            Understanding Concepts and Ideas through Video Explanations
          </h2>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="relative group rounded-xl overflow-hidden shadow-md bg-gray-900 border border-gray-100 aspect-video flex items-center justify-center cursor-pointer"
              onClick={() => setActiveVideo(vid.src)}
            >
              <video
                src={vid.src}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                preload="metadata"
                muted
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex flex-col items-center justify-center p-4">
                <div className="w-14 h-14 rounded-full bg-[#1346af] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={24} className="ml-1" />
                </div>
                <p className="text-white text-xs font-bold mt-3 text-center drop-shadow">
                  {vid.title}
                </p>
                <span className="text-[11px] text-gray-200 text-center">
                  {vid.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 text-white bg-black/60 p-2 rounded-full hover:bg-black transition"
            >
              <X size={20} />
            </button>
            <video
              src={activeVideo}
              controls
              autoPlay
              className="w-full aspect-video"
            />
          </div>
        </div>
      )}
    </section>
  );
};
