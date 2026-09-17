import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions',
  description: 'Step-by-step instructions on how users can request the deletion of their personal data and account information from AR Blessings.',
  alternates: {
    canonical: '/data-deletion',
  },
};

export default function DataDeletionPage() {
  const lastUpdated = 'September 17, 2026';

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#1778f2] transition">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Data Deletion Instructions</span>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1778f2] uppercase tracking-wider mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1778f2]" />
              User Data &amp; Privacy Rights
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0008c1] font-serif mb-3">
            User Data Deletion Instructions
          </h1>
          <p className="text-xs text-gray-500">
            Last Updated: <span className="font-medium text-gray-700">{lastUpdated}</span>
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
            <p>
              At <strong>AR Blessings</strong> (<Link href="https://arblessings.com" className="text-[#1778f2] hover:underline font-medium">arblessings.com</Link>), we respect your right to control your personal information. In accordance with the Meta (Facebook) Platform Terms, the Digital Personal Data Protection Act (DPDP), and international data privacy standards, we provide straightforward methods for users to request the permanent deletion of their account and associated data.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Method 1: Facebook / Meta Users */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1778f2] font-bold">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0008c1]">
                  Method 1: If You Logged In via Facebook / Meta
                </h2>
                <p className="text-xs text-gray-500">
                  Follow these standard steps to disconnect AR Blessings and trigger automated data deletion from Meta:
                </p>
              </div>
            </div>

            <ol className="mt-6 space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1778f2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Log in to Facebook:</strong> Go to your Facebook account and navigate to <strong>Settings &amp; Privacy</strong> &gt; <strong>Settings</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1778f2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Navigate to Apps &amp; Websites:</strong> In the left-hand navigation menu, select <strong>Apps and Websites</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1778f2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Select AR Blessings:</strong> Find <strong>AR Blessings</strong> in the active applications list.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1778f2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Click Remove:</strong> Click the <strong>Remove</strong> button to revoke access.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="w-6 h-6 rounded-full bg-[#1778f2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <strong>Submit Data Deletion Request:</strong> Under the <strong>Removed Apps and Websites</strong> tab, click on <strong>AR Blessings</strong> and click <strong>Send Request</strong>. This notifies AR Blessings to delete all associated Facebook user identifier records.
                </div>
              </li>
            </ol>
          </div>

          {/* Method 2: Direct Email Request */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1778f2]">
                <Mail className="w-5 h-5 text-[#1778f2]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0008c1]">
                  Method 2: Direct Email Request (All Users &amp; Customers)
                </h2>
                <p className="text-xs text-gray-500">
                  You can submit a data deletion request directly to our customer privacy desk:
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Send an email to our support team from the email address registered with your AR Blessings account:
            </p>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 text-xs sm:text-sm text-gray-800 space-y-2 font-mono">
              <p><span className="text-gray-500 font-sans font-medium">To:</span> <span className="font-semibold text-[#1778f2]">support@arblessings.com</span></p>
              <p><span className="text-gray-500 font-sans font-medium">Subject:</span> <span className="font-semibold">Data Deletion Request - AR Blessings</span></p>
              <div className="pt-3 border-t border-blue-200 text-xs font-sans text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">Please provide the following in your message:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Your full name</li>
                  <li>Registered email address used on AR Blessings</li>
                  <li>Registered phone or WhatsApp number (if applicable)</li>
                  <li>Statement confirming your request: &quot;I request the complete deletion of my AR Blessings account and personal data.&quot;</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What Data is Deleted */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-200/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#0008c1]">
              What Happens After You Submit a Request?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-green-200 bg-green-50/40">
                <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Data Permanently Erased</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>Account profile details (Name, email, password hash)</li>
                  <li>Saved shipping and billing addresses</li>
                  <li>Session authentication tokens and device identifiers</li>
                  <li>Connected social login credentials (Facebook/Google IDs)</li>
                  <li>Marketing newsletter and promotional subscriptions</li>
                  <li>Reading progress, bookmarks, and private preferences</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Statutory Legal Exceptions</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Under applicable Indian laws (such as the Companies Act, GST regulations, and taxation statutes), record of past completed monetary transactions and tax invoices must be retained for statutory auditing purposes for the period prescribed by law. These records will be securely archived and never used for marketing or profiling.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600 space-y-2">
              <p>
                <strong>Processing Timeline:</strong> We acknowledge requests within <strong>48 hours</strong> and permanently complete user data deletion within <strong>30 calendar days</strong>.
              </p>
              <p>
                Once completed, you will receive a final confirmation notification containing your reference confirmation code.
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#0008c1] text-base">Have questions about your data?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Our customer privacy team is available to assist you with any inquiries.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="mailto:support@arblessings.com"
                className="px-5 py-2.5 bg-[#1778f2] text-white text-xs font-semibold rounded-full hover:bg-[#1346af] transition shadow-sm"
              >
                Email Privacy Support
              </a>
              <Link
                href="/contact-us"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full hover:bg-gray-200 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Related Policies Box */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs font-medium text-gray-600">
          <Link href="/privacy-policy" className="hover:text-[#1778f2] underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms-of-service" className="hover:text-[#1778f2] underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-[#1778f2] underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/shipping-policy" className="hover:text-[#1778f2] underline">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
