"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  Star,
  CheckCircle2,
  Filter,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Course } from '@/lib/db/cmsStore';

interface CoursesClientProps {
  initialCourses: Course[];
}

export const CoursesClient: React.FC<CoursesClientProps> = ({ initialCourses }) => {
  const [courses] = useState<Course[]>(initialCourses);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Teachings (सभी प्रवचन)' },
    { id: 'manifestation', label: 'Manifestation & Energy' },
    { id: 'vastu', label: 'Vedic Vastu' },
    { id: 'wisdom', label: 'Spiritual Wisdom' },
  ];

  const filteredCourses = courses.filter((course) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'manifestation') return course.category.toLowerCase().includes('manifestation');
    if (selectedCategory === 'vastu') return course.category.toLowerCase().includes('vastu');
    if (selectedCategory === 'wisdom') return course.category.toLowerCase().includes('wisdom');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfbf7] pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-[#0a1128] via-[#050b1a] to-[#0a1128] text-white py-16 sm:py-24 px-4 overflow-hidden">
        {/* Sacred Geometry Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-medium tracking-wide uppercase">
            <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
            <span>Sacred Gurukul &amp; Video Teachings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Vedic Video Teachings &amp; <span className="text-amber-400">Masterclasses</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Step-by-step video wisdom on Brahma Muhurta, zero-demolition Vastu, and spiritual energy alignment. Designed with distraction-free learning, progress tracking, and authentic guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Anti-Piracy Watermarked Streams</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <PlayCircle size={15} className="text-amber-400" />
              <span>Structured Chapters &amp; Notes</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Award size={15} className="text-blue-400" />
              <span>Vedic Certificate on Completion</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-10">
        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          <Filter size={16} className="text-slate-400 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#1346af] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Video size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No courses in this category yet</h3>
            <p className="text-xs text-slate-500 mt-1">Please explore our other categories or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const totalLessonsCount =
                course.totalLessons ||
                course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail & Video Badge */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-900 shadow backdrop-blur-sm">
                        {course.category}
                      </span>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 left-3 z-10 flex items-center space-x-2 text-[11px] text-white font-medium">
                      <span className="flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        <Clock size={12} />
                        <span>{course.totalDuration}</span>
                      </span>
                      <span className="flex items-center space-x-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        <BookOpen size={12} />
                        <span>{totalLessonsCount} Lessons</span>
                      </span>
                    </div>

                    {/* Play icon button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white text-[#1346af] flex items-center justify-center shadow-lg">
                        <PlayCircle size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Rating */}
                      <div className="flex items-center space-x-1.5 text-xs text-amber-500">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800">{course.rating.toFixed(1)}</span>
                        <span className="text-slate-400 text-[11px]">({course.reviewsCount} students)</span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1346af] transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {course.subtitle || course.description}
                      </p>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold font-serif overflow-hidden">
                        {course.instructor.image ? (
                          <Image
                            src={course.instructor.image}
                            alt={course.instructor.name}
                            width={28}
                            height={28}
                            className="object-cover"
                          />
                        ) : (
                          course.instructor.name.charAt(0)
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">{course.instructor.name}</p>
                        <p className="text-[10px] text-slate-400">{course.instructor.title}</p>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {course.price === 0 ? (
                          <span className="text-emerald-700 font-bold text-base px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                            FREE (निःशुल्क)
                          </span>
                        ) : (
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-bold text-slate-900">
                              ₹{course.price.toLocaleString('en-IN')}
                            </span>
                            {course.originalPrice && course.originalPrice > course.price && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{course.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1346af] hover:bg-[#0008c1] text-white text-xs font-bold shadow transition"
                      >
                        <span>View Syllabus</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Anti-Piracy Forensic Streams</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every video session is stamped with dynamic forensic watermarks to prevent piracy and ensure sacred integrity.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Clock size={26} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Lifetime Access &amp; Self-Paced</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Watch anytime from phone, laptop, or tablet. Your lesson progress is automatically saved to your account.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Award size={26} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Sacred Completion Certificate</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete all chapters and receive a consecrated digital certification honoring your commitment to Vedic growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
