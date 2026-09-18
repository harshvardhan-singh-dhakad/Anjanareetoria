"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className=min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white>
      <div className=max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl>
        <div className=w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400>
          <AlertTriangle size={32} />
        </div>

        <div className=space-y-2>
          <h2 className=text-xl font-bold font-serif text-white>Admin Session Notice</h2>
          <p className=text-xs text-slate-400>
            An issue occurred while loading this admin section or your session may need re-authorization.
          </p>
        </div>

        <div className=flex flex-col sm:flex-row items-center justify-center gap-3 pt-2>
          <button
            onClick={() => reset()}
            className=w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition border border-slate-700
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>

          <Link
            href=/admin/login
            className=w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1346af] hover:bg-[#0008c1] text-white text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-md
          >
            <LogIn size={14} />
            <span>Go to Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
