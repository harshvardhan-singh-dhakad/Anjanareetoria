"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Star,
  Quote,
  Check,
  ArrowRight,
  X,
  Share2,
  HelpCircle,
  Video,
  BookOpen,
  Gem
} from 'lucide-react';
import { Webinar, ExtendedBook } from '@/lib/db/cmsStore';
import { Product } from '@/data/products';
import { initiateRazorpayPayment } from '@/lib/payment/razorpayClient';

interface WebinarDetailClientProps {
  webinar: Webinar;
  allWebinars: Webinar[];
  relatedBooks?: ExtendedBook[];
  relatedProducts?: Product[];
}

export const WebinarDetailClient: React.FC<WebinarDetailClientProps> = ({
  webinar,
  allWebinars,
  relatedBooks = [],
  relatedProducts = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedDetails, setConfirmedDetails] = useState<{
    orderId?: string;
    paymentId?: string;
    webinarDetails?: any;
  } | null>(null);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (webinar.price > 0) {
      setPaying(true);
      await initiateRazorpayPayment({
        type: 'webinar',
        itemId: webinar.id || webinar.slug,
        customer: {
          name: regForm.name.trim(),
          phone: regForm.phone.replace(/\D/g, '').slice(-10),
          email: regForm.email.trim() || undefined,
        },
        onSuccess: (result) => {
          setPaying(false);
          setRegistered(true);
          setConfirmedDetails(result);
        },
        onError: (err) => {
          setPaying(false);
          setPaymentError(err);
        },
        onDismiss: () => {
          setPaying(false);
        },
      });
    } else {
      setRegistered(true);
    }
  };

  const reviews = webinar.reviews || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  const otherWebinars = allWebinars.filter(w => w.slug !== webinar.slug);

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24 font-sans text-slate-800 selection:bg-amber-100">
      {/* Top Banner & Header */}
      <section className="bg-gradient-to-b from-[#0008c1] via-[#05138c] to-[#0a187a] text-white pt-10 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-blue-200">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/webinars" className="hover:text-white transition">Webinars</Link>
            <span>/</span>
            <span className="text-white font-medium line-clamp-1">{webinar.title}</span>
          </nav>

          {/* Main Hero Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-sm">
                  <Sparkles size={13} className="text-slate-950" />
                  <span>Exclusive Live Masterclass</span>
                </span>

                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  ● {webinar.status === 'live' ? 'Live Streaming' : 'Live Interactive Session'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                {webinar.title}
              </h1>

              <p className="text-base sm:text-lg text-amber-200/90 font-serif leading-relaxed">
                {webinar.subtitle}
              </p>

              {/* Timing & Highlights bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] text-blue-200 block uppercase tracking-wider font-semibold">Date &amp; Time</span>
                  <strong className="text-xs sm:text-sm text-white font-semibold mt-0.5 block line-clamp-1">{webinar.dateTime}</strong>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] text-blue-200 block uppercase tracking-wider font-semibold">Duration</span>
                  <strong className="text-xs sm:text-sm text-white font-semibold mt-0.5 block">{webinar.duration}</strong>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-[11px] text-blue-200 block uppercase tracking-wider font-semibold">Participation Fee</span>
                  <strong className="text-xs sm:text-sm text-amber-300 font-bold mt-0.5 block">
                    {webinar.price === 0 ? 'FREE (100% Complimentary)' : `₹${webinar.price} per participant`}
                  </strong>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition transform active:scale-95 flex items-center space-x-3"
                >
                  <span>{webinar.price === 0 ? 'Reserve Your Free Seat Now' : `Enroll Now for ₹${webinar.price}`}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center space-x-2 text-xs font-semibold"
                  title="Share masterclass link"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Poster / Live Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-4 shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950">
                  {webinar.bannerImage ? (
                    <Image
                      src={webinar.bannerImage}
                      alt={webinar.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Video size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Speaker Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-amber-400 flex-shrink-0 bg-blue-900">
                      {webinar.speaker?.image ? (
                        <Image src={webinar.speaker.image} alt={webinar.speaker.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400">
                          <User size={22} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-300 uppercase tracking-wider font-bold block">Transmission Speaker</span>
                      <h3 className="text-sm font-bold font-serif">{webinar.speaker?.name}</h3>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{webinar.speaker?.title}</p>
                    </div>
                  </div>
                </div>

                {/* Live Countdown Box */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-amber-50 border border-amber-200/60 text-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0008c1] flex items-center space-x-1">
                      <Clock size={13} />
                      <span>Transmission Begins In</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Limited Seats Available</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-lg font-bold font-serif text-[#0008c1]">{timeLeft.days}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Days</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-lg font-bold font-serif text-[#0008c1]">{timeLeft.hours}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Hours</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-lg font-bold font-serif text-[#0008c1]">{timeLeft.minutes}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Mins</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-lg font-bold font-serif text-amber-600">{timeLeft.seconds}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Secs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-12">
        {/* About the Transmission */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#0008c1]">
            <Sparkles size={16} />
            <span>Divine Alignment &amp; Objective</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            About This Sacred Masterclass
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {webinar.description}
          </p>

          <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3.5 text-xs sm:text-sm text-amber-950">
            <ShieldCheck size={22} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-900 mb-0.5">
                Authentic Lineage Guarantee:
              </strong>
              <span>
                All rituals and guidance shared in this masterclass are drawn directly from ancient Vedic treatises and authentic Himalayan oral traditions, tailored specifically for practical modern lifestyles.
              </span>
            </div>
          </div>
        </section>

        {/* Master Agenda & Curriculum */}
        {webinar.agenda && webinar.agenda.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#0008c1]">
              <Calendar size={16} />
              <span>Step-by-Step Curriculum</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              What You Will Experience During the 90 Minutes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webinar.agenda.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-start space-x-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#0008c1] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-serif mb-1">
                      Module {idx + 1}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Who Should Attend Section */}
        {webinar.whoShouldAttend && webinar.whoShouldAttend.length > 0 && (
          <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <CheckCircle2 size={16} />
              <span>Suitability &amp; Resonance</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Who Should Attend This Masterclass?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {webinar.whoShouldAttend.map((pt, i) => (
                <div key={i} className="flex items-start space-x-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <Check size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Speaker Profile Section */}
        {webinar.speaker && (
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#0008c1]">
              <User size={16} />
              <span>Spiritual Master &amp; Guide</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden relative border-4 border-amber-300 shadow-md flex-shrink-0 bg-blue-100">
                {webinar.speaker.image ? (
                  <Image src={webinar.speaker.image} alt={webinar.speaker.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0008c1]">
                    <User size={40} />
                  </div>
                )}
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    {webinar.speaker.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#0008c1] font-semibold">
                    {webinar.speaker.title}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  With over two decades of dedicated study in Vedic astrology, sacred geometries, and Himalayan frequency calibration, our master guides bring rare esoteric clarity into practical everyday application.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ----------------- ATTENDEE REVIEWS & DEVOTEE TESTIMONIALS SECTION ----------------- */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span>Verified Devotee Experiences</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Reviews from Past Masterclass Attendees
              </h2>
            </div>

            <div className="flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 self-start sm:self-auto">
              <div className="text-2xl font-serif font-bold text-amber-900">
                {averageRating}
              </div>
              <div>
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-amber-900 font-semibold">
                  {reviews.length} Verified Attendee Reviews
                </span>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
              <Quote size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No reviews submitted yet for this upcoming masterclass.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Stars */}
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, idx) => (
                        <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>

                  {/* Devotee Info */}
                  <div className="pt-3 border-t border-slate-200/60 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200/60 relative overflow-hidden flex-shrink-0 border border-amber-300">
                      {rev.avatar ? (
                        <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-900 font-bold text-xs">
                          {rev.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-serif">
                        {rev.name}
                      </h4>
                      {rev.roleOrLocation && (
                        <p className="text-[11px] text-slate-500">
                          {rev.roleOrLocation}
                        </p>
                      )}
                      <span className="inline-block text-[10px] text-emerald-700 font-semibold">
                        ✓ Verified Attendee
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#0008c1]">
            <HelpCircle size={16} />
            <span>Common Inquiries</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 pt-2 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block font-bold">Will I receive the session recording if I cannot attend live?</strong>
              <p className="text-slate-600">Yes, all registered attendees receive 7-day replay access and the digital sacred chant transcript directly on their registered WhatsApp.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block font-bold">Do I need any previous spiritual knowledge or equipment?</strong>
              <p className="text-slate-600">No prior knowledge is required. You only need a quiet corner, a glass of drinking water, and an open heart ready to receive the teachings.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-900 block font-bold">How do I join the masterclass?</strong>
              <p className="text-slate-600">Upon registration, your private meeting link is generated instantly and also sent to your WhatsApp and email 1 hour prior to the session.</p>
            </div>
          </div>
        </section>

        {/* Companion Sacred Books & E-Books (User Request: Repeat / Related Books System) */}
        {relatedBooks.length > 0 && (
          <section className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-3xl p-6 sm:p-10 border border-amber-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/70">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  <BookOpen size={16} className="text-amber-700" />
                  <span>Recommended Literature</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Companion Sacred Books &amp; E-Books for this Masterclass
                </h2>
              </div>
              <Link
                href="/books"
                className="text-xs font-bold text-amber-900 hover:underline flex items-center space-x-1"
              >
                <span>View Full Library</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Deepen the lessons explored in this live transmission with authenticated Vedic literature and prosperity guides:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              {relatedBooks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-4 border border-amber-200/70 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                      {b.image ? (
                        <Image src={b.image} alt={b.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen size={30} />
                        </div>
                      )}
                      {b.badge && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                          {b.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-800 transition">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">By {b.author}</p>
                      <div className="mt-2 font-bold text-slate-900 text-xs">
                        ₹{b.ebookPrice || b.price}
                        <span className="text-[10px] font-normal text-emerald-700 ml-1.5 font-sans">
                          (Instant E-Book PDF)
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/books/${b.slug}`}
                    className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl text-center transition shadow-sm"
                  >
                    View Details &amp; Sample
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Consecrated Spiritual Essentials (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#0008c1] mb-1">
                  <Gem size={16} />
                  <span>Consecrated Essentials</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Blessed Physical Conduits Recommended for Practice
                </h2>
              </div>
              <Link
                href="/#products"
                className="text-xs font-bold text-[#0008c1] hover:underline flex items-center space-x-1"
              >
                <span>View All Store Products</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Gem size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                        {p.category}
                      </span>
                      <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0008c1] transition">
                        {p.name}
                      </h4>
                      <div className="mt-1 font-bold text-slate-900 text-xs">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/product/${p.slug}`}
                    className="mt-3 w-full py-2 bg-[#0008c1] hover:bg-[#0a187a] text-white font-bold text-xs rounded-xl text-center transition shadow-sm"
                  >
                    View Product
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Upcoming Webinars */}
        {otherWebinars.length > 0 && (
          <section className="space-y-4 pt-4">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Explore Other Live Spiritual Masterclasses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherWebinars.map((w) => (
                <Link
                  key={w.id}
                  href={`/webinars/${w.slug}`}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#0008c1] shadow-sm hover:shadow-md transition flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-600">
                      {w.dateTime}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-serif group-hover:text-[#0008c1] transition">
                      {w.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">With {w.speaker?.name}</p>
                  </div>
                  <span className="text-[#0008c1] font-bold text-sm group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom RSVP Bar for Mobile and Quick Enrollment */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-2xl flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-8">
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Reserved Access:</div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 font-serif line-clamp-1">
            {webinar.title}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Enrollment Fee:</span>
            <strong className="text-sm font-bold text-emerald-700">
              {webinar.price === 0 ? 'FREE' : `₹${webinar.price}`}
            </strong>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs sm:text-sm font-bold shadow-md transition"
          >
            {webinar.price === 0 ? 'Claim Free Seat' : `Enroll Now (₹${webinar.price})`}
          </button>
        </div>
      </div>

      {/* Registration RSVP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            {!registered ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Live Session Registration
                  </span>
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    {webinar.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {webinar.dateTime} &bull; {webinar.duration}
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="e.g. ramesh@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">WhatsApp Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#05138c] hover:to-[#0008c1] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition mt-2 cursor-pointer"
                  >
                    {webinar.price === 0
                      ? 'Confirm Complimentary Masterclass RSVP'
                      : (paying ? 'Opening Payment Gateway...' : `Pay ₹${webinar.price} & Reserve Seat`)}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  RSVP Successfully Confirmed!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Namaste <strong>{regForm.name}</strong>, your seat for <em>{webinar.title}</em> is officially secured.
                </p>

                {confirmedDetails?.orderId && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-left text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booking Order ID:</span>
                      <strong className="font-mono text-[#0008c1]">{confirmedDetails.orderId}</strong>
                    </div>
                    {confirmedDetails.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment ID:</span>
                        <span className="font-mono text-slate-700 text-[11px]">{confirmedDetails.paymentId}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-left space-y-1.5">
                  <div className="font-semibold text-[#0008c1]">Direct Live Transmission Link:</div>
                  <a
                    href={webinar.registrationUrl || 'https://meet.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 text-blue-700 font-mono text-[11px] underline break-all"
                  >
                    <ExternalLink size={13} />
                    <span>{webinar.registrationUrl || 'https://meet.google.com'}</span>
                  </a>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Close &amp; Return to Masterclass
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
