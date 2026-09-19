"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  Download,
  Package,
  HeartHandshake,
  Flame,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { initiateRazorpayPayment } from '@/lib/payment/razorpayClient';
import { trackLakshmiEvent } from '@/lib/tracking/events';
import { useAuth } from '@/context/AuthContext';
import type { LakshmiSpecialSectionConfig } from '@/lib/db/cmsStore';

export interface LakshmiJourneySectionProps {
  isLandingPage?: boolean;
  config?: LakshmiSpecialSectionConfig;
  pricing?: {
    digital: { price: number; originalPrice?: number };
    combo: { price: number; originalPrice?: number };
    physical: { price: number; originalPrice?: number };
  };
}

type SelectedTier = 'digital' | 'combo' | 'physical' | null;

export const LakshmiJourneySection: React.FC<LakshmiJourneySectionProps> = ({
  isLandingPage = false,
  config,
  pricing,
}) => {
  const digitalPrice = pricing?.digital.price ?? 500;
  const digitalOriginalPrice = pricing?.digital.originalPrice;
  const comboPrice = pricing?.combo.price ?? 1750;
  const comboOriginalPrice = pricing?.combo.originalPrice;
  const physicalPrice = pricing?.physical.price ?? 1250;
  const physicalOriginalPrice = pricing?.physical.originalPrice;
  const { user } = useAuth();
  const isEnabled = config?.enabled ?? true;

  const digitalImage = config?.digitalImage || '/images/books/lakshmi-75-days.jpg';
  const comboImage = config?.comboImage || '/images/books/lakshmi-combo.jpg';
  const physicalImage = config?.physicalImage || '/images/books/main-lakshmi-hoon.jpg';

  // Modal Checkout State
  const [activeTier, setActiveTier] = useState<SelectedTier>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrderInfo, setCreatedOrderInfo] = useState<{
    orderId: string;
    amountInInr: number;
    paymentLink?: string;
    qrCodeUrl?: string;
    itemTitle?: string;
  } | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    readerUrl?: string;
    downloadUrl?: string;
    tier: SelectedTier;
  } | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Track Page View on mount
  useEffect(() => {
    trackLakshmiEvent('Page View', { source: isLandingPage ? 'landing_page' : 'books_catalog' });
  }, [isLandingPage]);

  const handleOpenCheckout = (tier: SelectedTier) => {
    setActiveTier(tier);
    setErrorMsg(null);
    setSuccessOrder(null);
    setCreatedOrderInfo(null);

    if (tier === 'digital') {
      trackLakshmiEvent('Booklet Click', { tier: 'digital', price: digitalPrice });
    } else if (tier === 'combo') {
      trackLakshmiEvent('Combo Click', { tier: 'combo', price: comboPrice });
    } else if (tier === 'physical') {
      trackLakshmiEvent('Book Click', { tier: 'physical', price: physicalPrice });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }
    if (name === 'pincode') {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    setErrorMsg(null);

    // Common validations
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian Mobile Number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid Email Address for confirmation and digital access.');
      return;
    }

    // Physical shipping validation for Combo & Physical book
    const isPhysicalOrder = activeTier === 'combo' || activeTier === 'physical';
    if (isPhysicalOrder) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
        setErrorMsg('Please enter complete Delivery Address, City, and State.');
        return;
      }
      const cleanPincode = formData.pincode.replace(/\D/g, '');
      if (cleanPincode.length !== 6) {
        setErrorMsg('Please enter a valid 6-digit PIN code for courier delivery.');
        return;
      }
    }

    setLoading(true);

    const shippingString = isPhysicalOrder
      ? `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`
      : 'Digital Delivery via Email & Portal Reader';

    let itemId = 'bk-lakshmi-75';
    let format: 'ebook' | 'physical' = 'ebook';
    let amount = digitalPrice;
    let itemTitle = '75 Days to Welcome Maa Lakshmi (75-Day Digital Guide)';

    if (activeTier === 'combo') {
      itemId = 'prod-lakshmi-combo';
      format = 'physical';
      amount = comboPrice;
      itemTitle = 'The Complete Lakshmi Journey (Book + 75-Day Digital Guide Combo)';
    } else if (activeTier === 'physical') {
      itemId = 'bk-main-lakshmi-hoon';
      format = 'physical';
      amount = physicalPrice;
      itemTitle = 'Main Lakshmi Hoon (Physical Book Edition)';
    }

    trackLakshmiEvent('Payment Started', { tier: activeTier, amount, itemTitle });

    await initiateRazorpayPayment({
      type: 'book',
      itemId,
      format,
      quantity: 1,
      customer: {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
      },
      shippingAddress: shippingString,
      notes: `Lakshmi Journey Purchase [Tier: ${activeTier}]`,
      onOrderCreated: (info) => {
        setCreatedOrderInfo(info);
      },
      onSuccess: (result) => {
        setLoading(false);
        trackLakshmiEvent('Payment Successful', {
          tier: activeTier,
          amount,
          itemTitle,
          orderId: result.orderId,
          paymentId: result.paymentId,
        });
        setSuccessOrder({
          orderId: result.orderId,
          readerUrl: result.readerUrl || `/reader?phone=${cleanPhone}&orderId=${result.orderId}`,
          downloadUrl: result.downloadUrl,
          tier: activeTier,
        });
      },
      onError: (err) => {
        setLoading(false);
        setErrorMsg(err || 'Payment was unsuccessful or cancelled. Please try again.');
      },
      onDismiss: () => {
        setLoading(false);
      },
    });
  };

  if (!isEnabled) return null;

  return (
    <section id="lakshmi-journey" className="w-full py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden bg-[#fffdf9]">
      {/* Sacred Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 via-orange-50/20 to-transparent pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-300/40 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
            <Sparkles size={14} className="text-amber-600" />
            <span>Sacred Knowledge &amp; Daily Sadhana</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#78181a] font-serif tracking-tight">
            BEGIN YOUR LAKSHMI JOURNEY
          </h2>

          <p className="text-lg sm:text-xl font-medium text-amber-950/80">
            Understand Lakshmi. Prepare for Lakshmi.
          </p>

          <div className="pt-2 max-w-2xl mx-auto text-xs sm:text-sm text-gray-700 bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5 leading-relaxed">
            <p className="font-semibold text-[#8b1d20]">
              “Why wait for the date of Diwali? Begin your 75 days today.”
            </p>
            <p className="text-gray-600 mt-1">
              Start Day 1 whenever you are ready. After completing the 75-day journey of daily habits, discipline, food reverence, and inner sadhana, celebrate Day 75 as your <span className="font-bold text-[#8b1d20]">Personal Diwali</span>.
            </p>
          </div>
        </div>

        {/* 3 PRODUCT CARDS - Order: Digital (₹500) | ⭐ Combo (₹1,750 Recommended) | Physical Book (₹1,250) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* CARD 1 — DIGITAL GUIDE (₹500) */}
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
            <div className="p-6 sm:p-7 flex flex-col flex-1">
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Download size={12} className="text-amber-700" />
                  <span>DIGITAL GUIDE</span>
                </span>
                <span className="text-xs font-semibold text-gray-500">Low-Friction Entry</span>
              </div>

              {/* Product Visual */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-amber-50/50 mb-5 border border-amber-100">
                <Image
                  src={digitalImage}
                  alt="75 Days to Welcome Maa Lakshmi - Digital Guide"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Content */}
              <div className="space-y-2.5 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-snug">
                  75 Days to Welcome Maa Lakshmi
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  75-Day Digital Preparation Guide
                </p>

                {/* Price Display */}
                <div className="pt-2 pb-1 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-[#8b1d20]">₹{digitalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500 line-through">₹{digitalOriginalPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{digitalOriginalPrice && digitalOriginalPrice > digitalPrice ? Math.round(((digitalOriginalPrice - digitalPrice) / digitalOriginalPrice) * 100) : 0}% OFF</span>
                </div>

                {/* Short Copy */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                  “Start whenever you are ready. Your Day 1 begins today, and after completing the 75-day journey, celebrate Day 75 as your Personal Diwali.”
                </p>

                {/* Small Highlight Tag */}
                <div className="py-2">
                  <p className="text-[11px] font-bold text-amber-900 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/50 inline-block">
                    ✨ 75 Days • Daily Practices • Digital Access
                  </p>
                </div>

                {/* Practices Checklist */}
                <ul className="space-y-1.5 text-xs text-gray-700 pt-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Daily Sankalp &amp; 1 Mala prayer practice</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Evening diya, rangoli &amp; Vishnu/Annapurna bhajan</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Home cleaning, decluttering &amp; food reverence</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Weekly daan &amp; completing pending responsibilities</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => handleOpenCheckout('digital')}
                className="w-full bg-[#8b1d20] hover:bg-[#701618] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>START MY 75 DAYS — ₹{digitalPrice.toLocaleString('en-IN')}</span>
                <ArrowRight size={16} />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-2">
                Instant confirmation &amp; digital guide access sent to your email
              </p>
            </div>
          </div>

          {/* CARD 2 — RECOMMENDED COMBO (CENTER, ELEVATED) */}
          <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50/40 rounded-3xl border-2 border-amber-500 shadow-xl lg:-translate-y-3 relative flex flex-col justify-between overflow-hidden group">
            {/* Crown Ribbon */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white text-center py-2 px-4 text-xs font-black tracking-widest uppercase shadow-sm flex items-center justify-center space-x-1.5">
              <Sparkles size={14} className="text-amber-200 fill-amber-200" />
              <span>RECOMMENDED — THE COMPLETE LAKSHMI JOURNEY</span>
              <Sparkles size={14} className="text-amber-200 fill-amber-200" />
            </div>

            <div className="p-6 sm:p-7 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                  <span>MOST POPULAR CHOICE</span>
                </span>
                <span className="text-xs font-bold text-amber-900">Dual Fulfillment</span>
              </div>

              {/* Product Visual */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-100/40 to-white mb-5 border border-amber-200">
                <Image
                  src={comboImage}
                  alt="The Complete Lakshmi Journey Combo - Book + 75-Day Digital Guide"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="space-y-2.5 flex-1">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-[#78181a] leading-snug">
                  THE COMPLETE LAKSHMI JOURNEY
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Understand Her + Prepare to Welcome Her
                </p>

                {/* Price Display */}
                <div className="pt-2 pb-1 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-[#8b1d20]">₹{comboPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500 line-through">₹{comboOriginalPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Save ₹{comboOriginalPrice && comboOriginalPrice > comboPrice ? (comboOriginalPrice - comboPrice).toLocaleString('en-IN') : 0}</span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium">
                  Includes ₹150 physical-book delivery charge across India
                </p>

                {/* Main Positioning */}
                <div className="bg-amber-100/70 border border-amber-300/80 rounded-xl p-3 text-xs text-amber-950 space-y-1">
                  <p className="font-bold">First understand Lakshmi.</p>
                  <p className="font-bold">Then begin your 75-day preparation.</p>
                </div>

                {/* What's Inside */}
                <div className="pt-1 space-y-2 text-xs text-gray-800">
                  <div className="flex items-start space-x-2 bg-white/90 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-base">📖</span>
                    <div>
                      <p className="font-bold text-gray-900">Main Lakshmi Hoon — Physical Book</p>
                      <p className="text-[11px] text-gray-600">Consecrated printed edition delivered to your doorstep</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 bg-white/90 p-2 rounded-lg border border-amber-200/60">
                    <span className="text-base">🪔</span>
                    <div>
                      <p className="font-bold text-gray-900">75-Day Lakshmi Digital Guide</p>
                      <p className="text-[11px] text-gray-600">Daily sadhana, habits &amp; practices via email &amp; portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => handleOpenCheckout('combo')}
                className="w-full bg-gradient-to-r from-[#8b1d20] via-[#a32226] to-[#8b1d20] hover:from-[#701618] hover:to-[#701618] text-white font-extrabold py-4 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer border border-amber-400/40"
              >
                <span>GET BOTH — ₹{comboPrice.toLocaleString('en-IN')}</span>
                <ArrowRight size={16} className="text-amber-300" />
              </button>
              <p className="text-[10px] text-center text-amber-900 font-medium mt-2">
                Triggers 2 fulfillments: Digital Guide access + Doorstep physical book dispatch
              </p>
            </div>
          </div>

          {/* CARD 3 — PHYSICAL BOOK (₹1,250) */}
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
            <div className="p-6 sm:p-7 flex flex-col flex-1">
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  <Package size={12} className="text-rose-600" />
                  <span>PHYSICAL BOOK</span>
                </span>
                <span className="text-xs font-semibold text-gray-500">Printed Edition</span>
              </div>

              {/* Product Visual */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-rose-50/40 mb-5 border border-rose-100">
                <Image
                  src={physicalImage}
                  alt="Main Lakshmi Hoon by Anjanaa Reetoria - Hardcover Book"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="space-y-2.5 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-snug">
                  MAIN LAKSHMI HOON
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                  Understand Maa Lakshmi
                </p>

                {/* Price Breakdown */}
                <div className="pt-2 pb-1 space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-[#8b1d20]">₹{physicalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-500 line-through">₹{physicalOriginalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 inline-block">
                    ₹1,100 Direct Price + ₹150 Delivery = <span className="font-bold text-gray-800">Total ₹{physicalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Short Copy */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  “A book by Anjanaa Reetoria for readers who want to understand Maa Lakshmi and the philosophy and perspective she shares through her work.”
                </p>

                {/* Features */}
                <ul className="space-y-1.5 text-xs text-gray-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Authentic philosophy &amp; spiritual perspective</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Authored by spiritual guide Anjanaa Reetoria</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Hardcover consecrated printed keepsake edition</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <span>Pan-India insured door courier delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => handleOpenCheckout('physical')}
                className="w-full bg-[#8b1d20] hover:bg-[#701618] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>ORDER THE BOOK — ₹{physicalPrice.toLocaleString('en-IN')}</span>
                <ArrowRight size={16} />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-2">
                Dispatched with tracking within 24-48 business hours
              </p>
            </div>
          </div>

        </div>

        {/* Ethical Non-Guarantee Advisory */}
        <div className="mt-12 text-center max-w-2xl mx-auto border-t border-amber-200/50 pt-6 text-[11px] text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">
            🙏 AR Blessings Spiritual Practice Notice
          </p>
          <p>
            This 75-day journey is a guided spiritual and personal discipline practice to align thoughts, habits, food respect, and reverence. We make no claims of guaranteed wealth or instant financial outcomes. Begin with faith, pure intent, and conscious action.
          </p>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {activeTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!loading) {
                  setActiveTier(null);
                  setErrorMsg(null);
                  setSuccessOrder(null);
                }
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>

            {successOrder ? (
              /* Success Confirmation View */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-gray-900 font-serif">
                    Blessings &amp; Congratulations!
                  </h3>
                  <p className="text-xs text-gray-600">
                    Your sacred order has been confirmed successfully.
                  </p>
                  <p className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-md inline-block mt-2">
                    Order ID: {successOrder.orderId}
                  </p>
                </div>

                {successOrder.tier === 'digital' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
                    <p className="text-xs font-bold text-[#8b1d20] flex items-center space-x-1.5">
                      <Download size={14} />
                      <span>Your 75-Day Digital Guide is Ready</span>
                    </p>
                    <p className="text-xs text-gray-700">
                      A copy has been dispatched to your email <span className="font-semibold">{formData.email}</span>. You can also read it instantly in our reader.
                    </p>
                    {successOrder.readerUrl && (
                      <Link
                        href={successOrder.readerUrl}
                        className="inline-flex items-center space-x-1.5 bg-[#8b1d20] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#701618] transition mt-1"
                      >
                        <BookOpen size={14} />
                        <span>Open Protected E-Book Reader →</span>
                      </Link>
                    )}
                  </div>
                )}

                {successOrder.tier === 'combo' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2.5">
                    <div className="text-xs font-bold text-[#8b1d20]">Dual Fulfillment Active:</div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <p>✨ <strong>Digital Guide:</strong> Sent to {formData.email}.</p>
                      <p>📦 <strong>Physical Book:</strong> Dispatched to {formData.city} via courier.</p>
                    </div>
                    {successOrder.readerUrl && (
                      <Link
                        href={successOrder.readerUrl}
                        className="inline-flex items-center space-x-1.5 bg-[#8b1d20] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#701618] transition mt-1"
                      >
                        <BookOpen size={14} />
                        <span>Start Reading Digital Guide Now →</span>
                      </Link>
                    )}
                  </div>
                )}

                {successOrder.tier === 'physical' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left space-y-1.5">
                    <p className="text-xs font-bold text-rose-900">📦 Courier Dispatch Initiated</p>
                    <p className="text-xs text-gray-700">
                      Your hardcover copy of <em>Main Lakshmi Hoon</em> will be safely packed and shipped to {formData.city}. Tracking details will be shared on {formData.phone}.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setActiveTier(null);
                    setSuccessOrder(null);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Order Form View */
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                    {activeTier === 'digital' ? 'Digital Guide Checkout' : activeTier === 'combo' ? 'Complete Combo Checkout' : 'Physical Book Checkout'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">
                    {activeTier === 'digital' && '75 Days to Welcome Maa Lakshmi'}
                    {activeTier === 'combo' && 'The Complete Lakshmi Journey'}
                    {activeTier === 'physical' && 'Main Lakshmi Hoon Book'}
                  </h3>
                  <div className="text-sm font-extrabold text-[#8b1d20] mt-0.5">
                    Total: ₹{activeTier === 'digital' ? digitalPrice.toLocaleString('en-IN') : activeTier === 'combo' ? comboPrice.toLocaleString('en-IN') : physicalPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20] focus:ring-1 focus:ring-[#8b1d20]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Number (+91) <span className="text-red-500">* (10 digits)</span>
                    </label>
                    <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:border-[#8b1d20] focus-within:ring-1 focus-within:ring-[#8b1d20]">
                      <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-xs font-medium border-r border-gray-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-xs text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">* (for access &amp; receipt)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20] focus:ring-1 focus:ring-[#8b1d20]"
                    />
                  </div>

                  {/* Physical Delivery Fields (Only for Combo & Physical) */}
                  {(activeTier === 'combo' || activeTier === 'physical') && (
                    <div className="pt-2 border-t border-gray-100 space-y-2.5">
                      <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1">
                        <Package size={12} className="text-amber-700" />
                        <span>Doorstep Delivery Address</span>
                      </p>

                      <div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleFormChange}
                          placeholder="Flat / House No., Building, Street Name *"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleFormChange}
                          placeholder="City *"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20]"
                        />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleFormChange}
                          placeholder="State *"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20]"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          name="pincode"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleFormChange}
                          placeholder="6-digit PIN Code *"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#8b1d20]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    disabled={loading}
                    onClick={handlePayment}
                    className="w-full bg-[#8b1d20] hover:bg-[#701618] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Pay ₹{activeTier === 'digital' ? digitalPrice.toLocaleString('en-IN') : activeTier === 'combo' ? comboPrice.toLocaleString('en-IN') : physicalPrice.toLocaleString('en-IN')}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400 pt-2.5">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>256-bit SSL Secure</span>
                    </span>
                    <span>•</span>
                    <span>UPI, Cards &amp; NetBanking</span>
                  </div>

                  {createdOrderInfo && createdOrderInfo.paymentLink && (
                    <div className="mt-4 p-4 bg-gradient-to-b from-amber-50 to-orange-50/50 border border-amber-300/80 rounded-2xl text-center space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#8b1d20] uppercase tracking-wider">
                        <span>Instant UPI Pay QR</span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App:
                      </p>
                      {createdOrderInfo.qrCodeUrl && (
                        <div className="flex justify-center my-1">
                          <img
                            src={createdOrderInfo.qrCodeUrl}
                            alt="Razorpay Pay QR"
                            className="w-40 h-40 rounded-xl border border-amber-300 shadow-md bg-white p-1.5"
                          />
                        </div>
                      )}
                      <div>
                        <a
                          href={createdOrderInfo.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 bg-white hover:bg-gray-50 border border-amber-300 text-[#8b1d20] font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition"
                        >
                          <span>Open Direct Razorpay Payment Link ↗</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
