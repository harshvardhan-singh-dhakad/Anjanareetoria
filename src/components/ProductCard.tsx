"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isHovered && product.hoverImage ? product.hoverImage : product.image;

  return (
    <div
      className="bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-[#f8f9fa] overflow-hidden">
        {/* Discount Badge */}
        {product.discountPercent && (
          <span className="absolute top-3 left-3 bg-[#1346af] text-white text-[11px] font-bold px-2.5 py-1 rounded-sm z-10">
            -{product.discountPercent}%
          </span>
        )}

        {/* Out of stock Badge */}
        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-gray-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-sm z-10">
            Out Of Stock
          </span>
        )}

        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 text-center items-center justify-between">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-medium text-[#0008c1] hover:text-[#1346af] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          {product.rating && (
            <div className="flex items-center justify-center space-x-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < Math.floor(product.rating!) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
              <span className="text-[11px] text-gray-500 ml-1 font-medium">
                ({product.rating.toFixed(2)})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-center justify-center space-x-2">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}.00
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-[#0008c1]">
              ₹{product.price.toLocaleString('en-IN')}.00
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 w-full">
          {product.inStock ? (
            <button
              onClick={() => addToCart(product)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all duration-200 shadow-sm"
            >
              <ShoppingCart size={14} />
              <span>Add to cart</span>
            </button>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all duration-200"
            >
              <span>Read more</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
