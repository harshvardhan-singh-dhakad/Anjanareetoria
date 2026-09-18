"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-[#1778f2] text-white pt-16 pb-12 mt-16 border-t border-blue-400">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Help Center */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-5 pb-2 border-b border-white/20">
              Help Center
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-blue-50">
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-white transition">
                  Data Deletion Instructions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-5 pb-2 border-b border-white/20">
              Information
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-blue-50">
              <li>
                <Link href="/about-us" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-white transition">
                  Books &amp; E-Books
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-white transition">
                  Live Webinars &amp; Masterclasses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Spiritual Blog
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-white transition">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition text-blue-200">
                  Staff / Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-5 pb-2 border-b border-white/20">
              Stay Connected
            </h4>
            <p className="text-xs sm:text-sm text-blue-50 mb-4 leading-relaxed">
              Connect with us for sacred updates, astrological guidance, and auspicious additions.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.instagram.com/ar_blessings_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#1778f2] transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-100">
          <p>© {new Date().getFullYear()} AR Blessings. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Rebuilt with Next.js & Pure Precision
          </p>
        </div>
      </div>
    </footer>
  );
};
