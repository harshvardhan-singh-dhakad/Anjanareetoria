"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User as UserIcon,
  MapPin,
  ShoppingBag,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Download,
  Video,
  PlayCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserAddress } from '@/lib/auth/userStore';

export default function AccountPage() {
  const { user, isLoggedIn, isLoading, openAuthModal, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ADDRESSES' | 'ORDERS' | 'EBOOKS' | 'COURSES'>('PROFILE');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingEbooks, setLoadingEbooks] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Profile Edit State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAltPhone, setAddrAltPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrDefault, setAddrDefault] = useState(true);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  // URL query tab sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'COURSES' || tab === 'courses') {
        setActiveTab('COURSES');
      } else if (tab === 'EBOOKS' || tab === 'ebooks') {
        setActiveTab('EBOOKS');
      } else if (tab === 'ADDRESSES' || tab === 'addresses') {
        setActiveTab('ADDRESSES');
      } else if (tab === 'ORDERS' || tab === 'orders') {
        setActiveTab('ORDERS');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setEmailInput(user.email || '');
      fetchAddresses();
      fetchOrders();
      fetchEbooks();
      fetchCourses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const fetchEbooks = async () => {
    try {
      setLoadingEbooks(true);
      const res = await fetch('/api/user/ebooks');
      const data = await res.json();
      if (data.success && Array.isArray(data.ebooks)) {
        setEbooks(data.ebooks);
      }
    } catch (err) {
      console.error('Error fetching user ebooks:', err);
    } finally {
      setLoadingEbooks(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await fetch('/api/user/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Error fetching user courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`/api/ebook/abuse-logs`);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profile updated successfully!');
        refreshUser();
      }
    } catch {
      setProfileMsg('Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setPasswordMsg({ type: 'success', text: 'Password successfully changed!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = addrPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setAddrError('Mobile number is mandatory. Please enter a valid 10-digit mobile number.');
      setAddrSaving(false);
      return;
    }
    const cleanPin = addrPincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setAddrError('Please enter a valid 6-digit PIN code.');
      setAddrSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: addrFullName.trim(),
          phone: cleanPhone,
          altPhone: addrAltPhone ? addrAltPhone.replace(/\D/g, '').slice(-10) : undefined,
          streetAddress: addrStreet,
          landmark: addrLandmark,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          isDefault: addrDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address.');

      setShowAddressForm(false);
      // Reset form
      setAddrFullName('');
      setAddrPhone('');
      setAddrAltPhone('');
      setAddrStreet('');
      setAddrLandmark('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      fetchAddresses();
    } catch (err: any) {
      setAddrError(err.message || 'Failed to save address.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0008c1]" />
      </div>
    );
  }

  // If Guest (Non-intrusive prompt)
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
          <UserIcon size={36} className="text-[#0008c1]" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">
          Devotee Account Portal
        </h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          Sign in with your Google or Email account to view past orders, access your library of eBooks, and manage your delivery addresses.
        </p>
        <button
          onClick={openAuthModal}
          className="bg-[#0008c1] hover:bg-[#1346af] text-white px-8 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition inline-flex items-center gap-2"
        >
          Sign In with Google / Email <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0008c1] to-[#1346af] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
            ✨ AR Blessings Devotee Account
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
            Namaste, {user?.name || 'Blessed Devotee'}
          </h1>
          <p className="text-xs text-amber-100/80 mt-1">
            Account Email: {user?.email || (user?.phone ? `+91 ${user.phone}` : 'Active')}
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition"
        >
          Sign Out (लॉग आउट)
        </button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'PROFILE'
              ? 'border-[#0008c1] text-[#0008c1]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserIcon size={18} /> My Profile (प्रोफाइल)
        </button>

        <button
          onClick={() => setActiveTab('ADDRESSES')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'ADDRESSES'
              ? 'border-[#0008c1] text-[#0008c1]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MapPin size={18} /> Delivery Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setActiveTab('EBOOKS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'EBOOKS'
              ? 'border-[#0008c1] text-[#0008c1]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen size={18} /> My E-Books (मेरी ई-बुक्स)
          {ebooks.length > 0 && (
            <span className="bg-[#0008c1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {ebooks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('COURSES')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'COURSES'
              ? 'border-[#0008c1] text-[#0008c1]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Video size={18} /> My Courses (मेरे कोर्सेस)
          {courses.length > 0 && (
            <span className="bg-[#0008c1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {courses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'ORDERS'
              ? 'border-[#0008c1] text-[#0008c1]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={18} /> Orders &amp; Activity
        </button>
      </div>

      {/* TAB 1: PROFILE & PASSWORD */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon size={20} className="text-[#0008c1]" /> Personal Details
            </h2>

            {profileMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 size={16} /> {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Email Address (खाता ईमेल - प्राथमिक)
                </label>
                <input
                  type="email"
                  value={user?.email || emailInput || ''}
                  disabled
                  className="w-full px-3 py-2 text-xs bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Verified via {user?.provider === 'google.com' || user?.provider === 'google' ? 'Google Sign-In' : 'Firebase Authentication'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (आपका नाम)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aacharya Rajeev"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form (with Dual Eye Toggles) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lock size={20} className="text-amber-600" /> Security &amp; Password
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Set a password so you can sign in directly without waiting for OTP.
            </p>

            {passwordMsg && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Password 1 with Eye */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password (नया पासवर्ड)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-gray-500 hover:text-[#0008c1] p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password 2 (Confirm) with Eye */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm Password (पासवर्ड की पुष्टि करें)
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passwordsMatch ? '✓ Matching' : '✗ Do Not Match'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter same password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 text-xs border rounded-lg outline-none ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-500'
                          : 'border-red-400'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-500 hover:text-[#0008c1] p-1"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving || !passwordsMatch || newPassword.length < 6}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2"
              >
                {passwordSaving ? 'Updating...' : 'Update Password (पासवर्ड बदलें)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY ADDRESSES */}
      {activeTab === 'ADDRESSES' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Manage shipping addresses for fast checkout on store products.
              </p>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="bg-[#0008c1] hover:bg-[#1346af] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {/* New Address Form Modal/Drawer */}
          {showAddressForm && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-6 mb-8 animate-fadeIn">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#0008c1]" /> Add Delivery Address
              </h3>

              {addrError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs">
                  {addrError}
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Recipient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient's Name"
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Phone"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address, Flat / House No, Building <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Full residential / office street address"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near temple, hospital, etc."
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit Pincode"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultAddr"
                    checked={addrDefault}
                    onChange={(e) => setAddrDefault(e.target.checked)}
                    className="h-4 w-4 text-[#0008c1] rounded"
                  />
                  <label htmlFor="isDefaultAddr" className="text-xs text-gray-700">
                    Set as default delivery address
                  </label>
                </div>

                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addrSaving}
                    className="bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white px-6 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    {addrSaving ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Saved Addresses */}
          {addresses.length === 0 && !showAddressForm ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <MapPin size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">No saved addresses yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Add an address to speed up checkout when ordering sacred items.
              </p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-semibold text-[#0008c1] hover:underline"
              >
                + Add your first address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative hover:border-[#0008c1]/30 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{addr.fullName}</h4>
                      <p className="text-xs text-gray-500">+91 {addr.phone}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {addr.streetAddress}
                    {addr.landmark && `, Near ${addr.landmark}`}
                    <br />
                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-500 hover:text-red-700 text-xs p-1.5 rounded hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY E-BOOKS */}
      {activeTab === 'EBOOKS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                My E-Books (मेरी डिजिटल ई-बुक्स)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Instant online access and personal forensic-watermarked downloads licensed to +91 {user?.phone}.
              </p>
            </div>
            <Link
              href="/books"
              className="text-xs font-semibold text-[#0008c1] hover:underline flex items-center gap-1"
            >
              <span>Explore More Books</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingEbooks ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 size={28} className="animate-spin text-[#0008c1]" />
            </div>
          ) : ebooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#0008c1] flex items-center justify-center mx-auto">
                <BookOpen size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900">No E-Books in Your Library Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore our consecrated wealth, vastu, and sacred manifestation publications. E-Books unlock instantly upon purchase!
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow"
              >
                <span>Browse Sacred Books &amp; E-Books</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ebooks.map((ebook) => (
                <div
                  key={ebook.orderId}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4 hover:border-[#0008c1]/30 transition flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 border border-gray-100 shadow">
                      {ebook.image && (
                        <Image
                          src={ebook.image}
                          alt={ebook.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                        Licensed Digital Edition
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5">
                        {ebook.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate">{ebook.author}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
                        <span className="font-mono text-gray-800 font-semibold">{ebook.orderId}</span>
                        <span>&bull;</span>
                        <span>₹{ebook.amount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center space-x-2">
                    <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Licensed to +91 {user?.phone} (Forensic Watermarked)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={ebook.readerUrl}
                      className="inline-flex items-center justify-center space-x-1.5 bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow"
                    >
                      <BookOpen size={14} />
                      <span>Read Online</span>
                    </Link>
                    <a
                      href={ebook.downloadUrl}
                      className="inline-flex items-center justify-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY COURSES */}
      {activeTab === 'COURSES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                My Enrolled Courses &amp; Teachings (मेरे कोर्सेस)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                On-demand video lectures, sacred worksheets, and progress tracking licensed to +91 {user?.phone}.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-semibold text-[#0008c1] hover:underline flex items-center gap-1"
            >
              <span>Explore All Courses</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 size={28} className="animate-spin text-[#0008c1]" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0008c1] flex items-center justify-center mx-auto">
                <Video size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Courses Enrolled Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Discover our Vedic manifestation, Brahma Muhurta, and non-destructive Vastu video masterclasses!
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow"
              >
                <span>Browse Vedic Courses</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((c) => (
                <div
                  key={c.enrollmentId}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-4 hover:border-[#0008c1]/30 transition flex flex-col justify-between"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 shadow">
                      {c.thumbnail && (
                        <Image
                          src={c.thumbnail}
                          alt={c.courseTitle}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                        Enrolled Course
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mt-0.5">
                        {c.courseTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.instructor?.name} • {c.totalLessons} Lessons
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600">Course Progress</span>
                      <span className="font-bold font-mono text-[#0008c1]">{c.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${c.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2 border-t border-gray-100">
                    <Link
                      href={c.classroomUrl}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-[#0008c1] hover:bg-[#0a187a] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow"
                    >
                      <PlayCircle size={16} />
                      <span>Continue Learning (क्लासरूम खोलें)</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORDERS & ACTIVITY */}
      {activeTab === 'ORDERS' && (
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
            Orders &amp; Activity
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            View orders placed under your mobile number.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-600">Digital eBook Access</span>
                <h3 className="text-base font-bold text-gray-900">Karodon Ka Rahasya (करोड़ों का रहस्य)</h3>
                <p className="text-xs text-gray-500">Includes Personalized Watermarking Security</p>
              </div>
              <button
                onClick={() => setActiveTab('EBOOKS')}
                className="bg-[#0008c1] hover:bg-[#1346af] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow transition cursor-pointer"
              >
                <BookOpen size={16} /> View in My E-Books
              </button>
            </div>

            <div className="text-center py-6 text-xs text-gray-400">
              For any payment queries or courier tracking, contact our sacred support team anytime via WhatsApp.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}