import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-[#0008c1] font-serif mb-6">Refund Policy</h1>
      <div className="prose prose-blue text-sm text-gray-700 leading-relaxed space-y-4">
        <p>
          Due to the consecrated and personalized spiritual nature of our products, please review our refund and return guidelines carefully.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Damaged or Defective Items</h2>
        <p>
          If your product arrives damaged in transit or defective, please contact us within 48 hours of delivery with photographic proof at support@arblessings.com or via WhatsApp. We will promptly arrange a replacement.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Consecrated Products</h2>
        <p>
          Items that have been personalized, custom-blessed, or opened from their original sacred packaging are not eligible for voluntary returns.
        </p>
      </div>
    </div>
  );
}
