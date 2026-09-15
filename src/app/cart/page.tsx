"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, User, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { user, isLoggedIn, openAuthModal } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Currently Empty</h1>
        <p className="text-gray-500 text-sm mb-6">Explore our auspicious spiritual and luxury collection.</p>
        <Link
          href="/#products"
          className="inline-block bg-[#1346af] text-white text-xs font-semibold px-8 py-3 rounded-full hover:bg-[#3a3a3a] transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm divide-y divide-gray-100">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="py-4 flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-sm font-semibold text-gray-900 hover:text-[#0008c1] truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs font-bold text-[#0008c1] mt-1">
                  ₹{product.price.toLocaleString('en-IN')}.00
                </p>
                <div className="flex items-center space-x-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-400 hover:text-red-600 p-1 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>
          ))}
          <div className="pt-4 flex justify-between">
            <button
              onClick={clearCart}
              className="text-xs font-medium text-gray-500 hover:text-red-600 transition"
            >
              Clear Entire Cart
            </button>
            <Link
              href="/#products"
              className="text-xs font-semibold text-[#0008c1] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-fit space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600 font-semibold">FREE</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-[#0008c1]">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
          </div>

          {!isLoggedIn ? (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-amber-950 truncate">
                <User size={14} className="text-amber-700 flex-shrink-0" />
                <span className="text-[11px] truncate">Returning customer?</span>
              </div>
              <button
                type="button"
                onClick={openAuthModal}
                className="bg-[#0008c1] hover:bg-[#0a187a] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex items-center space-x-1.5 text-[#0008c1]">
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
              <span className="text-[11px] font-medium truncate">Logged in as +91 {user?.phone}</span>
            </div>
          )}

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-3.5 rounded-full transition shadow cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
