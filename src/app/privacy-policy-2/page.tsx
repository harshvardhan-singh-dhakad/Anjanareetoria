import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-[#0008c1] font-serif mb-6">Privacy Policy</h1>
      <div className="prose prose-blue text-sm text-gray-700 leading-relaxed space-y-4">
        <p>
          Your privacy is important to us. This Privacy Policy describes how AR Blessings collects, uses, and protects your personal information when you visit or make a purchase from our site.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Information We Collect</h2>
        <p>
          When you place an order or contact us, we collect details such as your name, phone number, delivery address, and email strictly for fulfilling your orders and communication.
        </p>
        <h2 className="text-base font-bold text-gray-900 mt-4">Data Security</h2>
        <p>
          We employ standard security practices to protect your data. We never sell, rent, or trade your personal information to third parties.
        </p>
      </div>
    </div>
  );
}
