"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
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
            AR Blessings Admin
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to manage products, consecrated books, webinars, and spiritual blog publications.
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1346af] hover:bg-[#3a3a3a] text-white font-semibold text-sm py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center text-xs text-blue-900">
          <span>Initial Default: Password is <strong>arblessings@admin2024</strong></span>
        </div>
      </div>
    </div>
  );
}
