"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Mail,
  KeyRound
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type ModalStep = 'PHONE_INPUT' | 'OTP_INPUT' | 'SET_PASSWORD' | 'PASSWORD_LOGIN';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, setUser, refreshUser } = useAuth();

  const [step, setStep] = useState<ModalStep>('PHONE_INPUT');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Reset states on open/close
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('PHONE_INPUT');
      setError(null);
      setSuccessMsg(null);
      setDevOtpPreview(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isAuthModalOpen]);

  // Resend OTP countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP_INPUT' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setDevOtpPreview(data.devOtp || null);
      setSuccessMsg(`OTP sent to +91 ${cleanPhone}`);
      setStep('OTP_INPUT');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (otp.length < 4) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, '').slice(-10),
          otp,
          name,
          email,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setUser(data.user);

      // If user has not set a password yet, offer to set password for convenience
      if (!data.user.hasPassword) {
        setStep('SET_PASSWORD');
        setSuccessMsg('Phone verified! You can now set a password for fast login.');
      } else {
        setSuccessMsg('Login successful!');
        setTimeout(() => {
          closeAuthModal();
          refreshUser();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      setUser(data.user);
      setSuccessMsg(data.message || 'Login successful!');
      setTimeout(() => {
        closeAuthModal();
        refreshUser();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your mobile number and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match! Please check both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, '').slice(-10),
          password,
          confirmPassword,
          name,
          email,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save password.');
      }

      setSuccessMsg('Account setup complete! Welcome to AR Blessings.');
      setTimeout(() => {
        closeAuthModal();
        refreshUser();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 transform transition-all animate-scaleUp">
        {/* Top Header Graphic */}
        <div className="bg-gradient-to-r from-[#0008c1] via-[#1346af] to-[#0008c1] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>

          <h2 className="text-xl font-serif font-bold tracking-wide">
            {step === 'SET_PASSWORD'
              ? 'Complete Your Account'
              : step === 'PASSWORD_LOGIN'
              ? 'Welcome Back'
              : 'Sign In / Register'}
          </h2>
          <p className="text-xs text-amber-200/90 mt-1 font-sans">
            AR Blessings Sacred Devotee Portal
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Status Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev OTP Preview Toast (For instant hassle-free testing) */}
          {devOtpPreview && step === 'OTP_INPUT' && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-amber-600" />
                <span>Test OTP Code: <strong className="font-mono text-sm tracking-wider">{devOtpPreview}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtpPreview)}
                className="text-[11px] font-semibold text-[#0008c1] underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER INPUT (Primary Flow) */}
          {step === 'PHONE_INPUT' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mobile Number (मोबाइल नंबर) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-gray-500 flex items-center gap-1.5 border-r border-gray-200 pr-2">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-24 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1] tracking-wider"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  We will send a 6-digit one-time password to verify your phone.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    Get OTP (ओटीपी प्राप्त करें) <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('PASSWORD_LOGIN');
                  }}
                  className="text-xs font-medium text-[#0008c1] hover:underline"
                >
                  Have a password? <strong>Sign In with Password instead</strong>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'OTP_INPUT' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Enter 6-Digit OTP (ओटीपी दर्ज करें)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('PHONE_INPUT');
                      setError(null);
                    }}
                    className="text-[11px] text-[#0008c1] hover:underline"
                  >
                    Change Phone
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1]"
                  autoFocus
                  required
                />

                <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                  <span>Sent to +91 {phone}</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-[#0008c1] font-semibold hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span>Resend in {resendTimer}s</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify &amp; Continue <ShieldCheck size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SET PASSWORD SCREEN (with dual Eye icons and confirmation) */}
          {step === 'SET_PASSWORD' && (
            <form onSubmit={handleSetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (आपका नाम - Optional)
                </label>
                <div className="relative flex items-center">
                  <UserIcon size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (ईमेल - Optional)
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Optional for receipts and updates"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD 1 WITH EYE ICON */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Create Password (पासवर्ड दर्ज करें) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-[#0008c1] transition p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* PASSWORD FIELD 2: CONFIRMATION WITH EYE ICON */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm Password (पासवर्ड की पुष्टि करें) <span className="text-red-500">*</span>
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passwordsMatch ? '✓ Passwords Match' : '✗ Do Not Match'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter same password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2 text-xs border rounded-lg outline-none ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#0008c1]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-500 hover:text-[#0008c1] transition p-1"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !passwordsMatch || password.length < 6}
                  className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving Password...
                    </>
                  ) : (
                    <>
                      Save &amp; Complete Setup <CheckCircle2 size={15} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    refreshUser();
                  }}
                  className="w-full mt-2 text-center text-[11px] text-gray-500 hover:underline"
                >
                  Skip for now (I will set password later)
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: PASSWORD LOGIN SCREEN */}
          {step === 'PASSWORD_LOGIN' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mobile Number (मोबाइल नंबर) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-gray-500 flex items-center gap-1.5 border-r border-gray-200 pr-2">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-24 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] tracking-wider"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Password (पासवर्ड) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep('PHONE_INPUT');
                    }}
                    className="text-[11px] text-[#0008c1] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-[#0008c1] transition p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10 || !password}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In with Password <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('PHONE_INPUT');
                  }}
                  className="text-xs font-medium text-[#0008c1] hover:underline"
                >
                  Prefer instant OTP? <strong>Login via Mobile OTP instead</strong>
                </button>
              </div>
            </form>
          )}

          {/* Sacred Trust Badge Footer */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>256-Bit Encrypted Secure Spiritual Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};