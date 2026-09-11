"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  BookOpen,
  Download,
  Package,
  CheckCircle2,
  ShoppingCart,
  Eye,
  Share2,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Book } from '@/data/books';
import { useCart } from '@/context/CartContext';

export const BookDetailClient: React.FC<{ book: Book }> = ({ book }) => {
  const { addToCart } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<'ebook' | 'physical'>(
    book.formatType === 'physical' ? 'physical' : 'ebook'
  );
  const [quantity, setQuantity] = useState(1);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'specs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine active price based on selected format
  const currentPrice =
    selectedFormat === 'ebook'
      ? book.ebookPrice || book.price
      : book.physicalPrice || (book.price + 200);

  const handleAddToCart = () => {
    // Format tailored cart item
    const formattedItem = {
      ...book,
      id: `${book.id}-${selectedFormat}`,
      name: `${book.name} (${selectedFormat === 'ebook' ? 'Instant E-Book PDF' : 'Printed Physical Edition'})`,
      price: currentPrice,
    };
    addToCart(formattedItem, quantity);
  };

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 mb-8 flex items-center space-x-2">
        <Link href="/" className="hover:text-[#0008c1]">Home</Link>
        <span>/</span>
        <Link href="/books" className="hover:text-[#0008c1]">Books &amp; E-Books</Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold line-clamp-1">{book.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Book Presentation & Cover */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 flex items-center justify-center border border-gray-100 shadow-xl">
            {book.badge && (
              <span className="absolute top-4 left-4 bg-[#eab308] text-gray-950 text-xs font-black px-3 py-1 rounded shadow-md z-10">
                {book.badge}
              </span>
            )}

            <div className="relative w-full h-full max-h-[500px]">
              <Image
                src={book.image}
                alt={book.name}
                fill
                priority
                className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Quick Actions below cover */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsSampleOpen(true)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-[#0008c1] font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl transition border border-blue-200"
            >
              <Eye size={16} />
              <span>Read Free Sample</span>
            </button>

            <button
              onClick={handleCopyShare}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl transition border border-gray-200"
            >
              <Share2 size={16} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Book'}</span>
            </button>
          </div>

          {/* Digital Trust Guarantee */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-emerald-950">
              <Sparkles size={15} className="text-emerald-600" />
              <span>100% Authentic Consecrated Publication</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Every copy comes embedded with authentic Sanskrit transliterations, clear Hindi commentary, and practical daily prosperity protocols.
            </p>
          </div>
        </div>

        {/* Right Column: Title, Format Switcher, Actions, Details */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#0008c1] mb-2 bg-blue-50 px-3 py-1 rounded-full">
              By {book.author}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0008c1] font-serif leading-tight">
              {book.name}
            </h1>

            {/* Rating */}
            {book.rating && (
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(book.rating!) ? "fill-current" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-semibold">
                  {book.rating.toFixed(2)} / 5.0
                </span>
                <span className="text-xs text-gray-400">
                  ({book.reviewCount} customer reviews)
                </span>
              </div>
            )}
          </div>

          {/* Format Selector (E-Book vs Physical) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Choose Your Preferred Edition:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* E-Book Option */}
              {(book.formatType === 'ebook' || book.formatType === 'both') && (
                <button
                  type="button"
                  onClick={() => setSelectedFormat('ebook')}
                  className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    selectedFormat === 'ebook'
                      ? 'border-[#0008c1] bg-blue-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="flex items-center space-x-2 text-xs font-bold text-gray-900">
                      <Download size={16} className={selectedFormat === 'ebook' ? 'text-[#0008c1]' : 'text-gray-500'} />
                      <span>Instant Digital E-Book</span>
                    </span>
                    {selectedFormat === 'ebook' && (
                      <CheckCircle2 size={16} className="text-[#0008c1]" />
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">
                    PDF &amp; EPUB format • Instant access
                  </div>
                  <div className="text-base font-extrabold text-[#0008c1]">
                    ₹{book.ebookPrice || book.price}
                  </div>
                </button>
              )}

              {/* Physical Book Option */}
              {(book.formatType === 'physical' || book.formatType === 'both') && (
                <button
                  type="button"
                  onClick={() => setSelectedFormat('physical')}
                  className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    selectedFormat === 'physical'
                      ? 'border-[#0008c1] bg-blue-50/40 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="flex items-center space-x-2 text-xs font-bold text-gray-900">
                      <BookOpen size={16} className={selectedFormat === 'physical' ? 'text-[#0008c1]' : 'text-gray-500'} />
                      <span>Printed Physical Book</span>
                    </span>
                    {selectedFormat === 'physical' && (
                      <CheckCircle2 size={16} className="text-[#0008c1]" />
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">
                    Gold-foil cover • Shipped to home
                  </div>
                  <div className="text-base font-extrabold text-[#0008c1]">
                    ₹{book.physicalPrice || (book.price + 200)}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-3 pt-2">
            <span className="text-3xl font-extrabold text-[#0008c1]">
              ₹{currentPrice}.00
            </span>
            {book.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{book.originalPrice}.00
              </span>
            )}
            {book.discountPercent && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded">
                Save {book.discountPercent}%
              </span>
            )}
          </div>

          {/* Delivery Note */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center space-x-2">
            {selectedFormat === 'ebook' ? (
              <>
                <Download size={16} className="text-[#0008c1] flex-shrink-0" />
                <span>
                  <strong>Instant Download:</strong> Download links provided on order confirmation screen and sent directly to your email.
                </span>
              </>
            ) : (
              <>
                <Package size={16} className="text-[#0008c1] flex-shrink-0" />
                <span>
                  <strong>Courier Dispatch:</strong> Carefully packed and dispatched within 24-48 hours. Tracking provided via SMS.
                </span>
              </>
            )}
          </div>

          {/* Add to Cart & Buy Controls */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-sm font-semibold py-3.5 px-6 rounded-full transition shadow-md"
              >
                <ShoppingCart size={18} />
                <span>
                  Add {selectedFormat === 'ebook' ? 'E-Book' : 'Book'} to Cart
                </span>
              </button>
            </div>

            {/* Direct WhatsApp Order */}
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent(
                `Namaste! I would like to order "${book.name}" in ${
                  selectedFormat === 'ebook' ? 'Digital E-Book' : 'Printed Book'
                } format (₹${currentPrice * quantity}). Please guide me with payment.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold py-3 rounded-full transition shadow-md"
            >
              <span>⚡ Order via WhatsApp</span>
            </a>
          </div>

          {/* Navigation Tabs (Overview / Chapters / Specs) */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex border-b border-gray-200 space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-[#0008c1] text-[#0008c1]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Overview &amp; Features
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`pb-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === 'chapters'
                    ? 'border-[#0008c1] text-[#0008c1]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Table of Contents ({book.tableOfContents.length})
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === 'specs'
                    ? 'border-[#0008c1] text-[#0008c1]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Book Specifications
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {book.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Key Highlights &amp; Inclusions:
                    </h4>
                    <ul className="space-y-2">
                      {book.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
                          <CheckCircle2 size={16} className="text-[#0008c1] flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'chapters' && (
                <div className="space-y-3">
                  {book.tableOfContents.map((chap) => (
                    <div
                      key={chap.number}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start space-x-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0008c1] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {chap.number}
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                          {chap.title}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {chap.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                    <tbody className="divide-y divide-gray-100">
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2.5 font-semibold text-gray-600 w-1/3">Author</td>
                        <td className="px-4 py-2.5 text-gray-900">{book.author}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-gray-600">Language</td>
                        <td className="px-4 py-2.5 text-gray-900">{book.language}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2.5 font-semibold text-gray-600">Print Length</td>
                        <td className="px-4 py-2.5 text-gray-900">{book.pages} Pages</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-gray-600">Publication Year</td>
                        <td className="px-4 py-2.5 text-gray-900">{book.publishedYear}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2.5 font-semibold text-gray-600">Digital Format</td>
                        <td className="px-4 py-2.5 text-gray-900">{book.downloadFormat || 'PDF'}</td>
                      </tr>
                      {book.isbn && (
                        <tr>
                          <td className="px-4 py-2.5 font-semibold text-gray-600">ISBN</td>
                          <td className="px-4 py-2.5 text-gray-900">{book.isbn}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Free Sample Excerpt Reader Modal */}
      {isSampleOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-14 rounded overflow-hidden shadow-sm flex-shrink-0">
                  <Image src={book.image} alt={book.name} fill className="object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                    Free Sample Chapter
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                    {book.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setIsSampleOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 font-serif text-gray-800 text-sm sm:text-base leading-relaxed bg-amber-50/20">
              <div className="text-center pb-4 border-b border-amber-200/50">
                <h3 className="text-lg sm:text-xl font-bold text-[#0008c1]">
                  {book.sampleExcerpt.chapterTitle}
                </h3>
                {book.sampleExcerpt.subheading && (
                  <p className="text-xs sm:text-sm text-gray-500 font-sans italic mt-1">
                    {book.sampleExcerpt.subheading}
                  </p>
                )}
              </div>

              {book.sampleExcerpt.paragraphs.map((para, idx) => (
                <p key={idx} className="indent-4">
                  {para}
                </p>
              ))}

              <div className="pt-6 border-t border-amber-200/50 text-center font-sans">
                <p className="text-xs text-gray-500 italic mb-3">
                  Enjoyed this excerpt? Read the complete {book.pages}-page wisdom guide today.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600">
                Available in: <strong>{selectedFormat === 'ebook' ? 'Digital E-Book (₹' + currentPrice + ')' : 'Printed Edition (₹' + currentPrice + ')'}</strong>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsSampleOpen(false)}
                  className="w-1/2 sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    setIsSampleOpen(false);
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
