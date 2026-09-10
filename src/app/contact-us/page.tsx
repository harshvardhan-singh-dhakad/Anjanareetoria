import React from 'react';
import { Mail } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-[#0008c1] font-serif mb-8 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#0008c1]">Get in Touch</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Have questions about our products, consecration process, or need guidance on choosing the right prosperity item? We are always here to help you.
          </p>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-[#0008c1] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <a href="https://www.instagram.com/ar_blessings_" target="_blank" rel="noopener noreferrer" className="hover:underline">
                @ar_blessings_
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={18} className="text-[#0008c1]" />
              <span>support@arblessings.com</span>
            </div>
          </div>
        </div>

        <form className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
            <input type="text" placeholder="Your name" className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-[#0008c1]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" placeholder="Your email address" className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-[#0008c1]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
            <textarea rows={4} placeholder="How can we assist you?" className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-[#0008c1]"></textarea>
          </div>
          <button type="button" className="w-full bg-[#1346af] text-white text-xs font-semibold py-2.5 rounded-full hover:bg-[#3a3a3a] transition">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
