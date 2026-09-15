"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, User, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal, totalCount } = useCart();
  const { user, isLoggedIn, openAuthModal } = useAuth();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="text-[#0008c1]" size={20} />
              <h2 className="text-base font-bold text-gray-900">Your Cart ({totalCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Login bar for Cart */}
          {!isLoggedIn ? (
            <div className="bg-amber-50/90 border-b border-amber-200/70 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-amber-950 truncate">
                <User size={14} className="text-amber-700 flex-shrink-0" />
                <span className="truncate text-[11px] font-medium">Log in to use saved addresses</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  openAuthModal();
                }}
                className="bg-[#0008c1] hover:bg-[#0a187a] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition ml-2 flex-shrink-0 cursor-pointer shadow-sm"
              >
                Log In
              </button>
            </div>
          ) : (
            <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 flex items-center space-x-2 text-[11px] text-[#0008c1]">
              <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="truncate font-medium">Logged in: +91 {user?.phone} (Saved addresses active)</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm mb-4">Your cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-[#1346af] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#3a3a3a] transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex space-x-4 items-center">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs font-bold text-[#0008c1] mt-1">
                      ₹{product.price.toLocaleString('en-IN')}.00
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">
                      ₹{(product.price * quantity).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                <span>Subtotal:</span>
                <span className="text-lg font-bold text-[#0008c1]">
                  ₹{subtotal.toLocaleString('en-IN')}.00
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Shipping and taxes calculated at checkout.</p>
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs font-semibold py-3 rounded-full shadow transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center text-xs font-medium text-gray-600 hover:text-[#0008c1] py-1.5 transition"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
