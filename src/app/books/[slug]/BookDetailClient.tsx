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
  Sparkles,
  ArrowRight,
  CreditCard,
  Lock,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Book } from '@/data/books';
import { ExtendedBook, Webinar } from '@/lib/db/cmsStore';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { initiateRazorpayPayment } from '@/lib/payment/razorpayClient';

interface BookDetailClientProps {
  book: Book;
  relatedBooks?: ExtendedBook[];
  relatedProducts?: Product[];
  relatedWebinars?: Webinar[];
}

export const BookDetailClient: React.FC<BookDetailClientProps> = ({
  book,
  relatedBooks = [],
  relatedProducts = [],
  relatedWebinars = [],
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState<'ebook' | 'physical'>(
    book.formatType === 'physical' ? 'physical' : 'ebook'
  );
  const [quantity, setQuantity] = useState(1);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'specs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Instant Buy Modal State
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [ebookReadyUrl, setEbookReadyUrl] = useState<string | null>(null);

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

  const startRazorpayPayment = async (name: string, phone: string) => {
    setBuying(true);
    setBuyError(null);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    await initiateRazorpayPayment({
      type: 'book',
      itemId: book.id || book.slug,
      format: selectedFormat,
      quantity,
      customer: {
        name: name || user?.name || 'Devotee',
        phone: cleanPhone,
        email: user?.email || undefined,
      },
      onSuccess: (result) => {
        setBuying(false);
        setIsBuyModalOpen(false);
        if (selectedFormat === 'ebook') {
          setEbookReadyUrl(result.readerUrl || `/reader?phone=${cleanPhone}&orderId=${result.orderId}`);
        } else {
          router.push('/account');
        }
      },
      onError: (err) => {
        setBuying(false);
        setBuyError(err);
      },
      onDismiss: () => {
        setBuying(false);
      },
    });
  };

  const handleInstantBuyClick = () => {
    if (selectedFormat === 'physical') {
      handleAddToCart();
      router.push('/checkout');
      return;
    }

    if (user?.phone) {
      startRazorpayPayment(user.name || '', user.phone);
    } else {
      setIsBuyModalOpen(true);
    }
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

              {/* 1. Primary: Razorpay Instant Buy */}
              <button
                type="button"
                disabled={buying}
                onClick={handleInstantBuyClick}
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#05138c] hover:to-[#0008c1] disabled:opacity-50 text-white text-sm font-bold py-3.5 px-6 rounded-full transition shadow-lg cursor-pointer"
              >
                <CreditCard size={18} className="text-amber-300" />
                <span>
                  {buying ? 'Opening Razorpay...' : `Instant Buy (₹${currentPrice * quantity})`}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold py-3 px-4 rounded-full transition"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>

              {/* Direct WhatsApp Order */}
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Namaste! I would like to order "${book.name}" in ${
                    selectedFormat === 'ebook' ? 'Digital E-Book' : 'Printed Book'
                  } format (₹${currentPrice * quantity}). Please guide me with payment.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-semibold py-3 px-5 rounded-full transition shadow-sm"
              >
                <span>WhatsApp</span>
              </a>
            </div>
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

      {/* Other Sacred Books Section */}
      {relatedBooks.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0008c1] block mb-1">
                Sacred Literature
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                Other Books &amp; Workbooks You May Love
              </h3>
            </div>
            <Link href="/books" className="text-xs font-bold text-[#0008c1] hover:underline flex items-center space-x-1">
              <span>View All Books</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 border border-gray-200/80 hover:border-amber-400/80 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900">
                    <Image src={b.image} alt={b.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                    {b.badge && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                        {b.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-700 transition">
                      {b.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">By {b.author}</p>
                    <div className="mt-1.5 font-bold text-slate-900 text-xs">
                      ₹{b.ebookPrice || b.price}
                      <span className="text-[10px] font-normal text-emerald-700 ml-1">
                        (Instant E-Book PDF)
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/books/${b.slug}`}
                  className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl text-center transition shadow-sm"
                >
                  View Book Details
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consecrated Physical Essentials Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-3xl p-6 sm:p-10 border border-blue-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0008c1] block mb-1">
                Consecrated Conduits
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                Recommended Sacred Essentials
              </h3>
            </div>
            <Link href="/#products" className="text-xs font-bold text-[#0008c1] hover:underline flex items-center space-x-1">
              <span>View Store</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50">
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                      {p.category}
                    </span>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0008c1] transition">
                      {p.name}
                    </h4>
                    <div className="mt-1 font-bold text-slate-900 text-xs">
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/product/${p.slug}`}
                  className="mt-3 w-full py-2 bg-[#0008c1] hover:bg-[#0a187a] text-white font-bold text-xs rounded-xl text-center transition shadow-sm"
                >
                  View Product
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Live Masterclasses */}
      {relatedWebinars.length > 0 && (
        <section className="mt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Live Interactive Guidance
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Upcoming Live Spiritual Masterclasses
              </h3>
            </div>
            <Link href="/webinars" className="text-xs font-bold text-amber-300 hover:underline flex items-center space-x-1">
              <span>View All Masterclasses</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedWebinars.map((w) => (
              <Link
                key={w.id}
                href={`/webinars/${w.slug}`}
                className="bg-white/5 border border-white/10 hover:border-amber-400/50 p-5 rounded-2xl transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {w.dateTime}
                  </span>
                  <h4 className="font-serif font-bold text-white text-sm group-hover:text-amber-300 transition line-clamp-1">
                    {w.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">With {w.speaker?.name}</p>
                </div>
                <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* Guest Instant Buy Modal */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsBuyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#0008c1] mb-3">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Instant E-Book Access</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.name}</p>
              <div className="mt-2 text-2xl font-black text-[#0008c1]">₹{currentPrice * quantity}</div>
            </div>

            {buyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                {buyError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!buyerPhone || buyerPhone.replace(/\D/g, '').length < 10) {
                  setBuyError('Please enter a valid 10-digit mobile number.');
                  return;
                }
                startRazorpayPayment(buyerName, buyerPhone);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0008c1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  WhatsApp / Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 rounded-r-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0008c1]"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Your reading access link and watermarked PDF will be tied to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={buying}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#05138c] hover:to-[#0008c1] disabled:opacity-50 text-white font-bold text-sm shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Lock size={16} />
                <span>{buying ? 'Connecting to Razorpay...' : `Pay ₹${currentPrice * quantity} Now`}</span>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-400 pt-2">
                <span>🔒 256-bit Encrypted</span>
                <span>•</span>
                <span>Instant Online Access</span>
                <span>•</span>
                <span>Razorpay Verified</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E-Book Access Ready Modal */}
      {ebookReadyUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
            <p className="text-xs text-gray-500 mb-4">
              Your personalized consecrated copy of <strong>{book.name}</strong> is ready to read.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 text-left text-xs text-emerald-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-950">
                <Sparkles size={14} className="text-emerald-600" />
                <span>Watermarked &amp; Prepared for You</span>
              </div>
              <p>
                Access is active immediately on any device without downloads or expiration.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={ebookReadyUrl}
                className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-[#0008c1] hover:bg-[#05138c] text-white font-bold text-sm shadow-lg transition"
              >
                <BookOpen size={18} />
                <span>Open E-Book Reader Now</span>
                <ArrowRight size={16} />
              </a>

              <button
                onClick={() => setEbookReadyUrl(null)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-semibold transition"
              >
                Close and return to book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
