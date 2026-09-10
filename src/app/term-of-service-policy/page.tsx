import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-[#0008c1] font-serif mb-6">Terms of Service Policy</h1>
      <div className="prose prose-blue text-sm text-gray-700 leading-relaxed space-y-4">
        <p>
          Welcome to AR Blessings. By accessing or using our website and purchasing our consecrated products, you agree to be bound by these terms and conditions.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">1. Use of Website</h2>
        <p>
          All content, images, graphics, and descriptions on arblessings.com are the intellectual property of AR Blessings. Unauthorized reproduction is strictly prohibited.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">2. Product Orders & Pricing</h2>
        <p>
          Prices are subject to change without prior notice. We reserve the right to refuse or cancel orders placed with incorrect pricing or unavailable inventory.
        </p>
      </div>
    </div>
  );
}
