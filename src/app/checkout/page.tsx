"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in your Name, Phone Number, and Delivery Address.");
      return;
    }

    const orderLines = items
      .map((item, idx) => `${idx + 1}. ${item.product.name} x ${item.quantity} = ₹${item.product.price * item.quantity}`)
      .join('%0A');

    const message = `*NEW ORDER - AR BLESSINGS*%0A%0A*Customer Details:*%0AName: ${formData.name}%0APhone: ${formData.phone}%0AEmail: ${formData.email}%0AAddress: ${formData.address}, ${formData.city} - ${formData.pincode}%0A%0A*Items Ordered:*%0A${orderLines}%0A%0A*Total Amount: ₹${subtotal.toLocaleString('en-IN')}.00*%0ANotes: ${formData.notes || 'None'}`;

    // Open WhatsApp with pre-filled order
    window.open(`https://wa.me/919999999999?text=${message}`, '_blank');
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif mb-3">
          Order Dispatched via WhatsApp!
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Thank you for choosing AR Blessings. Our team has received your order details and will confirm the dispatch and delivery timeline with you directly.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1346af] text-white text-xs font-semibold px-8 py-3 rounded-full hover:bg-[#3a3a3a] transition"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Items in Cart</h1>
        <Link
          href="/#products"
          className="inline-block bg-[#1346af] text-white text-xs font-semibold px-8 py-3 rounded-full hover:bg-[#3a3a3a] transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif mb-8">
        Checkout & Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer Details Form */}
        <form onSubmit={handleWhatsAppOrder} className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Shipping & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="House/Flat number, Street, Area, Landmark"
              value={formData.address}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City / Town *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                value={formData.city}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code *</label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Order Notes (Optional)</label>
            <input
              type="text"
              name="notes"
              placeholder="Any special blessing or delivery instructions"
              value={formData.notes}
              onChange={handleChange}
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-6 rounded-full transition shadow-lg text-sm"
          >
            <MessageCircle size={18} />
            <span>Place Order on WhatsApp (₹{subtotal.toLocaleString('en-IN')})</span>
          </button>
        </form>

        {/* Summary sidebar */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
            Your Items ({items.length})
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="relative w-10 h-10 rounded bg-white overflow-hidden border border-gray-200 flex-shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <span className="text-gray-800 font-medium">{product.name} x {quantity}</span>
                </div>
                <span className="font-bold text-gray-900">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#0008c1] pt-1">
              <span>Total:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-lg text-[11px] text-blue-900 flex items-center space-x-2">
            <ShieldCheck size={20} className="text-[#0008c1] flex-shrink-0" />
            <span>Orders are verified and consecrated before immediate dispatch.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
