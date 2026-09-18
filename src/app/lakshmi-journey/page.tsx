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

export const metadata: Metadata = {
  title: 'माँ लक्ष्मी के स्वागत के 75 दिन & The Complete Lakshmi Journey | AR Blessings',
  description: 'Start whenever you are ready. Your Day 1 begins today, and after completing the 75-day journey, celebrate Day 75 as your Personal Diwali. Guided spiritual & discipline practice by Anjanaa Reetoria.',
  openGraph: {
    title: 'Begin Your Lakshmi Journey | 75-Day Digital Guide & Sacred Book',
    description: 'Understand Lakshmi. Prepare for Lakshmi. Choose from the ₹500 Digital Guide, Physical Book, or Recommended Combo.',
    images: ['/images/books/lakshmi-75-days.jpg'],
  },
};

export default function LakshmiJourneyPage() {
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
            दीपावली की तारीख का इंतज़ार क्यों?
            <span className="block text-amber-300 text-2xl sm:text-4xl lg:text-5xl mt-2">
              आज से अपने 75 दिन शुरू कीजिए।
            </span>
          </h1>

          <p className="text-amber-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed pt-2">
            यह केवल Diwali के पहले शुरू होने वाली booklet नहीं है। आप किसी भी दिन <strong>Day 1</strong> शुरू कर सकते हैं। जिस दिन आपके 75 दिन पूरे हों, उस completion को अपनी <strong>Personal Diwali</strong> की तरह celebrate कीजिए।
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-amber-200">
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>Guided Daily Habits &amp; Discipline</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>अन्न के प्रति सम्मान &amp; धन के प्रति Awareness</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle size={14} className="text-amber-300" />
              <span>Sankalp, 1 Mala &amp; Weekly Daan</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 3 Products Section */}
      <LakshmiJourneySection isLandingPage={true} />

      {/* Deep-Dive: What is the 75-Day Journey? */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-amber-50/50 border-t border-b border-amber-200/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              A Journey of True Inner Alignment
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#78181a] font-serif">
              इस 75-दिवसीय यात्रा में क्या शामिल है?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              घर की तैयारी के साथ अपनी daily habits, discipline, अन्न के प्रति सम्मान, धन के प्रति awareness, दान, साधना और जीवन की व्यवस्था पर समग्र काम:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🪔
              </div>
              <h4 className="text-base font-bold text-gray-900">Daily Sankalp &amp; 1 Mala</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                प्रतिदिन अपने इष्ट और माँ लक्ष्मी के प्रति संकल्प के साथ 1 माला का नित्य जाप। मन की चंचलता को शांत कर स्थिरता में स्थापित होना।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🌸
              </div>
              <h4 className="text-base font-bold text-gray-900">Evening Diya &amp; Rangoli</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                संध्या वेला में मुख्य द्वार और पूजा स्थल पर दीपक व पवित्र रंगोली की निरंतर परंपरा, जो घर में सकारात्मक प्राण ऊर्जा का संचार करती है।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🌾
              </div>
              <h4 className="text-base font-bold text-gray-900">अन्न के प्रति सम्मान</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Food wastage पर पूरी सजगता। माँ अन्नपूर्णा और भगवान विष्णु का स्मरण करते हुए अन्न का एक भी दाना व्यर्थ न करने का व्यावहारिक नियम।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🧹
              </div>
              <h4 className="text-base font-bold text-gray-900">Cleaning &amp; Decluttering</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                अलमारी, पर्स, किचन और घर के हर कोने से अनावश्यक कबाड़ को हटाना। स्वच्छ और व्यवस्थित वातावरण ही देवी चेतना का वास्तविक आधार है।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                🙏
              </div>
              <h4 className="text-base font-bold text-gray-900">Weekly Daan (साप्ताहिक दान)</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                अपने सामर्थ्य अनुसार जरूरतमंदों, गायों या पक्षियों के लिए नियमित साप्ताहिक दान। धन के संकुचन को खोलकर प्रवाह में बदलना।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-[#8b1d20] font-bold text-lg">
                📋
              </div>
              <h4 className="text-base font-bold text-gray-900">Pending Responsibilities</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                अधूरे पड़े कार्यों, कर्जों और टालमटोल की आदतों को योजनाबद्ध तरीके से समाप्त करना, ताकि मानसिक तनाव पूरी तरह दूर हो सके।
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
              क्या यह केवल दिवाली के पहले ही शुरू की जा सकती है?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              बिल्कुल नहीं! यही इस यात्रा की सबसे खूबसूरत बात है। आपका Day 1 आज ही शुरू हो सकता है। जिस दिन आपके 75 दिन पूरे होंगे, उस दिन को आप अपनी <strong>Personal Diwali</strong> की तरह मना सकते हैं।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              ₹500 वाले Digital Guide का एक्सेस मुझे कैसे मिलेगा?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              भुगतान पूर्ण होते ही आपके रजिस्टर्ड ईमेल पर डिजिटल गाइड की कॉपी और हमारे सुरक्षित ऑनलाइन ई-बुक रीडर का सीधा लिंक तुरंत प्राप्त हो जाएगा।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              COMPLETE COMBO (₹1,750) में क्या दोनों चीजें मिलेंगी?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              हाँ! Complete Combo सबसे अनुशंसित विकल्प है। इसमें <strong>Main Lakshmi Hoon</strong> की हार्डकवर फिजिकल बुक आपके घर पर कूरियर द्वारा भेजी जाएगी (डिलीवरी शुल्क शामिल) और <strong>75-Day Digital Guide</strong> का तुरंत ईमेल एक्सेस मिलेगा।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="font-bold text-gray-900 text-sm mb-1.5">
              क्या इसके लिए किसी विशेष पूजा सामग्री की जरूरत है?
            </h5>
            <p className="text-gray-600 leading-relaxed">
              नहीं। यह एक व्यावहारिक आध्यात्मिक और अनुशासन साधना है। इसके लिए केवल श्रद्धा, नियमितता, एक साधारण जप माला और शाम के दीपक की आवश्यकता होती है।
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
