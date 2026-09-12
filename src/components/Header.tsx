"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm transition-all">
      {/* Topbar */}
      <div className="bg-[#0008c1] text-white py-1.5 px-4 text-center text-xs tracking-wider font-medium">
        <span>✨ Welcome to AR Blessings — Authentically Blessed Spiritual & Luxury Essentials ✨</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700 hover:text-[#0008c1] transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="AR Blessings"
            width={180}
            height={70}
            priority
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-[#0008c1] hover:text-[#1346af] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#products"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/books"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Books &amp; E-Books
          </Link>
          <Link
            href="/blog"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/webinars"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Webinars
          </Link>
          <Link
            href="/#videos"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Insights
          </Link>
          <Link
            href="/about-us"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            className="text-sm font-semibold tracking-wide text-[#2b2b2b] hover:text-[#0008c1] transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Site Tools */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          {/* Search Toggle */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-[#0008c1] transition"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white shadow-xl rounded-lg p-2 border border-gray-100 flex items-center z-50">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-3 py-2 outline-none border-b border-transparent focus:border-[#0008c1]"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (searchQuery) window.location.href = `/#products`;
                    setSearchOpen(false);
                  }}
                  className="bg-[#1346af] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#3a3a3a] transition"
                >
                  Go
                </button>
              </div>
            )}
          </div>

          {/* User / Wishlist */}
          <Link
            href="/contact-us"
            className="hidden sm:inline-block p-2 text-gray-700 hover:text-[#0008c1] transition"
            aria-label="Account / Inquiries"
          >
            <User size={20} />
          </Link>

          {/* Cart Icon & Counter */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-800 hover:text-[#0008c1] transition flex items-center"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={22} />
            <span className="absolute -top-1 -right-1 bg-[#0008c1] text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow">
              {totalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 space-y-3 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#0008c1] py-2 border-b border-gray-50"
          >
            Home
          </Link>
          <Link
            href="/#products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Shop
          </Link>
          <Link
            href="/books"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Books &amp; E-Books
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Blog
          </Link>
          <Link
            href="/webinars"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Webinars &amp; Masterclasses
          </Link>
          <Link
            href="/#videos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Insights
          </Link>
          <Link
            href="/#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            Success Stories
          </Link>
          <Link
            href="/about-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2 border-b border-gray-50"
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-gray-800 hover:text-[#0008c1] py-2"
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
};
