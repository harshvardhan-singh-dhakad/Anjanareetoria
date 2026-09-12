"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  X
} from 'lucide-react';
import { Webinar } from '@/lib/db/cmsStore';

interface WebinarsClientProps {
  initialWebinars: Webinar[];
}

export const WebinarsClient: React.FC<WebinarsClientProps> = ({ initialWebinars }) => {
  const [webinars] = useState<Webinar[]>(initialWebinars || []);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [registered, setRegistered] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0008c1] via-[#05138c] to-[#0a187a] text-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" />
            <span>Live Sacred Transmissions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Live Spiritual Masterclasses &amp; Sacred Webinars
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Direct interactive transmissions with master astrologers, Vastu luminaries, and esoteric researchers. Unlock the high-vibrational secrets of Brahma Muhurta, wealth manifestation, and home energy harmony.
          </p>
        </div>
      </section>

      {/* Webinars Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {webinars.map((webinar) => (
            <div
              key={webinar.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              {/* Banner / Poster */}
              <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                {webinar.bannerImage ? (
                  <Image
                    src={webinar.bannerImage}
                    alt={webinar.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Video size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Badge Status */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{webinar.status}</span>
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                    {webinar.price === 0 ? 'FREE MASTERCLASS' : `₹${webinar.price}`}
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="text-xl font-bold font-serif leading-snug line-clamp-2">
                    {webinar.title}
                  </h3>
                </div>
              </div>

              {/* Webinar Information */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {webinar.description}
                  </p>

                  {/* Speaker Bio */}
                  <div className="flex items-center space-x-3.5 bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl">
                    <div className="w-11 h-11 rounded-full overflow-hidden relative bg-blue-200 border-2 border-white shadow-sm flex-shrink-0">
                      {webinar.speaker.image ? (
                        <Image src={webinar.speaker.image} alt={webinar.speaker.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#0008c1]">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-serif">
                        {webinar.speaker.name}
                      </h4>
                      <p className="text-[11px] text-[#0008c1] font-medium">
                        {webinar.speaker.title}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time Highlights */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Calendar size={15} className="text-[#0008c1] flex-shrink-0" />
                      <span className="line-clamp-1">{webinar.dateTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={15} className="text-[#0008c1] flex-shrink-0" />
                      <span>{webinar.duration}</span>
                    </div>
                  </div>

                  {/* Agenda Bullet points */}
                  {webinar.agenda && webinar.agenda.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        What You Will Experience:
                      </span>
                      <ul className="space-y-1.5 text-xs text-gray-700">
                        {webinar.agenda.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start space-x-2">
                            <Sparkles size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs w-full sm:w-auto">
                    <span className="text-gray-400 block">Registration:</span>
                    <strong className="text-emerald-700 font-semibold">
                      {webinar.price === 0 ? 'Free (Limited Seats)' : `₹${webinar.price} per participant`}
                    </strong>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/webinars/${webinar.slug}`}
                      className="px-4 py-2.5 rounded-xl border border-[#0008c1] text-[#0008c1] hover:bg-blue-50 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <span>View Details &amp; Reviews</span>
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedWebinar(webinar);
                        setRegistered(false);
                        setRegForm({ name: '', email: '', phone: '' });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#0a187a] hover:to-[#0008c1] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
                    >
                      <span>Reserve Seat</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Devotee Reviews & Feedback Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Real Devotee Transformations
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Loved by 12,000+ Seekers Nationwide
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="text-2xl font-serif font-bold text-amber-300">4.9 / 5</span>
              <span>Average Attendee Satisfaction Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;The Brahma Muhurta masterclass changed my entire schedule. Practicing Kara Darshana and morning water blessing unlocked clarity I had been missing for years.&quot;
              </p>
              <div className="text-xs">
                <strong className="text-white block font-serif">Vikram Malhotra</strong>
                <span className="text-slate-400 text-[11px]">Textile Manufacturer, Surat</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;Guru Devendra&apos;s Zero-Demolition Vastu secrets were incredible. Realigning our cash safe and energizing the northeast sector increased commercial footfall in 3 weeks.&quot;
              </p>
              <div className="text-xs">
                <strong className="text-white block font-serif">Manoj Khurana</strong>
                <span className="text-slate-400 text-[11px]">Retail Business Owner, Delhi</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                &quot;No superstition, purely practical Vedic science. The live Beej Mantra chanting vibrations were so uplifting! Recommend this to everyone.&quot;
              </p>
              <div className="text-xs">
                <strong className="text-white block font-serif">Sunita Agarwal</strong>
                <span className="text-slate-400 text-[11px]">Chartered Accountant, Jaipur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Modal */}
      {selectedWebinar && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedWebinar(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>

            {!registered ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Live Masterclass Reservation
                  </span>
                  <h3 className="text-xl font-bold font-serif text-gray-900">
                    {selectedWebinar.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedWebinar.dateTime} &bull; {selectedWebinar.duration}
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">WhatsApp Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#0a187a] hover:to-[#0008c1] text-white font-bold text-xs sm:text-sm shadow-md transition mt-2"
                  >
                    Confirm Masterclass RSVP
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">
                  Seat Confirmed!
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{regForm.name}</strong>. Your invitation and joining access details have been scheduled.
                </p>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-left space-y-1.5">
                  <div className="font-semibold text-[#0008c1]">Session Access Link:</div>
                  <a
                    href={selectedWebinar.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 text-blue-700 font-mono text-[11px] underline break-all"
                  >
                    <ExternalLink size={13} />
                    <span>{selectedWebinar.registrationUrl}</span>
                  </a>
                </div>

                <button
                  onClick={() => setSelectedWebinar(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
