import React from 'react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-[#0008c1] font-serif mb-6">Shipping Policy</h1>
      <div className="prose prose-blue text-sm text-gray-700 leading-relaxed space-y-4">
        <p>
          We offer reliable Pan-India shipping to ensure your sacred blessings arrive safely and securely.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Processing Time</h2>
        <p>
          Orders typically undergo consecration and dispatch within 1-3 business days following order confirmation.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Delivery Timeline</h2>
        <p>
          Standard delivery takes approximately 3-7 business days depending on your delivery location across India. Tracking details are shared via SMS and WhatsApp once dispatched.
        </p>
      </div>
    </div>
  );
}
