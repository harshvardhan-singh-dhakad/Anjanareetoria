import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for AR Blessings. Review our terms, user agreements, digital product policies, and purchasing conditions.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'September 17, 2026';

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#1778f2] transition">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Terms of Service</span>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm mb-8">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#1778f2] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            User Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0008c1] font-serif mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500">
            Last Updated: <span className="font-medium text-gray-700">{lastUpdated}</span>
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
            <p>
              Welcome to <strong>AR Blessings</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website (<Link href="https://arblessings.com" className="text-[#1778f2] hover:underline font-medium">arblessings.com</Link>), mobile services, digital reader, and your purchase of consecrated spiritual products, digital books, masterclasses, and astrological consulting materials.
            </p>
            <p className="mt-2 text-gray-600">
              By accessing our website, creating an account, or purchasing any product or service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">1</span>
              Eligibility &amp; User Accounts
            </h2>
            <p className="mb-3">
              By using AR Blessings, you represent that you are at least 18 years old (or accessing the site with parental/guardian supervision).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>You are responsible for maintaining the confidentiality of your account credentials, login passwords, and session security.</li>
              <li>You agree to provide accurate, current, and complete information during registration and checkout.</li>
              <li>You are entirely responsible for all activities that occur under your account. If you suspect unauthorized access, you must notify us immediately at <a href="mailto:support@arblessings.com" className="text-[#1778f2] underline">support@arblessings.com</a>.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">2</span>
              Consecrated Products &amp; Spiritual Disclaimer
            </h2>
            <p className="mb-3">
              AR Blessings specializes in authentically energized spiritual and prosperity essentials, including our signature <em>Karodon Ka Wallet</em>, <em>Karodon Ka Dollar</em>, gemstone bracelets, spiritual fragrances, and yantras.
            </p>
            <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-xl text-xs sm:text-sm text-amber-900 leading-relaxed space-y-2">
              <p>
                <strong>Spiritual Guidance Notice:</strong> All products, astrological insights, numerological guidance, and consecrated rituals are rooted in ancient Vedic tradition and intended solely for spiritual well-being, mindfulness, devotional alignment, and personal self-development.
              </p>
              <p>
                Spiritual results and personal abundance depend on individual actions, beliefs, and karma. Spiritual items should never be used as a substitute for certified medical, financial, or legal professional advice.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">3</span>
              Digital Content &amp; Anti-Piracy Protection
            </h2>
            <p className="mb-3">
              We provide digital eBooks, guides, and live/recorded webinar access through our proprietary secure reader and video player platform.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Personal Non-Commercial License:</strong> When you purchase an eBook or webinar, you are granted a non-exclusive, non-transferable, revocable license for your personal, private viewing only.</li>
              <li><strong>Strict Anti-Piracy Prohibition:</strong> You are strictly forbidden from screen recording, copying, downloading unauthorized source files, republishing, sharing account credentials, or redistributing our digital material in any form.</li>
              <li>Our platform utilizes anti-piracy watermarks and dynamic session identifiers. Any detected violation will result in immediate termination of account access without refund and possible legal action under Indian copyright law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">4</span>
              Pricing, Orders &amp; Payments
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>All prices on arblessings.com are listed in Indian Rupees (INR) and are inclusive or exclusive of applicable taxes as indicated at checkout.</li>
              <li>We reserve the right to modify prices or discontinue items at any time without prior notice.</li>
              <li>We reserve the right to cancel or refuse any order suspected of fraudulent activity, pricing errors, or unauthorized reseller intent. In such cases, any received payments will be refunded through the original payment method.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">5</span>
              Shipping, Returns &amp; Refund Terms
            </h2>
            <p className="text-gray-600 mb-3">
              Shipping and cancellation policies are governed by our dedicated service guidelines:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <h3 className="font-bold text-[#0008c1] mb-1">Shipping &amp; Delivery</h3>
                <p className="text-xs text-gray-600 mb-2">Orders are processed within 24–48 hours and shipped across India via express couriers.</p>
                <Link href="/shipping-policy" className="text-xs text-[#1778f2] font-semibold hover:underline">Read Shipping Policy &rarr;</Link>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <h3 className="font-bold text-[#0008c1] mb-1">Refunds &amp; Replacements</h3>
                <p className="text-xs text-gray-600 mb-2">Replacements are provided for transit damage reported within 48 hours of delivery.</p>
                <Link href="/refund-policy" className="text-xs text-[#1778f2] font-semibold hover:underline">Read Refund Policy &rarr;</Link>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">6</span>
              Intellectual Property Rights
            </h2>
            <p className="text-gray-600">
              All materials on this website—including brand names, trademarks, logos, texts, photographs, book manuscripts, product designs, graphics, audio, video, software code, and overall design—are the exclusive intellectual property of AR Blessings and are protected under Indian and international copyright and trademark laws. No portion of the website may be reproduced, modified, or exploited without prior express written consent.
            </p>
          </section>

          {/* Section 7 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">7</span>
              Limitation of Liability
            </h2>
            <p className="text-gray-600">
              To the fullest extent permitted by applicable law, AR Blessings, its founders, directors, employees, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of your use of or inability to use our website, products, or digital services. Our total aggregate liability for any claim shall not exceed the amount paid by you for the specific item giving rise to the claim.
            </p>
          </section>

          {/* Section 8 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">8</span>
              Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute, claim, or controversy arising out of or relating to these Terms or the use of our services shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          {/* Section 9 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">9</span>
              Contact &amp; Customer Support
            </h2>
            <p className="mb-3 text-gray-600">
              For any questions, legal clarifications, or support regarding these Terms of Service, please reach out to:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-700 space-y-1">
              <p><strong>AR Blessings</strong></p>
              <p>Support Email: <a href="mailto:support@arblessings.com" className="text-[#1778f2] hover:underline font-medium">support@arblessings.com</a></p>
              <p>Official Website: <a href="https://arblessings.com" className="text-[#1778f2] hover:underline font-medium">https://arblessings.com</a></p>
            </div>
          </section>
        </div>

        {/* Related Policies Box */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-medium text-gray-600">
          <Link href="/privacy-policy" className="hover:text-[#1778f2] underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/data-deletion" className="hover:text-[#1778f2] underline">Data Deletion Instructions</Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-[#1778f2] underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/shipping-policy" className="hover:text-[#1778f2] underline">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
