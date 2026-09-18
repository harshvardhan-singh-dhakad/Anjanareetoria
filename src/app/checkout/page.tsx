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
  const { user, isLoggedIn, openAuthModal, loginWithGoogle, refreshUser } = useAuth();
  const [quickGoogleLoading, setQuickGoogleLoading] = useState(false);

  const handleQuickGoogleSignIn = async () => {
    setQuickGoogleLoading(true);
    setErrorMessage(null);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setFormData((prev) => ({
          ...prev,
          name: loggedUser.name || prev.name,
          email: loggedUser.email || prev.email,
        }));
      }
      await refreshUser();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User closed popup, don't show an intrusive error
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Google Sign-In popup was blocked by your browser. Please allow popups for this site.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('This domain is not yet authorized in Firebase Console (Authentication > Settings > Authorized domains).');
      } else {
        setErrorMessage(err?.message || 'Google Sign-In could not be completed. You can continue as guest.');
      }
    } finally {
      setQuickGoogleLoading(false);
    }
  };

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

  const validateDetails = (): boolean => {
    setErrorMessage(null);
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Mobile number is mandatory. Please enter a valid 10-digit Mobile Number for delivery & order updates.');
      return false;
    }
    const cleanEmail = formData.email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Email address is mandatory for order receipts & account access.');
      return false;
    }
    // Only require physical delivery address if the cart has physical items
    if (!isPureDigital) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
        setErrorMessage('Please complete your Delivery Address, City, State, and PIN code.');
        return false;
      }
      const cleanPincode = formData.pincode.replace(/\D/g, '');
      if (cleanPincode.length !== 6) {
        setErrorMessage('Please enter a valid 6-digit PIN code for physical delivery.');
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
    await saveCustomAddressIfLoggedIn();
    await executeRazorpayPayment();
  };

  const handleWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    await saveCustomAddressIfLoggedIn();
    executeWhatsAppOrder();
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
                <span>Protected Digital Edition: Personalized to your devotee account to ensure authentic blessings.</span>
              </p>
            </div>
          )}

          {!isLoggedIn && (
            <div className="p-5 bg-gradient-to-r from-blue-50 via-amber-50 to-blue-50 rounded-2xl border border-blue-200 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-900">
                <Sparkles size={16} className="text-amber-500" />
                <span>Save this order to your Google Account (गूगल से जोड़ें)</span>
              </div>
              <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed">
                Connect your Google account in 1-Click so you can access your eBooks, invoices, and delivery tracking from any device anytime!
              </p>
              <button
                type="button"
                onClick={handleQuickGoogleSignIn}
                disabled={quickGoogleLoading}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer mx-auto disabled:opacity-50"
              >
                {quickGoogleLoading ? (
                  <Loader2 size={15} className="animate-spin text-[#0008c1]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Link with Google in 1-Click</span>
              </button>
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
              <p className="text-xs font-bold text-gray-900">Sign In with Google / पहले से खाता है?</p>
              <p className="text-[11px] text-gray-600">
                1-Click Google Sign-In to auto-load saved addresses, or checkout as guest below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleQuickGoogleSignIn}
              disabled={quickGoogleLoading}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {quickGoogleLoading ? (
                <Loader2 size={14} className="animate-spin text-[#0008c1]" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={openAuthModal}
              className="bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm whitespace-nowrap cursor-pointer"
            >
              Email Sign In
            </button>
          </div>
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
                    No courier delivery needed! Your personalized E-Book will be licensed directly to your account and available to read online and download as a protected PDF immediately upon payment.
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
                  Mobile / WhatsApp Number <span className="text-rose-600 font-bold">*</span>{' '}
                  <span className="text-[11px] text-blue-600 font-medium">(Mandatory for Delivery &amp; Receipt)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-r-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-rose-600 font-bold">*</span>{' '}
                <span className="text-gray-400 font-normal">
                  {isPureDigital ? '(To receive digital eBook copy link)' : '(For account sync & order receipt)'}
                </span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. devotee@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>

            {!isPureDigital && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Delivery Address <span className="text-rose-600 font-bold">*</span>
                  </label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / Town <span className="text-rose-600 font-bold">*</span>
                    </label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State <span className="text-rose-600 font-bold">*</span>
                    </label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      PIN Code <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
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
                <span>Protected Digital Edition: Licensed and personalized to your devotee account to ensure authenticity.</span>
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
    </div>
  );
}
