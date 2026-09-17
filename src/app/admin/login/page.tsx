"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      router.push('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
            <Lock size={26} className="text-[#0008c1]" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#0008c1]">
            AR Blessings Super Admin
          </h1>
          <p className="text-xs text-gray-500">
            Secure master control panel. Access restricted exclusively to authorized administrators.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Super Admin Email or Mobile (84335 58905)
            </label>
            <input
              type="text"
              placeholder="40se40crore.merchandise@gmail.com or 84335 58905"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm px-4 py-3 pr-11 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1346af] hover:bg-[#0008c1] text-white font-semibold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Super Admin...' : 'Sign In with Full Control'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center text-xs text-amber-900 flex items-center justify-center space-x-2">
          <ShieldCheck size={16} className="text-amber-700 flex-shrink-0" />
          <span>Authorized Super Admin Access Protected</span>
        </div>
      </div>
    </div>
  );
}
