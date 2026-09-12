"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { Product } from '@/data/products';
import { ExtendedBook, Webinar } from '@/lib/db/cmsStore';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
  relatedBooks?: ExtendedBook[];
  relatedWebinars?: Webinar[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts = [],
  relatedBooks = [],
  relatedWebinars = [],
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);

  const images = [product.image];
  if (product.hoverImage) images.push(product.hoverImage);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center space-x-2">
        <Link href="/" className="hover:text-[#0008c1]">Home</Link>
        <span>/</span>
        <Link href="/#products" className="hover:text-[#0008c1]">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            {product.discountPercent && (
              <span className="absolute top-4 left-4 bg-[#1346af] text-white text-xs font-bold px-3 py-1 rounded-sm z-10">
                -{product.discountPercent}% OFF
              </span>
            )}
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex space-x-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    activeImage === img ? 'border-[#0008c1]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating!) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2 font-medium">
                  {product.rating.toFixed(2)} out of 5 ({product.reviewCount} customer reviews)
                </span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3">
            {product.originalPrice && (
              <span className="text-base text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}.00
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-bold text-[#0008c1]">
              ₹{product.price.toLocaleString('en-IN')}.00
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-gray-600 leading-relaxed border-t border-b border-gray-100 py-4">
            {product.shortDescription}
          </p>

          {/* Add to Cart Controls */}
          {product.inStock ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-sm font-semibold py-3 px-6 rounded-full transition shadow-md"
                >
                  <ShoppingCart size={18} />
                  <span>Add to cart</span>
                </button>
              </div>

              {/* Direct WhatsApp Order */}
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Hello! I want to order ${quantity}x ${product.name} (₹${product.price * quantity}). Please guide me.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold py-3 rounded-full transition shadow-md"
              >
                <span>⚡ Quick Order via WhatsApp</span>
              </a>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-semibold">
              ⚠️ Currently Out of Stock. Please check back later or message us to pre-order.
            </div>
          )}

          {/* Key Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <ShieldCheck size={20} className="mx-auto text-[#0008c1] mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 block">100% Authentic</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Truck size={20} className="mx-auto text-[#0008c1] mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 block">Fast Pan-India Delivery</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <RefreshCw size={20} className="mx-auto text-[#0008c1] mb-1" />
              <span className="text-[11px] font-semibold text-gray-700 block">Spiritual Consecration</span>
            </div>
          </div>

          {/* Extended Description & Features */}
          <div className="pt-4 space-y-3">
            <h3 className="text-base font-bold text-gray-900">Product Overview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600">
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Blessed Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0008c1] block mb-1">
                Sacred Synergies
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                Customers Also Paired With
              </h3>
            </div>
            <Link href="/#products" className="text-xs font-bold text-[#0008c1] hover:underline flex items-center space-x-1">
              <span>View All Products</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                    {p.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-serif line-clamp-1 group-hover:text-[#0008c1] transition">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-2 text-xs font-bold text-gray-900">
                  ₹{p.price.toLocaleString('en-IN')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Companion Sacred Literature (Books & E-Books) */}
      {relatedBooks.length > 0 && (
        <section className="mt-16 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-3xl p-6 sm:p-10 border border-amber-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                Sacred Literature
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                Companion Sacred Books &amp; E-Books
              </h3>
            </div>
            <Link href="/books" className="text-xs font-bold text-amber-900 hover:underline flex items-center space-x-1">
              <span>View Library</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 border border-amber-200/70 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900">
                    <Image src={b.image} alt={b.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-800 transition">
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

      {/* Upcoming Live Masterclasses Banner */}
      {relatedWebinars.length > 0 && (
        <section className="mt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Live Spiritual Sessions
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Upcoming Live Masterclasses
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
    </div>
  );
};
