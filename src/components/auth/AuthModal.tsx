"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
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
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type ModalMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
    refreshUser,
  } = useAuth();

  const [mode, setMode] = useState<ModalMode>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode('LOGIN');
      setError(null);
      setSuccessMsg(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Translate Firebase error codes into devotee-friendly messages
  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Incorrect email or password. Please verify your details.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with this email. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google Sign-In was cancelled before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Popup was blocked by your browser. Please allow popups for Google Sign-In.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection error. Please check your internet and try again.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Please wait a few moments or reset your password.';
    }
    return message || 'Authentication failed. Please try again.';
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      const user = await loginWithGoogle();
      setSuccessMsg(`Welcome, ${user.name || user.email}!`);
      setTimeout(() => {
        closeAuthModal();
        refreshUser();
      }, 700);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithEmail(cleanEmail, password);
      setSuccessMsg(`Welcome back, ${user.name || user.email}!`);
      setTimeout(() => {
        closeAuthModal();
        refreshUser();
      }, 700);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check both fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithEmail(cleanEmail, password, name.trim());
      setSuccessMsg(`Account created successfully! Welcome, ${user.name || user.email}.`);
      setTimeout(() => {
        closeAuthModal();
        refreshUser();
      }, 800);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(cleanEmail);
      setSuccessMsg(`Password reset link sent to ${cleanEmail}! Please check your inbox and spam folder.`);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 transform transition-all">
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
            {mode === 'REGISTER'
              ? 'Create Devotee Account'
              : mode === 'FORGOT_PASSWORD'
              ? 'Reset Your Password'
              : 'Sign In to AR Blessings'}
          </h2>
          <p className="text-xs text-amber-200/90 mt-1 font-sans">
            AR Blessings Sacred Spiritual Portal
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

          {/* Mode Switch Tabs (Login vs Register) */}
          {mode !== 'FORGOT_PASSWORD' && (
            <div className="flex border-b border-gray-100 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                  mode === 'LOGIN'
                    ? 'border-[#0008c1] text-[#0008c1]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign In (लॉगिन)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                  mode === 'REGISTER'
                    ? 'border-[#0008c1] text-[#0008c1]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Register (नया खाता)
              </button>
            </div>
          )}

          {/* 1. GOOGLE SIGN-IN BUTTON (Always available in LOGIN and REGISTER modes) */}
          {mode !== 'FORGOT_PASSWORD' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm hover:shadow transition disabled:opacity-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#0008c1]" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{mode === 'REGISTER' ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                  <span className="bg-white px-3 tracking-wider">or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (ईमेल) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1]"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Password (पासवर्ड) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setMode('FORGOT_PASSWORD');
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
                    className="w-full pl-9 pr-10 py-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-[#0008c1] p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Account <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-gray-500">Don&apos;t have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('REGISTER');
                  }}
                  className="text-xs font-semibold text-[#0008c1] hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTRATION FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleEmailRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (आपका पूरा नाम)
                </label>
                <div className="relative flex items-center">
                  <UserIcon size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (ईमेल) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password (पासवर्ड) <span className="text-red-500">*</span>
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
                    className="absolute right-3 text-gray-400 hover:text-[#0008c1] p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

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
                    placeholder="Re-enter password"
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
                    className="absolute right-3 text-gray-400 hover:text-[#0008c1] p-1"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || password.length < 6 || !passwordsMatch}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Devotee Account <CheckCircle2 size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-gray-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('LOGIN');
                  }}
                  className="text-xs font-semibold text-[#0008c1] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center py-1">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-2">
                  <KeyRound size={20} />
                </div>
                <p className="text-xs text-gray-600">
                  Enter your registered email and we will send you a secure link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1]"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#0008c1] hover:bg-[#1346af] disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Password Reset Link <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('LOGIN');
                  }}
                  className="text-xs font-semibold text-[#0008c1] hover:underline"
                >
                  ← Back to Sign In
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