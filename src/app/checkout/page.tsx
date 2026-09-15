"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  MessageCircle,
  CheckCircle,
  CreditCard,
  Lock,
  Sparkles,
  MapPin,
  AlertCircle,
  BookOpen,
  ArrowRight,
  User as UserIcon,
  Loader2,
  X,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Download
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { initiateRazorpayPayment } from '@/lib/payment/razorpayClient';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoggedIn, openAuthModal, setUser, refreshUser } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  // Determine cart digital characteristics
  const isPureDigital =
    items.length > 0 &&
    items.every(
      (it) =>
        it.product.id.includes('ebook') ||
        it.product.name.toLowerCase().includes('e-book') ||
        it.product.name.toLowerCase().includes('digital') ||
        (it.product as any).formatType === 'ebook'
    );

  const hasEbook = items.some(
    (it) =>
      it.product.id.includes('ebook') ||
      it.product.name.toLowerCase().includes('e-book') ||
      it.product.name.toLowerCase().includes('digital') ||
      (it.product as any).formatType === 'ebook'
  );

  const hasPhysical = items.some(
    (it) =>
      !it.product.id.includes('ebook') &&
      !it.product.name.toLowerCase().includes('e-book') &&
      !it.product.name.toLowerCase().includes('digital') &&
      (it.product as any).formatType !== 'ebook'
  );

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    paymentId: string;
    readerUrl?: string;
    downloadUrl?: string;
    hasEbook?: boolean;
    totalAmount: number;
    phone: string;
  } | null>(null);

  // OTP verification states for guest customers
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [pendingAction, setPendingAction] = useState<'razorpay' | 'whatsapp'>('razorpay');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpModalOpen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpModalOpen, otpTimer]);

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));

      fetch('/api/user/addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(def.id);
            setFormData((prev) => ({
              ...prev,
              name: def.fullName || prev.name,
              phone: def.phone || prev.phone,
              address: def.streetAddress + (def.landmark ? ', ' + def.landmark : ''),
              city: def.city,
              state: def.state,
              pincode: def.pincode,
            }));
          }
        })
        .catch((err) => console.warn('Error loading addresses:', err));
    }
  }, [isLoggedIn, user]);

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'custom') {
      setFormData((prev) => ({
        ...prev,
        address: '',
        city: '',
        state: '',
        pincode: '',
      }));
    } else {
      const addr = savedAddresses.find((a) => a.id === addrId);
      if (addr) {
        setFormData((prev) => ({
          ...prev,
          name: addr.fullName || prev.name,
          phone: addr.phone || prev.phone,
          address: addr.streetAddress + (addr.landmark ? ', ' + addr.landmark : ''),
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateDetails = (): boolean => {
    setErrorMessage(null);
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Mobile Number.');
      return false;
    }
    // Only require physical delivery address if the cart has physical items
    if (!isPureDigital) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
        setErrorMessage('Please complete your Delivery Address, City, and PIN code.');
        return false;
      }
    }
    return true;
  };

  const executeRazorpayPayment = async () => {
    setPaymentLoading(true);
    setErrorMessage(null);

    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    const fullShipping = isPureDigital
      ? 'Digital Delivery (Instant E-Book Access)'
      : `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`;

    const orderItems = items.map((it) => ({
      productId: it.product.id,
      name: it.product.name,
      price: it.product.price,
      quantity: it.quantity,
    }));

    await initiateRazorpayPayment({
      type: hasEbook && items.length === 1 ? 'book' : 'product',
      format: hasEbook ? 'ebook' : undefined,
      itemId: hasEbook && items.length === 1 ? items[0].product.id.replace(/-ebook$/, '') : undefined,
      items: orderItems,
      customer: {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
      },
      shippingAddress: fullShipping,
      notes: formData.notes.trim() || undefined,
      onSuccess: (result) => {
        setPaymentLoading(false);
        setConfirmedOrder({
          orderId: result.orderId,
          paymentId: result.paymentId,
          readerUrl: result.readerUrl,
          downloadUrl: result.downloadUrl || (hasEbook ? `/api/ebook/download?orderId=${result.orderId}&phone=${cleanPhone}` : undefined),
          hasEbook: hasEbook || Boolean(result.readerUrl),
          totalAmount: subtotal,
          phone: cleanPhone,
        });
        clearCart();
      },
      onError: (err) => {
        setPaymentLoading(false);
        setErrorMessage(err);
      },
      onDismiss: () => {
        setPaymentLoading(false);
      },
    });
  };

  const executeWhatsAppOrder = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    const orderLines = items
      .map((item, idx) => `${idx + 1}. ${item.product.name} x ${item.quantity} = ₹${item.product.price * item.quantity}`)
      .join('%0A');

    const message = `*NEW ORDER - AR BLESSINGS*%0A%0A*Customer Details:*%0AName: ${formData.name}%0APhone: ${cleanPhone}%0AEmail: ${formData.email || 'None'}%0AAddress: ${formData.address}, ${formData.city} - ${formData.pincode}%0A%0A*Items Ordered:*%0A${orderLines}%0A%0A*Total Amount: ₹${subtotal.toLocaleString('en-IN')}.00*%0ANotes: ${formData.notes || 'None'}`;

    window.open(`https://wa.me/919999999999?text=${message}`, '_blank');
    clearCart();
  };

  const saveCustomAddressIfLoggedIn = async () => {
    if (isPureDigital) return;
    if (isLoggedIn && user && selectedAddressId === 'custom') {
      try {
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.name.trim(),
            phone: cleanPhone,
            streetAddress: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            isDefault: savedAddresses.length === 0,
          }),
        });
      } catch (err) {
        console.warn('Silent address save notice:', err);
      }
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!validateDetails()) return;

    if (!isLoggedIn) {
      setPaymentLoading(true);
      setErrorMessage(null);
      try {
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send verification OTP.');
        }
        setDevOtpPreview(data.devOtp || null);
        setOtpTimer(60);
        setOtpError(null);
        setPendingAction('razorpay');
        setOtpModalOpen(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error sending OTP to your mobile.');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    await saveCustomAddressIfLoggedIn();
    await executeRazorpayPayment();
  };

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    if (!isLoggedIn) {
      setPaymentLoading(true);
      setErrorMessage(null);
      try {
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send verification OTP.');
        }
        setDevOtpPreview(data.devOtp || null);
        setOtpTimer(60);
        setOtpError(null);
        setPendingAction('whatsapp');
        setOtpModalOpen(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error sending OTP to your mobile.');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    await saveCustomAddressIfLoggedIn();
    executeWhatsAppOrder();
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpSubmitting(true);
    setOtpError(null);
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP.');
      setDevOtpPreview(data.devOtp || null);
      setOtpTimer(60);
    } catch (err: any) {
      setOtpError(err.message || 'Could not resend OTP.');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) {
      setOtpError('Please enter the verification code.');
      return;
    }

    setOtpSubmitting(true);
    setOtpError(null);

    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: otpCode.trim(),
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code. Please try again.');
      }

      if (data.user) {
        setUser(data.user);
      }
      await refreshUser();

      // Auto-save physical address if provided and not pure digital
      if (!isPureDigital && formData.address.trim()) {
        try {
          const addrRes = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: formData.name.trim(),
              phone: cleanPhone,
              streetAddress: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: formData.pincode.trim(),
              isDefault: true,
            }),
          });
          const addrData = await addrRes.json();
          if (addrData.success && addrData.address) {
            setSavedAddresses([addrData.address]);
            setSelectedAddressId(addrData.address.id);
          }
        } catch (saveErr) {
          console.warn('Address auto-save warning:', saveErr);
        }
      }

      setOtpModalOpen(false);
      setOtpCode('');

      if (pendingAction === 'whatsapp') {
        executeWhatsAppOrder();
      } else {
        await executeRazorpayPayment();
      }
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setOtpSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-50 space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
            <CheckCircle size={44} />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-amber-600 font-bold flex items-center justify-center space-x-1">
              <Sparkles size={14} />
              <span>Sacred Order Confirmed</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
              Blessings on Your Journey!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Your transaction has been securely processed via Razorpay. Your order is registered in our sacred records.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50/80 to-amber-50/80 rounded-2xl p-5 border border-blue-100/80 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-mono font-bold text-[#0008c1] text-base">{confirmedOrder.orderId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
              <span className="text-gray-600">Razorpay Payment ID:</span>
              <span className="font-mono text-gray-800 text-xs">{confirmedOrder.paymentId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
              <span className="text-gray-600">Registered WhatsApp Phone:</span>
              <span className="font-semibold text-gray-900">+91 {confirmedOrder.phone}</span>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span className="text-gray-800">Total Amount Paid:</span>
              <span className="text-emerald-700 text-base">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}.00</span>
            </div>
          </div>

          {(confirmedOrder.readerUrl || confirmedOrder.hasEbook) && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-blue-50 rounded-2xl border border-amber-200 text-left space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                <BookOpen size={20} className="text-[#0008c1]" />
                <span>Instant E-Book Access Ready! (डिजिटल ई-बुक तैयार है)</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Your personalized, watermarked digital copy has been licensed to <strong>+91 {confirmedOrder.phone}</strong>.
                You can read it online immediately or download the protected PDF file for offline reading on any device.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {confirmedOrder.readerUrl && (
                  <Link
                    href={confirmedOrder.readerUrl}
                    className="inline-flex items-center space-x-2 bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
                  >
                    <BookOpen size={15} />
                    <span>Read Online Now (ऑनलाइन पढ़ें)</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                {confirmedOrder.downloadUrl && (
                  <a
                    href={confirmedOrder.downloadUrl}
                    className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
                  >
                    <Download size={15} />
                    <span>Download Protected PDF (डाउनलोड करें)</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-amber-800 flex items-center space-x-1.5 pt-1">
                <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                <span>Watermarked with your mobile number (+91 {confirmedOrder.phone}) to prevent piracy and ensure authentic blessings.</span>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-100">
            <Link
              href="/account"
              className="bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-md"
            >
              View in My Account
            </Link>
            <Link
              href="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-6 py-3 rounded-full transition"
            >
              Explore More Sacred Items
            </Link>
          </div>
        </div>
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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0008c1] font-serif">
          Sacred Checkout &amp; Payment
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Complete your order with instant online payment (UPI, Cards, NetBanking) or WhatsApp dispatch.
        </p>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Already registered? / पहले से अकाउंट है?</p>
              <p className="text-[11px] text-gray-600">
                Log in with Mobile OTP to automatically load your saved delivery addresses.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap cursor-pointer"
          >
            Log In with OTP
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-xs text-rose-800">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer & Shipping Form */}
        <div className="lg:col-span-7 space-y-6">
          {savedAddresses.length > 0 && !isPureDigital && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0008c1] flex items-center space-x-1.5">
                  <MapPin size={14} />
                  <span>Choose Delivery Address</span>
                </span>
                <Link href="/account" className="text-[11px] text-blue-600 hover:underline font-semibold">
                  Manage Addresses
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleAddressSelect(addr.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition relative ${
                      selectedAddressId === addr.id
                        ? 'border-[#0008c1] bg-blue-50/50 shadow-sm ring-1 ring-[#0008c1]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    <strong className="block font-semibold text-gray-900">{addr.fullName}</strong>
                    <span className="text-gray-500 block text-[11px] mt-0.5">+91 {addr.phone}</span>
                    <p className="text-gray-600 text-[11px] mt-1 line-clamp-2">
                      {addr.streetAddress}, {addr.city} - {addr.pincode}
                    </p>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddressSelect('custom')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition flex items-center justify-center space-x-2 ${
                    selectedAddressId === 'custom'
                      ? 'border-[#0008c1] bg-blue-50/50 ring-1 ring-[#0008c1]'
                      : 'border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50'
                  }`}
                >
                  <span className="font-semibold text-gray-700">+ Enter Different Address</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
              {isPureDigital ? 'Digital Access & Contact Details (डिजिटल एक्सेस विवरण)' : 'Delivery & Contact Details'}
            </h2>

            {isPureDigital && (
              <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs">
                <Sparkles size={18} className="text-[#0008c1] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold text-gray-900">Instant Digital Delivery (तुरंत डिजिटल ई-बुक)</strong>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    No courier delivery needed! Your personalized E-Book will be licensed directly to your verified mobile number (+91 {formData.phone || '...'}) and available to read online and download as a protected PDF immediately upon payment.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile / WhatsApp Number * <span className="text-[11px] text-blue-600 font-normal">(For OTP &amp; License)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-gray-400 font-normal">{isPureDigital ? '(To receive copy link)' : '(Optional)'}</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. aarav@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>

            {!isPureDigital && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="House/Flat number, Street, Area, Landmark"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City / Town *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Vrindavan"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      placeholder="e.g. 281121"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Special Blessings or Order Notes</label>
              <input
                type="text"
                name="notes"
                placeholder="Any prayer intentions or specific requests"
                value={formData.notes}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
              Sacred Cart Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-gray-50">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs pt-2.5 first:pt-0">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold line-clamp-1">{product.name}</span>
                      <span className="text-gray-400 text-[11px] block">Qty: {quantity} &times; ₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}.00</span>
              </div>
              {isPureDigital ? (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Format:</span>
                    <span className="text-[#0008c1] font-semibold">Instant Digital PDF (ई-बुक)</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Digital License &amp; Access:</span>
                    <span className="text-emerald-700 font-semibold">FREE (Online Reader + PDF)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>Consecration &amp; Vedic Packaging:</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>All India Express Delivery:</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-base font-bold text-[#0008c1] pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-lg">₹{subtotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-3">
              {/* 1. Primary: Pay Online */}
              <button
                type="button"
                disabled={paymentLoading}
                onClick={handleRazorpayCheckout}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#05138c] hover:to-[#0008c1] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg text-sm group cursor-pointer"
              >
                <CreditCard size={18} className="text-amber-300" />
                <span>
                  {paymentLoading ? 'Opening Secure Gateway...' : `Pay Online (₹${subtotal.toLocaleString('en-IN')})`}
                </span>
              </button>

              <div className="text-center text-[11px] text-gray-400 flex items-center justify-center space-x-1.5">
                <Lock size={12} className="text-emerald-600" />
                <span>256-Bit SSL Encrypted &bull; UPI, Cards, NetBanking, Wallets</span>
              </div>

              {/* 2. Secondary: WhatsApp Dispatch */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-2xl transition shadow text-xs cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>{isPureDigital ? 'Inquire via WhatsApp Directly' : 'Or Complete via WhatsApp Directly'}</span>
                </button>
              </div>
            </div>

            {isPureDigital ? (
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-900 flex items-center space-x-2">
                <ShieldCheck size={20} className="text-[#0008c1] flex-shrink-0" />
                <span>Protected Digital Edition: Licensed and watermarked with your verified mobile number to ensure authenticity and prevent piracy.</span>
              </div>
            ) : (
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-900 flex items-center space-x-2">
                <ShieldCheck size={20} className="text-[#0008c1] flex-shrink-0" />
                <span>All sacred items undergo authentic ritual consecration before immediate courier dispatch.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile OTP Verification Dialog before Purchase */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0008c1] to-[#0a187a] text-white p-5 text-center relative">
              <button
                type="button"
                onClick={() => {
                  setOtpModalOpen(false);
                  setOtpCode('');
                  setOtpError(null);
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition"
              >
                <X size={20} />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm border border-white/20 shadow-inner">
                <KeyRound size={22} className="text-amber-300" />
              </div>
              <h3 className="text-base font-bold">Mobile OTP Verification</h3>
              <p className="text-xs text-blue-100 mt-0.5">मोबाइल नंबर सत्यापन &bull; Save Address</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                Enter the 6-digit OTP sent to <strong className="text-gray-900 font-semibold">+91 {formData.phone.replace(/\D/g, '').slice(-10)}</strong>.
                This verifies your order and automatically saves your delivery address so you don&apos;t have to enter it again!
              </p>

              {devOtpPreview && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[11px] text-amber-800 font-medium">
                    Demo Mode OTP: <strong className="font-mono text-xs text-amber-950 font-bold">{devOtpPreview}</strong>
                  </span>
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndProceed} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 px-4 rounded-xl border border-gray-300 focus:border-[#0008c1] focus:ring-2 focus:ring-blue-100 outline-none transition"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Did not receive code?'}
                  </span>
                  <button
                    type="button"
                    disabled={otpTimer > 0 || otpSubmitting}
                    onClick={handleResendOtp}
                    className="text-[#0008c1] font-semibold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw size={12} className={otpSubmitting ? 'animate-spin' : ''} />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={otpSubmitting || otpCode.trim().length < 4}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0008c1] to-[#0a187a] hover:from-[#05138c] hover:to-[#0008c1] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md text-xs cursor-pointer"
                >
                  {otpSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying &amp; Saving Address...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-amber-300" />
                      <span>Verify &amp; Proceed to {pendingAction === 'whatsapp' ? 'WhatsApp' : 'Payment'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalOpen(false);
                    setOtpCode('');
                    setOtpError(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancel / Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
