"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Download, ArrowRight, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { books as defaultBooks, Book } from '@/data/books';
import { useCart } from '@/context/CartContext';
import type { SiteSettings } from '@/lib/db/cmsStore';

export const BooksHomeSection: React.FC<{ initialBooks?: Book[]; settings?: SiteSettings }> = ({ initialBooks, settings }) => {
  const { addToCart } = useCart();
  const displayBooks = initialBooks ?? defaultBooks;

  return (
    <section className="py-14 sm:py-20 bg-[#f8faff] border-t border-b border-blue-100/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-widest text-[#0008c1] uppercase mb-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>{settings?.booksKicker || 'Sacred Literature'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0008c1] font-serif">
              {settings?.booksTitle || 'Books & Instant E-Books'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl">
              {settings?.booksDescription || 'Authentic Vedic prosperity guidebooks, manifestation journals, and Vastu blueprints available in instant digital and keepsake print editions.'}
            </p>
          </div>

          <Link
            href="/books"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#0008c1] hover:text-[#1346af] transition"
          >
            <span>Explore All Books &amp; E-Books</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Books Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayBooks.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Cover container */}
              <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-900 to-slate-800 p-3 flex items-center justify-center overflow-hidden">
                {book.badge && (
                  <span className="absolute top-3 left-3 bg-[#eab308] text-gray-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow z-10">
                    {book.badge}
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded z-10 flex items-center space-x-1">
                  {book.formatType === 'ebook' ? (
                    <>
                      <Download size={10} />
                      <span>E-Book</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={10} />
                      <span>Book + E-Book</span>
                    </>
                  )}
                </span>
                <Link href={`/books/${book.slug}`} className="relative w-full h-full block">
                  <Image
                    src={book.image}
                    alt={book.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                  />
                </Link>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
                    {book.author}
                  </span>
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#0008c1] transition-colors line-clamp-2 leading-snug">
                      {book.name}
                    </h3>
                  </Link>
                  {book.rating && (
                    <div className="flex items-center space-x-1 pt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i < Math.floor(book.rating!) ? "fill-current" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {book.rating.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price and Cart */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">From</span>
                    <span className="text-sm font-extrabold text-[#0008c1]">
                      ₹{book.price}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(book)}
                    className="inline-flex items-center space-x-1 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                  >
                    <ShoppingCart size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
