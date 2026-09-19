import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  MessageCircle,
  BookOpen,
  Download,
  Package,
  Calendar,
  Heart,
  Flame,
  Star
} from 'lucide-react';
import { LakshmiJourneySection } from '@/components/books/LakshmiJourneySection';
import { getBooksAsync } from '@/lib/db/cmsStore';

export const metadata: Metadata = {
  title: '75 Days to Welcome Maa Lakshmi & The Complete Lakshmi Journey | AR Blessings',
  description: 'Start whenever you are ready. Your Day 1 begins today, and after completing the 75-day journey, celebrate Day 75 as your Personal Diwali. Guided spiritual & discipline practice by Anjanaa Reetoria.',
  openGraph: {
    title: 'Begin Your Lakshmi Journey | 75-Day Digital Guide & Sacred Book',
    description: 'Understand Lakshmi. Prepare for Lakshmi. Choose from the ₹500 Digital Guide, Physical Book, or Recommended Combo.',
    images: ['/images/books/lakshmi-75-days.jpg'],
  },
};

export const dynamic = 'force-dynamic';

export default async function LakshmiJourneyPage() {
  const books = await getBooksAsync();
  const findBook = (id: string, slug: string) => books.find((book) => book.id === id || book.slug === slug);
  const lakshmi75 = findBook('bk-lakshmi-75', '75-days-to-welcome-maa-lakshmi');
  const lakshmiCombo = findBook('prod-lakshmi-combo', 'the-complete-lakshmi-journey-combo');
  const mainLakshmi = findBook('bk-main-lakshmi-hoon', 'main-lakshmi-hoon');
  const lakshmiPricing = {
    digital: {
      price: Number(lakshmi75?.ebookPrice ?? lakshmi75?.price ?? 500),
      originalPrice: lakshmi75?.originalPrice ? Number(lakshmi75.originalPrice) : undefined,
    },
    combo: {
      price: Number(lakshmiCombo?.price ?? 1750),
      originalPrice: lakshmiCombo?.originalPrice ? Number(lakshmiCombo.originalPrice) : undefined,
    },
    physical: {
      price: Number(mainLakshmi?.physicalPrice ?? mainLakshmi?.price ?? 1250),
      originalPrice: mainLakshmi?.originalPrice ? Number(mainLakshmi.originalPrice) : undefined,
    },
  };
  return (
    <div className="min-h-screen bg-[#fffdfa] text-gray-900 font-sans">
      {/* Hero Headline Section */}
      <div className="bg-gradient-to-b from-[#78181a] via-[#8b1d20] to-[#5b1012] text-white py-14 sm:py-20 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-amber-200 border border-amber-300/30">
            <Sparkles size={14} className="text-amber-300" />
            <span>Spiritual Guidance by Anjanaa Reetoria</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-tight">
            Why Wait for the Date of Diwali?
            <span className="block text-amber-300 text-2xl sm:text-4xl lg:text-5xl mt-2">
              Begin Your 75 Days Today.
            </span>
          </h1>

          <p className="text-amber-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed pt-2">
            This is not merely a guide to start before Diwali. You can begin <strong>Day 1</strong> on any day of the year. Whenever your 75 days are complete, celebrate that milestone as your <strong>Personal Diwali</strong>.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-amber-200">
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>Guided Daily Habits &amp; Discipline</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>Food Reverence &amp; Mindful Wealth Awareness</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>Sankalp, 1 Mala &amp; Weekly Daan</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 3 Products Section */}
      <LakshmiJourneySection isLandingPage={true} pricing={lakshmiPricing} />

      {/* Deep-Dive: What is the 75-Day Journey? */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-amber-50/50 border-t border-b border-amber-200/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              A Journey of True Inner Alignment
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#78181a] font-serif">
              What is Included in This 75-Day Journey?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              A holistic transformation combining home preparation with daily habits, discipline, reverence for food, wealth awareness, selfless giving, spiritual sadhana, and structured living:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🪔
              </div>
              <h4 className="text-base font-bold text-gray-900">Daily Sankalp &amp; 1 Mala</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Daily sacred intention (sankalp) and chanting of 1 mala dedicated to your Ishta Devata and Maa Lakshmi. Calm mental restlessness and anchor yourself in spiritual stability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🌸
              </div>
              <h4 className="text-base font-bold text-gray-900">Evening Diya &amp; Sacred Space</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                The sacred evening tradition of lighting an oil lamp (diya) and creating sacred rangoli at your home entrance and altar, inviting auspicious divine energy into your home.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🌾
              </div>
              <h4 className="text-base font-bold text-gray-900">Reverence for Food &amp; Nourishment</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Heightened mindfulness toward food wastage. Remembering Maa Annapurna and Lord Vishnu with the sacred discipline of honoring every single grain of food.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🧹
              </div>
              <h4 className="text-base font-bold text-gray-900">Cleaning &amp; Mindful Decluttering</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Systematically clearing stagnant clutter from wardrobes, wallets, kitchen, and living spaces. A clean, harmonious environment is the true seat of divine consciousness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🙏
              </div>
              <h4 className="text-base font-bold text-gray-900">Weekly Daan (Selfless Giving)</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Regular weekly charity according to your capacity—feeding cows, birds, or helping those in need. Transforming financial contraction into the natural flow of abundance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                📋
              </div>
              <h4 className="text-base font-bold text-gray-900">Resolving Pending Responsibilities</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Methodically completing unfinished obligations, financial dues, and overcoming procrastination habits to eliminate subconscious weight and mental strain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#78181a]">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Everything you need to know before beginning your journey
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              Can this journey only be started before Diwali?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              Not at all! That is the true essence of this journey. Your Day 1 can begin today or any day of the year. The day you complete your 75 days, you can celebrate that milestone as your own <strong>Personal Diwali</strong>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              How will I receive access to the ₹500 Digital Guide?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              Immediately upon successful payment, a digital copy along with instant access to our secure online e-book reader will be delivered to your registered email address.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              What is included in the COMPLETE COMBO (₹1,750)?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              Yes! The Complete Combo is our most recommended choice. You receive the consecrated hardcover physical book of <strong>Main Lakshmi Hoon</strong> delivered to your doorstep via insured courier (delivery charges included), plus immediate digital email access to the <strong>75-Day Digital Guide</strong>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              Is any special ritual equipment or puja samagri required?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              No. This is a practical spiritual and personal discipline practice. All that is required is sincere devotion, daily consistency, a simple japa mala, and an evening oil lamp (diya).
            </p>
          </div>
        </div>

        {/* Support Callout */}
        <div className="text-center pt-6">
          <p className="text-xs text-gray-500">
            Any further questions? Talk to our team on WhatsApp:{' '}
            <a
              href="https://wa.me/918433558905"
              className="text-[#8b1d20] font-bold hover:underline"
            >
              +91 84335 58905
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
