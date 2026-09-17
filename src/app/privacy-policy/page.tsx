import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for AR Blessings. Learn how we collect, use, and protect your personal information, account data, and orders.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 17, 2026';

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb / Top bar */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#1778f2] transition">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Privacy Policy</span>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm mb-8">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#1778f2] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            Legal &amp; Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0008c1] font-serif mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last Updated: <span className="font-medium text-gray-700">{lastUpdated}</span>
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
            <p>
              At <strong>AR Blessings</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are deeply committed to safeguarding the privacy and security of our website visitors, customers, and registered users. This Privacy Policy outlines how your personal information is collected, used, shared, and protected when you interact with our website (<Link href="https://arblessings.com" className="text-[#1778f2] hover:underline font-medium">arblessings.com</Link>), purchase our consecrated spiritual products, read our digital eBooks, or register for our online webinars and masterclasses.
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm space-y-8 text-sm text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">1</span>
              Information We Collect
            </h2>
            <p className="mb-3">
              We collect information that you directly provide to us, as well as data gathered automatically during your browsing sessions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Personal Identifiers:</strong> Your full name, email address, phone/WhatsApp number, shipping and billing address when you register an account, place an order, or submit inquiries.
              </li>
              <li>
                <strong>Transaction &amp; Order Details:</strong> Information about items purchased (e.g., Karodon Ka Wallet, Karodon Ka Dollar, consecrated amulets, e-books, webinars), order timestamps, transaction IDs, and delivery status.
              </li>
              <li>
                <strong>Payment Information:</strong> Payments on our website are handled directly through certified, PCI-DSS compliant payment gateways (such as Razorpay, PhonePe, or UPI gateways). <em>We never store your raw credit card, debit card, or banking credentials on our servers.</em>
              </li>
              <li>
                <strong>Account &amp; Social Login Data:</strong> If you register or authenticate using third-party services (such as Facebook Login or Google Sign-In), we receive your public profile identifier, name, and verified email address as permitted by your third-party account permissions.
              </li>
              <li>
                <strong>Device &amp; Usage Information:</strong> Browser type, operating system, IP address, device model, referral source, and pages viewed, collected via standard server logs and cookies.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">2</span>
              How We Use Your Information
            </h2>
            <p className="mb-3">
              We use your collected personal information strictly for genuine business purposes, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Processing, packing, consecrating, and shipping physical products to your doorstep.</li>
              <li>Providing instant access to digital products (eBooks, interactive reader, webinar links, and course materials).</li>
              <li>Sending transactional updates, tracking codes, order confirmations, and invoices via Email and WhatsApp.</li>
              <li>Providing dedicated customer care, addressing grievances, and resolving product or delivery queries.</li>
              <li>Detecting, investigating, and preventing fraudulent transactions, security violations, and unauthorized digital distribution.</li>
              <li>Complying with statutory accounting, tax, and legal obligations under applicable Indian laws.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">3</span>
              Sharing &amp; Third-Party Disclosures
            </h2>
            <p className="mb-3">
              We value your trust above all else. <strong>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</strong>
            </p>
            <p className="mb-3">
              We only share relevant information with trusted service providers who assist us in our daily operations under strict confidentiality agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Logistics &amp; Courier Partners:</strong> Courier aggregators and delivery personnel (e.g., Delhivery, BlueDart, India Post) to fulfill your physical shipments.</li>
              <li><strong>Payment Gateways:</strong> Secure, licensed financial processors to authenticate and complete payments.</li>
              <li><strong>Communication Services:</strong> Email and SMS/WhatsApp gateway providers to send essential order notifications.</li>
              <li><strong>Legal Authorities:</strong> When required by lawful summons, court order, or applicable law to protect the legal rights, safety, and property of AR Blessings or our customers.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">4</span>
              Cookies &amp; Tracking Technologies
            </h2>
            <p className="text-gray-600">
              Our website uses cookies and similar technologies to enhance your shopping experience, remember your cart items, keep you logged into your secure account session, and analyze general site traffic. You can adjust your browser settings to decline cookies, although doing so may impair certain features of the shopping cart and reader.
            </p>
          </section>

          {/* Section 5 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">5</span>
              Data Protection &amp; Security
            </h2>
            <p className="text-gray-600">
              We implement industry-standard administrative, technical, and physical safeguards to prevent unauthorized access, disclosure, alteration, or destruction of your personal data. All data transmission across arblessings.com is encrypted using modern 256-bit SSL/TLS encryption.
            </p>
          </section>

          {/* Section 6 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">6</span>
              Your Privacy Rights &amp; Data Deletion
            </h2>
            <p className="mb-3 text-gray-600">
              Depending on your jurisdiction and applicable data protection regulations (including the Digital Personal Data Protection Act, 2023 of India, and GDPR), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or updating of inaccurate information.</li>
              <li>Withdraw consent for optional communications at any time.</li>
              <li>
                <strong>Request Complete Erasure / Data Deletion:</strong> You may request the permanent deletion of your account and personal records at any time. For full instructions on requesting data removal, please visit our dedicated{' '}
                <Link href="/data-deletion" className="text-[#1778f2] font-semibold hover:underline">
                  Data Deletion Instructions
                </Link>{' '}
                page.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-[#0008c1] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#1778f2] text-xs flex items-center justify-center font-bold">7</span>
              Contact &amp; Grievance Redressal
            </h2>
            <p className="mb-3 text-gray-600">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data management practices, please contact our Grievance Officer:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-700 space-y-1">
              <p><strong>AR Blessings</strong></p>
              <p>Email: <a href="mailto:support@arblessings.com" className="text-[#1778f2] hover:underline font-medium">support@arblessings.com</a></p>
              <p>Website: <a href="https://arblessings.com" className="text-[#1778f2] hover:underline font-medium">https://arblessings.com</a></p>
              <p>Instagram: <a href="https://www.instagram.com/ar_blessings_" target="_blank" rel="noopener noreferrer" className="text-[#1778f2] hover:underline font-medium">@ar_blessings_</a></p>
            </div>
          </section>
        </div>

        {/* Related Policies Box */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-medium text-gray-600">
          <Link href="/terms-of-service" className="hover:text-[#1778f2] underline">Terms of Service</Link>
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
