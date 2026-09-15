"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  FileText,
  MessageSquare,
  Award,
  Sparkles,
  Download,
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Course, CourseLesson } from '@/lib/db/cmsStore';
import { useAuth } from '@/context/AuthContext';
import { AntiPiracyVideoPlayer } from '@/components/AntiPiracyVideoPlayer';

interface ClassroomClientProps {
  course: Course;
}

export const ClassroomClient: React.FC<ClassroomClientProps> = ({ course }) => {
  const { user } = useAuth();

  // Flatten all lessons in order
  const allLessons = useMemo(() => {
    const list: CourseLesson[] = [];
    course.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        list.push(les);
      });
    });
    return list;
  }, [course]);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);

  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];

  // Fetch saved progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      const phone = user?.phone || (typeof window !== 'undefined' ? localStorage.getItem('last_user_phone') : null);
      if (!phone) return;

      try {
        const res = await fetch(`/api/user/courses?phone=${phone}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const myCourse = data.data.find(
            (c: any) => c.courseId === course.id || c.courseSlug === course.slug
          );
          if (myCourse) {
            setCompletedLessonIds(myCourse.completedLessonIds || []);
            setProgressPercentage(myCourse.progressPercentage || 0);
            if (myCourse.lastLessonId) {
              const idx = allLessons.findIndex((l) => l.id === myCourse.lastLessonId);
              if (idx >= 0) setCurrentLessonIndex(idx);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };

    fetchProgress();
  }, [user, course, allLessons]);

  // Toggle lesson complete
  const toggleLessonComplete = async (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    const nextCompleted = isCompleted
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(nextCompleted);
    const newPct = Math.min(100, Math.round((nextCompleted.length / allLessons.length) * 100));
    setProgressPercentage(newPct);

    if (newPct === 100 && !isCompleted) {
      setShowCertificateModal(true);
    }

    // Save to backend
    const phone = user?.phone || (typeof window !== 'undefined' ? localStorage.getItem('last_user_phone') : null);
    if (phone) {
      try {
        await fetch('/api/courses/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            lessonId,
            completed: !isCompleted,
            phone,
          }),
        });
      } catch (err) {
        console.error('Error updating progress:', err);
      }
    }
  };

  // When current video finishes
  const handleVideoEnded = () => {
    if (!completedLessonIds.includes(currentLesson.id)) {
      toggleLessonComplete(currentLesson.id);
    }

    // If there is a next lesson, initiate countdown
    if (currentLessonIndex < allLessons.length - 1) {
      setAutoNextCountdown(5);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (autoNextCountdown === null) return;
    if (autoNextCountdown <= 0) {
      setAutoNextCountdown(null);
      setCurrentLessonIndex((prev) => Math.min(prev + 1, allLessons.length - 1));
      return;
    }
    const timer = setTimeout(() => {
      setAutoNextCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoNextCountdown, allLessons.length]);

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col">
      {/* Top Classroom Navigation Bar */}
      <header className="h-16 bg-[#040813] border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Course Syllabus</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {course.title}
          </h1>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          {/* Progress widget */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {progressPercentage}% Completed
            </span>
          </div>

          {progressPercentage === 100 && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold shadow animate-pulse"
            >
              <Award size={14} />
              <span className="hidden sm:inline">Certificate</span>
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            title="Toggle Course Syllabus"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Main Classroom Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Video Player & Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-4rem)] p-4 sm:p-6 space-y-6">
          {/* Autoplay Next Banner */}
          {autoNextCountdown !== null && (
            <div className="bg-gradient-to-r from-blue-900/90 to-indigo-950/90 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between text-white animate-fadeIn">
              <div className="flex items-center space-x-3">
                <Sparkles size={20} className="text-amber-400" />
                <div>
                  <p className="text-xs text-blue-200">Lesson completed!</p>
                  <p className="text-sm font-bold">
                    Next: {allLessons[currentLessonIndex + 1]?.title} in {autoNextCountdown}s...
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoNextCountdown(null)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setAutoNextCountdown(null);
                    setCurrentLessonIndex((prev) => Math.min(prev + 1, allLessons.length - 1));
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Play Now
                </button>
              </div>
            </div>
          )}

          {/* ANTI-PIRACY VIDEO PLAYER */}
          <div className="w-full">
            <AntiPiracyVideoPlayer
              key={currentLesson.id}
              videoUrl={currentLesson.videoUrl}
              videoType={currentLesson.videoType}
              title={currentLesson.title}
              userPhone={user?.phone}
              userName={user?.name}
              autoPlay={true}
              onEnded={handleVideoEnded}
            />
          </div>

          {/* Lesson Header & Action Controls */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </span>
              <h2 className="text-base sm:text-xl font-bold font-serif text-white">
                {currentLesson.title}
              </h2>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Mark Complete Checkbox */}
              <button
                onClick={() => toggleLessonComplete(currentLesson.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  completedLessonIds.includes(currentLesson.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {completedLessonIds.includes(currentLesson.id) ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <Circle size={16} />
                )}
                <span>
                  {completedLessonIds.includes(currentLesson.id)
                    ? 'Completed (पूर्ण)'
                    : 'Mark as Completed'}
                </span>
              </button>

              {/* Prev / Next buttons */}
              <button
                disabled={currentLessonIndex === 0}
                onClick={() => setCurrentLessonIndex((prev) => Math.max(prev - 1, 0))}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                title="Previous Lesson"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                disabled={currentLessonIndex === allLessons.length - 1}
                onClick={() => setCurrentLessonIndex((prev) => Math.min(prev + 1, allLessons.length - 1))}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700"
                title="Next Lesson"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Tabs Section (Overview, Notes, Q&A) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-3 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-1 transition ${
                  activeTab === 'overview'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview &amp; Teachings
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-1 transition flex items-center space-x-1.5 ${
                  activeTab === 'notes'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={14} />
                <span>PDF Notes &amp; Handouts</span>
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`pb-1 transition flex items-center space-x-1.5 ${
                  activeTab === 'qa'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare size={14} />
                <span>Discussion &amp; Q&amp;A</span>
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  {currentLesson.description ||
                    'In this lesson, you will discover the timeless metaphysical principles of energy calibration, mudra alignment, and how to maintain sacred resonance in your living space.'}
                </p>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 mt-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Sacred Practice Note:
                  </h4>
                  <p className="text-xs text-slate-400">
                    Always practice in a peaceful space facing East or North. Maintain a consecrated copper vessel of drinking water nearby during morning meditations.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <p className="text-slate-400">
                  Supplementary study material, mantras, and daily journaling sheets for this course.
                </p>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText size={18} className="text-amber-400" />
                      <div>
                        <p className="font-semibold text-white">Daily Brahma Muhurta Protocol Handout.pdf</p>
                        <p className="text-[10px] text-slate-400">2 Pages • Mantras &amp; Mudra Checklist</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('PDF notes downloaded to your device!')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded-lg text-xs font-bold transition"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <p className="text-slate-400">
                  Have a question regarding this lesson? Ask your query directly to our Vedic mentors.
                </p>
                <textarea
                  rows={3}
                  placeholder="Type your question or realization here..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => alert('Your question has been submitted to the Vedic master!')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Submit Question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Course Syllabus Playlist Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-96 bg-[#040813] border-l border-slate-800/80 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 border-b border-slate-800/80 bg-slate-950 sticky top-0 z-10">
              <h3 className="font-serif font-bold text-sm text-white">Course Curriculum</h3>
              <p className="text-[11px] text-slate-400">
                {completedLessonIds.length} of {allLessons.length} Completed ({progressPercentage}%)
              </p>
            </div>

            {/* Modules and lessons list */}
            <div className="divide-y divide-slate-800/50">
              {course.modules.map((module, mIdx) => (
                <div key={module.id} className="py-2">
                  <div className="px-4 py-2 bg-slate-900/40">
                    <h4 className="text-xs font-bold text-slate-300 truncate">
                      {module.title}
                    </h4>
                  </div>

                  <div className="space-y-0.5 pt-1">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            const idx = allLessons.findIndex((l) => l.id === lesson.id);
                            if (idx >= 0) setCurrentLessonIndex(idx);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-start space-x-3 transition ${
                            isActive
                              ? 'bg-blue-950/60 border-l-4 border-blue-500'
                              : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonComplete(lesson.id);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                          >
                            {isCompleted ? (
                              <CheckCircle size={16} className="text-emerald-400" />
                            ) : (
                              <Circle size={16} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p
                              className={`text-xs leading-snug line-clamp-2 ${
                                isActive
                                  ? 'font-bold text-white'
                                  : isCompleted
                                  ? 'text-slate-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                              <span>{lesson.duration}</span>
                              {lesson.isFreePreview && (
                                <span className="text-emerald-400">Free Preview</span>
                              )}
                            </div>
                          </div>

                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping mt-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* CERTIFICATE UNLOCKED MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/30">
              <Award size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                Achievement Unlocked
              </span>
              <h3 className="font-serif font-bold text-2xl text-white">Course Completed!</h3>
              <p className="text-xs text-slate-300">
                Congratulations {user?.name || 'Sacred Seeker'}! You have successfully completed all lessons of{' '}
                <strong>{course.title}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200">
              Your official consecrated certificate of completion has been granted to your account profile.
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                Close and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
