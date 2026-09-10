"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  poster: string;
  sources: string[];
}

const videos: VideoItem[] = [
  {
    id: "1",
    title: "Karodon Ki Yatra",
    subtitle: "Passport Cover Spiritual Consecration",
    poster: "/images/products/passport.jpg",
    sources: [
      "/videos/Passport.mp4",
      "/wordpress-old-backup/wp-content/uploads/2023/07/Passport.mp4",
      "https://arblessings.com/wordpress-old-backup/wp-content/uploads/2023/07/Passport.mp4",
      "https://arblessings.com/wp-content/uploads/2023/07/Passport.mp4"
    ],
  },
  {
    id: "2",
    title: "Karodon Ka Wallet",
    subtitle: "Divine Blessing & Sacred Geometry",
    poster: "/images/products/wallet.jpg",
    sources: [
      "/videos/WALLET-BLESSED-.mp4",
      "/wordpress-old-backup/wp-content/uploads/2023/07/WALLET-BLESSED-.mp4",
      "https://arblessings.com/wordpress-old-backup/wp-content/uploads/2023/07/WALLET-BLESSED-.mp4",
      "https://arblessings.com/wp-content/uploads/2023/07/WALLET-BLESSED-.mp4"
    ],
  },
  {
    id: "3",
    title: "Karodon Ka Cup",
    subtitle: "Mindful Rituals for Abundance",
    poster: "/images/products/cup.jpg",
    sources: [
      "/videos/Cup-1.mp4",
      "/wordpress-old-backup/wp-content/uploads/2023/07/Cup-1.mp4",
      "https://arblessings.com/wordpress-old-backup/wp-content/uploads/2023/07/Cup-1.mp4",
      "https://arblessings.com/wp-content/uploads/2023/07/Cup-1.mp4"
    ],
  },
];

export const VideoSection: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

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

        {/* Video Grid with Crystal-Clear Thumbnails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-[16/10] flex items-center justify-center cursor-pointer bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              onClick={() => setActiveVideo(vid)}
            >
              {/* High-Resolution Thumbnail Image */}
              <Image
                src={vid.poster}
                alt={vid.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-95"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Dynamic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/75 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                {/* Glowing Animated Play Button */}
                <div className="w-16 h-16 rounded-full bg-[#1346af] group-hover:bg-[#0008c1] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 mb-4 border-2 border-white/40">
                  <Play size={28} className="ml-1 fill-white" />
                </div>

                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-white/20">
                  ▶ Watch Video
                </span>

                <h4 className="text-white text-base sm:text-lg font-bold drop-shadow-md">
                  {vid.title}
                </h4>
                <p className="text-xs text-gray-200 mt-1 drop-shadow max-w-[260px]">
                  {vid.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player with Multi-Source Fallback */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 text-white bg-black/70 hover:bg-white hover:text-black p-2.5 rounded-full transition shadow-lg"
              aria-label="Close video"
            >
              <X size={20} />
            </button>

            {/* Video Player */}
            <video
              controls
              autoPlay
              playsInline
              className="w-full aspect-video bg-black"
              poster={activeVideo.poster}
            >
              {activeVideo.sources.map((src, idx) => (
                <source key={idx} src={src} type="video/mp4" />
              ))}
              Your browser does not support the video tag.
            </video>

            {/* Bottom Bar Info */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
                <p className="text-xs text-gray-400">{activeVideo.subtitle}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-xs text-gray-300 hover:text-white px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
