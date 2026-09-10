"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

export const ProductDetailClient: React.FC<{ product: Product }> = ({ product }) => {
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
    </div>
  );
};
