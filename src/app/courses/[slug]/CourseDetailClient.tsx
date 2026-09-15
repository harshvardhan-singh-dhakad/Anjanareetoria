"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Star,
  User,
  Share2,
  FileText,
  X,
  ArrowRight
} from 'lucide-react';
import { Course, CourseLesson } from '@/lib/db/cmsStore';
import { useAuth } from '@/context/AuthContext';
import { initiateRazorpayPayment } from '@/lib/payment/razorpayClient';
import { AntiPiracyVideoPlayer } from '@/components/AntiPiracyVideoPlayer';

interface CourseDetailClientProps {
  course: Course;
}

export const CourseDetailClient: React.FC<CourseDetailClientProps> = ({ course }) => {
  const router = useRouter();
  const { user } = useAuth();

  // Accordion state - all modules open by default
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      map[m.id] = true;
    });
    return map;
  });

  // Preview video modal state
  const [activePreviewLesson, setActivePreviewLesson] = useState<CourseLesson | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Enrollment states
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Guest phone collection modal
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [guestPhone, setGuestPhone] = useState('');
  const [guestName, setGuestName] = useState('');

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalLessonsCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  // Trigger course enrollment
  const handleEnrollClick = () => {
    if (!user && !guestPhone) {
      setIsPhoneModalOpen(true);
      return;
    }
    processEnrollment(user?.phone || guestPhone, user?.name || guestName);
  };

  const processEnrollment = async (phone: string, name: string) => {
    setIsEnrolling(true);
    setEnrollError(null);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // If Free course, direct API enroll
    if (course.price === 0) {
      try {
        const res = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: course.id,
            phone: cleanPhone,
            name: name || 'Devotee',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to enroll');
        }
        router.push(data.classroomUrl || `/learn/${course.slug}`);
      } catch (err: any) {
        setIsEnrolling(false);
        setEnrollError(err.message || 'Enrollment failed. Please try again.');
      }
      return;
    }

    // If Paid course, trigger Razorpay
    try {
      await initiateRazorpayPayment({
        type: 'webinar', // unified digital payment handler
        itemId: course.id,
        items: [{ id: course.id, name: course.title, price: course.price, quantity: 1 }],
        customer: {
          name: name || user?.name || 'Devotee',
          phone: cleanPhone,
          email: user?.email || undefined,
        },
        notes: `Course: ${course.title}`,
        onSuccess: async (payRes) => {
          // Complete enrollment with orderId
          const res = await fetch('/api/courses/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: course.id,
              phone: cleanPhone,
              name: name || 'Devotee',
              orderId: payRes.orderId,
            }),
          });
          const data = await res.json();
          router.push(data.classroomUrl || `/learn/${course.slug}`);
        },
        onError: (err) => {
          setIsEnrolling(false);
          setEnrollError(err);
        },
        onDismiss: () => {
          setIsEnrolling(false);
        },
      });
    } catch (err: any) {
      setIsEnrolling(false);
      setEnrollError(err.message || 'Payment failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6] pb-24">
      {/* Header Breadcrumbs Bar */}
      <div className="bg-[#0a1128] text-slate-300 py-4 px-4 border-b border-slate-800">
        <div className="max-w-[1240px] mx-auto flex items-center space-x-2 text-xs">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-white transition">Courses</Link>
          <span>/</span>
          <span className="text-amber-400 truncate max-w-xs">{course.title}</span>
        </div>
      </div>

      {/* Main Top Banner */}
      <div className="bg-[#0a1128] text-white pt-8 pb-16 px-4">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Course Overview */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                {course.level}
              </span>
              <span className="flex items-center space-x-1 text-xs text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="font-bold">{course.rating.toFixed(1)}</span>
                <span className="text-slate-400">({course.reviewsCount} reviews)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {course.subtitle || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-amber-400" />
                <span>{course.totalDuration} On-Demand Video</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen size={16} className="text-blue-400" />
                <span>{totalLessonsCount} Structured Lessons</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={16} className="text-emerald-400" />
                <span>Completion Certificate Included</span>
              </div>
            </div>

            {/* Instructor snippet */}
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-serif font-bold flex items-center justify-center overflow-hidden">
                {course.instructor.image ? (
                  <Image
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  course.instructor.name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400">Taught by</p>
                <p className="text-sm font-semibold text-white">{course.instructor.name}</p>
              </div>
            </div>
          </div>

          {/* Right Col: Desktop Sticky Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-slate-900 space-y-6 sticky top-24">
              {/* Preview Thumbnail */}
              <div
                onClick={() => setIsTrailerOpen(true)}
                className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group bg-slate-950 shadow-md"
              >
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white text-[#1346af] flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                    <PlayCircle size={32} />
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded uppercase tracking-wider">
                    Watch Free Trailer
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  {course.price === 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-emerald-700">FREE</span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{course.originalPrice?.toLocaleString('en-IN') || '2,999'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-slate-900">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{course.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                  Instant Digital Access
                </span>
              </div>

              {enrollError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {enrollError}
                </div>
              )}

              {/* Enrollment CTA */}
              <button
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                className="w-full py-4 px-6 rounded-2xl bg-[#1346af] hover:bg-[#0008c1] disabled:bg-slate-400 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition flex items-center justify-center space-x-2"
              >
                <span>
                  {isEnrolling
                    ? 'Preparing Classroom...'
                    : course.price === 0
                    ? 'Start Learning for Free (तुरंत शुरू करें)'
                    : `Enroll Now • ₹${course.price.toLocaleString('en-IN')}`}
                </span>
                <ArrowRight size={16} />
              </button>

              {/* Benefits Checklist */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Anti-Piracy Dynamic Watermarked Stream</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Lifetime Access on Mobile &amp; Desktop</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <FileText size={16} className="text-amber-600 flex-shrink-0" />
                  <span>Downloadable PDF Notes &amp; Ritual Worksheets</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Award size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Sacred Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Detailed Body */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details & Syllabus */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center space-x-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <span>What You Will Master (आप क्या सीखेंगे)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Syllabus / Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900">
                    Course Syllabus (संपूर्ण पाठ्यक्रम)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.modules.length} Sections • {totalLessonsCount} Lectures • {course.totalDuration} Total Length
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.values(openModules).every(Boolean);
                    const updated: Record<string, boolean> = {};
                    course.modules.forEach((m) => {
                      updated[m.id] = !allOpen;
                    });
                    setOpenModules(updated);
                  }}
                  className="text-xs font-semibold text-[#1346af] hover:underline"
                >
                  Toggle All Sections
                </button>
              </div>

              {/* Modules list */}
              <div className="space-y-3">
                {course.modules.map((module, mIdx) => {
                  const isOpen = Boolean(openModules[module.id]);
                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-50 transition"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                            {module.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {module.lessons.length} Lectures
                          </p>
                        </div>
                        <div className="p-1 rounded-full bg-white text-slate-500 shadow-sm">
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {/* Module lessons */}
                      {isOpen && (
                        <div className="divide-y divide-slate-100">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-amber-50/40 transition text-xs sm:text-sm"
                            >
                              <div className="flex items-center space-x-3">
                                {lesson.isFreePreview ? (
                                  <button
                                    onClick={() => setActivePreviewLesson(lesson)}
                                    className="p-1 text-emerald-600 hover:text-emerald-700"
                                    title="Watch Free Preview"
                                  >
                                    <PlayCircle size={18} />
                                  </button>
                                ) : (
                                  <Lock size={16} className="text-slate-400" />
                                )}
                                <span className="font-medium text-slate-800">{lesson.title}</span>
                              </div>

                              <div className="flex items-center space-x-3">
                                {lesson.isFreePreview && (
                                  <button
                                    onClick={() => setActivePreviewLesson(lesson)}
                                    className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded hover:bg-emerald-200 transition"
                                  >
                                    Free Preview
                                  </button>
                                )}
                                <span className="text-xs text-slate-400 font-mono">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h3 className="font-serif font-bold text-xl text-slate-900">About This Sacred Course</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>

              {course.requirements && course.requirements.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Requirements &amp; Prerequisites:
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {course.requirements.map((req, rIdx) => (
                      <li key={rIdx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Instructor Bio Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h3 className="font-serif font-bold text-xl text-slate-900">Your Spiritual Instructor</h3>
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-900 font-serif font-bold text-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                  {course.instructor.image ? (
                    <Image
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    course.instructor.name.charAt(0)
                  )}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-lg text-slate-900">{course.instructor.name}</h4>
                  <p className="text-xs font-semibold text-amber-700">{course.instructor.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.instructor.bio ||
                      'Dedicated to preserving Vedic sciences and empowering modern households with sacred energy harmonization.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FREE PREVIEW LESSON MODAL */}
      {activePreviewLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-400">Free Preview Lecture</span>
                <h4 className="font-serif font-bold text-base text-white truncate max-w-md">
                  {activePreviewLesson.title}
                </h4>
              </div>
              <button
                onClick={() => setActivePreviewLesson(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <AntiPiracyVideoPlayer
              videoUrl={activePreviewLesson.videoUrl}
              videoType={activePreviewLesson.videoType}
              title={activePreviewLesson.title}
              userPhone={user?.phone}
              userName={user?.name}
              autoPlay={true}
            />

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Enjoyed this preview? Enroll now to unlock all {totalLessonsCount} lessons.
              </p>
              <button
                onClick={() => {
                  setActivePreviewLesson(null);
                  handleEnrollClick();
                }}
                className="px-4 py-2 bg-[#1346af] hover:bg-[#0008c1] text-white text-xs font-bold rounded-xl shadow"
              >
                Enroll Full Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAILER MODAL */}
      {isTrailerOpen && course.trailerVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-400">Official Course Trailer</span>
                <h4 className="font-serif font-bold text-base text-white">{course.title}</h4>
              </div>
              <button
                onClick={() => setIsTrailerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <AntiPiracyVideoPlayer
              videoUrl={course.trailerVideoUrl}
              videoType="youtube"
              title={course.title}
              userPhone={user?.phone}
              userName={user?.name}
              autoPlay={true}
            />
          </div>
        </div>
      )}

      {/* GUEST MOBILE NUMBER MODAL */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h4 className="font-serif font-bold text-lg text-slate-900">Student Enrollment</h4>
              </div>
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please enter your name and WhatsApp/mobile number to unlock your classroom access and save your learning progress.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsPhoneModalOpen(false);
                processEnrollment(guestPhone, guestName);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1346af]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 Digits)</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1346af]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#1346af] hover:bg-[#0008c1] text-white font-bold text-sm shadow-lg transition"
              >
                {course.price === 0 ? 'Enter Free Classroom' : `Continue to Payment (₹${course.price})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
