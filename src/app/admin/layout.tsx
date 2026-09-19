"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Gem,
  BookOpen,
  Video,
  FileEdit,
  Receipt,
  ExternalLink,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Settings
} from 'lucide-react';
import { adminFetch, adminLogout } from '@/lib/admin/adminClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(pathname !== '/admin/login');
  const [adminUser, setAdminUser] = useState('40se40crore.merchandise@gmail.com');

  React.useEffect(() => {
    // If on login page, skip authentication check
    if (pathname === '/admin/login') {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;
    setCheckingAuth(true);

    adminFetch('/api/admin/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          if (data.user && isMounted) setAdminUser(data.user);
          if (isMounted) setCheckingAuth(false);
        } else {
          if (typeof window !== 'undefined') window.location.href = '/admin/login';
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // If on login page, don't show admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wider">Verifying Admin Authorization...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await adminLogout();
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Payments', href: '/admin/orders', icon: Receipt },
    { label: 'Courses & LMS', href: '/admin/courses', icon: GraduationCap },
    { label: 'Products', href: '/admin/products', icon: Gem },
    { label: 'Books & E-Books', href: '/admin/books', icon: BookOpen },
    { label: 'Webinars', href: '/admin/webinars', icon: Video },
    { label: 'Blog CMS', href: '/admin/blogs', icon: FileEdit },
    { label: 'Site Content & Media', href: '/admin/site-settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-950 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-base text-amber-400">AR Blessings</span>
          <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-mono">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-slate-900 text-slate-200"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between z-30 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-lg font-bold font-serif text-white tracking-wide">
                AR Blessings
              </span>
            </Link>
            <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-mono">
              <span>● Master Control Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#1346af] text-white shadow-md font-semibold'
                      : 'hover:bg-slate-900 hover:text-white text-slate-400'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 space-y-3">
          <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Super Admin</span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate mt-1" title={adminUser}>
              {adminUser}
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={14} />
              <span>View Public Website</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
