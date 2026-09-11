"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, BookOpen, Download, Package, Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { books, Book } from '@/data/books';
import { useCart } from '@/context/CartContext';

export const BooksCatalogClient: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedTab, setSelectedTab] = useState<'all' | 'ebook' | 'physical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Format filter
      const matchesFormat =
        selectedTab === 'all' ||
        (selectedTab === 'ebook' && (book.formatType === 'ebook' || book.formatType === 'both')) ||
        (selectedTab === 'physical' && (book.formatType === 'physical' || book.formatType === 'both'));

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.name.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.shortDescription.toLowerCase().includes(q);

      return matchesFormat && matchesSearch;
    });
  }, [selectedTab, searchQuery]);

  return (
    <div className="w-full bg-[#fafbfc] min-h-screen pb-16">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-b from-[#0008c1] to-[#0a1b80] text-white py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-[1240px] mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-blue-200 border border-white/20">
            <Sparkles size={14} className="text-amber-300" />
            <span>Sacred Knowledge &amp; Manifestation Literature</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
            Spiritual Books &amp; E-Books
          </h1>

          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Authentic Vedic literature, prosperity blueprints, and manifestation workbooks. Available as instant high-resolution digital E-Books and consecrated printed editions.
          </p>

          {/* Quick Stats Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <Download size={16} className="text-amber-400" />
              <span>Instant Digital PDF Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package size={16} className="text-amber-400" />
              <span>Pan-India Doorstep Book Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span>4.9/5 Master Verified Wisdom</span>
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/reader"
              className="inline-flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs px-5 py-2.5 rounded-full transition shadow-md"
            >
              <BookOpen size={14} />
              <span>Already Purchased? Open Protected E-Book Reader →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Catalog Controls */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                selectedTab === 'all'
                  ? 'bg-white text-[#0008c1] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Publications ({books.length})
            </button>
            <button
              onClick={() => setSelectedTab('ebook')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedTab === 'ebook'
                  ? 'bg-white text-[#0008c1] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download size={14} />
              <span>Instant E-Books</span>
            </button>
            <button
              onClick={() => setSelectedTab('physical')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedTab === 'physical'
                  ? 'bg-white text-[#0008c1] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen size={14} />
              <span>Physical Books</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1] outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-10">
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-lg mx-auto">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No books found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Try adjusting your search query or switching to another format tab.
            </p>
            <button
              onClick={() => {
                setSelectedTab('all');
                setSearchQuery('');
              }}
              className="mt-4 text-xs font-semibold text-[#0008c1] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Book Cover Container with perspective */}
                <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden flex items-center justify-center p-3">
                  {/* Badge */}
                  {book.badge && (
                    <span className="absolute top-3 left-3 bg-[#eab308] text-gray-900 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded shadow-md z-10">
                      {book.badge}
                    </span>
                  )}

                  {/* Format tag */}
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded z-10 flex items-center space-x-1">
                    {book.formatType === 'ebook' ? (
                      <>
                        <Download size={10} />
                        <span>E-Book PDF</span>
                      </>
                    ) : book.formatType === 'physical' ? (
                      <>
                        <BookOpen size={10} />
                        <span>Printed</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={10} />
                        <span>E-Book + Print</span>
                      </>
                    )}
                  </span>

                  <Link href={`/books/${book.slug}`} className="relative w-full h-full block">
                    <Image
                      src={book.image}
                      alt={book.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </Link>

                  {/* Hover Quick Read Excerpt Overlay Button */}
                  <button
                    onClick={() => setPreviewBook(book)}
                    className="absolute bottom-3 inset-x-3 bg-white/95 hover:bg-white text-gray-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center space-x-1.5 backdrop-blur-sm"
                  >
                    <Eye size={14} className="text-[#0008c1]" />
                    <span>Read Sample Excerpt</span>
                  </button>
                </div>

                {/* Book Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                      {book.author}
                    </div>

                    <Link href={`/books/${book.slug}`}>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#0008c1] transition-colors line-clamp-2 leading-snug">
                        {book.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {book.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < Math.floor(book.rating!) ? "fill-current" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {book.rating.toFixed(2)} ({book.reviewCount})
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pt-1">
                      {book.shortDescription}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 mt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-gray-500 block">Starting from</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base sm:text-lg font-extrabold text-[#0008c1]">
                            ₹{book.price}
                          </span>
                          {book.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{book.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Instant Delivery
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/books/${book.slug}`}
                        className="w-full text-center text-xs font-semibold py-2 px-3 border border-gray-200 hover:border-[#0008c1] hover:text-[#0008c1] rounded-lg transition"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => addToCart(book)}
                        className="w-full inline-flex items-center justify-center space-x-1 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                      >
                        <ShoppingCart size={13} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Excerpt Reader Modal */}
      {previewBook && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-14 rounded overflow-hidden shadow-sm flex-shrink-0">
                  <Image
                    src={previewBook.image}
                    alt={previewBook.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                    Free Sample Chapter
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                    {previewBook.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setPreviewBook(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Reading Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 font-serif text-gray-800 text-sm sm:text-base leading-relaxed bg-amber-50/20">
              <div className="text-center pb-4 border-b border-amber-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-[#0008c1]">
                  {previewBook.sampleExcerpt.chapterTitle}
                </h3>
                {previewBook.sampleExcerpt.subheading && (
                  <p className="text-xs sm:text-sm text-gray-500 font-sans italic mt-1">
                    {previewBook.sampleExcerpt.subheading}
                  </p>
                )}
              </div>

              {previewBook.sampleExcerpt.paragraphs.map((para, idx) => (
                <p key={idx} className="indent-4">
                  {para}
                </p>
              ))}

              <div className="pt-6 border-t border-amber-200/50 text-center font-sans">
                <p className="text-xs text-gray-500 italic mb-3">
                  This is a sample excerpt. Unlock the complete {previewBook.pages}-page wisdom guide today.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                Full edition: <strong className="text-[#0008c1] text-sm">₹{previewBook.price}</strong>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewBook(null)}
                  className="w-1/2 sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    addToCart(previewBook);
                    setPreviewBook(null);
                  }}
                  className="w-1/2 sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition shadow-md"
                >
                  <ShoppingCart size={14} />
                  <span>Get Complete Book</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
