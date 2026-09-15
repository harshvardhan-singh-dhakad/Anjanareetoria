"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Gem,
  BookOpen,
  Video,
  FileEdit,
  ShieldCheck,
  UploadCloud,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Layers,
  Sparkles,
  Receipt,
  CreditCard,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { ExtendedBook } from '@/lib/db/cmsStore';
import { EbookOrder } from '@/lib/ebook/orderStore';

interface Stats {
  productsCount: number;
  booksCount: number;
  coursesCount: number;
  webinarsCount: number;
  blogsCount: number;
  ebooksWithPdf: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    booksCount: 0,
    coursesCount: 0,
    webinarsCount: 0,
    blogsCount: 0,
    ebooksWithPdf: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<EbookOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [resProd, resBooks, resWebinars, resBlogs, resOrders, resCourses] = await Promise.all([
        fetch('/api/admin/products').then(r => r.json()),
        fetch('/api/admin/books').then(r => r.json()),
        fetch('/api/admin/webinars').then(r => r.json()),
        fetch('/api/admin/blogs').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/courses').then(r => r.json()).catch(() => ({ success: false })),
      ]);

      const booksList: ExtendedBook[] = resBooks.data || [];
      const pdfCount = booksList.filter((b) => b.pdfSourceFile).length;
      const ordersList: EbookOrder[] = resOrders?.success && Array.isArray(resOrders.orders) ? resOrders.orders : [];
      const revenue = ordersList.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);

      const sortedOrders = [...ordersList].sort((a, b) => (b.purchaseTimestamp || 0) - (a.purchaseTimestamp || 0));
      setRecentOrders(sortedOrders.slice(0, 5));

      setStats({
        productsCount: resProd.data?.length || 0,
        booksCount: booksList.length || 0,
        coursesCount: resCourses?.data?.length || 0,
        webinarsCount: resWebinars.data?.length || 0,
        blogsCount: resBlogs.data?.length || 0,
        ebooksWithPdf: pdfCount,
        totalOrders: ordersList.length,
        totalRevenue: revenue,
      });
    } catch (err) {
      console.error('Error fetching admin dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Gross Revenue',
      count: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      desc: `${stats.totalOrders} live orders recorded`,
      icon: Receipt,
      href: '/admin/orders',
      color: 'from-blue-700 to-indigo-900',
      tag: 'Razorpay'
    },
    {
      title: 'Store Products',
      count: stats.productsCount,
      desc: 'Energized Merchandise & Sacred Items',
      icon: Gem,
      href: '/admin/products',
      color: 'from-sky-600 to-blue-700',
      tag: 'Catalog'
    },
    {
      title: 'Books & E-Books',
      count: stats.booksCount,
      desc: `${stats.ebooksWithPdf} Master PDFs ready for watermarking`,
      icon: BookOpen,
      href: '/admin/books',
      color: 'from-amber-600 to-orange-600',
      tag: 'Digital & Print'
    },
    {
      title: 'Master Webinars',
      count: stats.webinarsCount,
      desc: 'Live Zoom/Meet Spiritual Masterclasses',
      icon: Video,
      href: '/admin/webinars',
      color: 'from-emerald-600 to-teal-700',
      tag: 'Live Events'
    },
    {
      title: 'Courses & LMS',
      count: stats.coursesCount,
      desc: 'Structured Video Teachings & Modules',
      icon: GraduationCap,
      href: '/admin/courses',
      color: 'from-blue-600 to-indigo-800',
      tag: 'Anti-Piracy Video'
    },
    {
      title: 'Blog Articles',
      count: stats.blogsCount,
      desc: 'Custom HTML & CSS Rich Spiritual Articles',
      icon: FileEdit,
      href: '/admin/blogs',
      color: 'from-purple-600 to-violet-700',
      tag: 'Rich CMS'
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4 Production</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            AR Blessings Control Center
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Manage store merchandise, digital eBooks with anti-piracy watermarking, schedule live spiritual masterclasses, and publish rich HTML/CSS articles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#1346af]' : 'text-slate-500'} />
            <span>Refresh Stats</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm"
          >
            <span>Live Site</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </h3>
                <div className="text-3xl font-bold font-serif text-slate-900 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    card.count
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="line-clamp-1">{card.desc}</span>
                <span className="text-[#1346af] font-semibold text-xs group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </Link>
          );
        })}
      </div>

      {/* Security & Watermark Engine Status Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-serif text-white">
                  Server-Side Anti-Piracy Watermarking Engine
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-Firebase direct Node.js streaming architecture with multi-buyer dynamic stamping.
              </p>
            </div>
          </div>
          <Link
            href="/admin/books"
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg self-start md:self-auto"
          >
            <UploadCloud size={16} />
            <span>Upload New Master PDF</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 font-mono text-[11px]">STORAGE DIRECTORY</span>
            <span className="text-slate-200 font-mono break-all font-semibold">/private-ebooks/source/</span>
            <p className="text-[11px] text-slate-500 mt-1">Non-public directory outside public web root</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 font-mono text-[11px]">WATERMARK SPECIFICATION</span>
            <span className="text-amber-300 font-semibold">Diagonal 45° Tiled Opacity 0.12</span>
            <p className="text-[11px] text-slate-500 mt-1">Buyer phone, Order ID &amp; Purchase Timestamp</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 font-mono text-[11px]">PAYMENT GATEWAY</span>
            <span className="text-emerald-400 font-semibold">Razorpay Signature Verification</span>
            <p className="text-[11px] text-slate-500 mt-1">HMAC-SHA256 Webhook &amp; Order Verification</p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products & Books Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1346af] flex items-center justify-center font-bold">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Merchandise &amp; Literature</h3>
                <p className="text-xs text-slate-500">Fast management shortcuts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/admin/products"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                  <PlusCircle size={15} className="text-[#1346af]" />
                  <span>Add New Product</span>
                </div>
                <p className="text-[11px] text-slate-500">Create new energized spiritual artifacts &amp; fragrances.</p>
              </div>
              <span className="text-[11px] font-bold text-[#1346af] mt-3 group-hover:underline">Open Products &rarr;</span>
            </Link>

            <Link
              href="/admin/books"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-200 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                  <UploadCloud size={15} className="text-amber-600" />
                  <span>Upload E-Book PDF</span>
                </div>
                <p className="text-[11px] text-slate-500">Configure book details and attach master PDF file.</p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-3 group-hover:underline">Open Books &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Webinars & Blog Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Events &amp; Content Engine</h3>
                <p className="text-xs text-slate-500">Engage audiences with live events and articles</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/admin/webinars"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                  <Video size={15} className="text-emerald-600" />
                  <span>Host a Webinar</span>
                </div>
                <p className="text-[11px] text-slate-500">Set schedule, speaker bio, Zoom/Meet link and fee.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 mt-3 group-hover:underline">Manage Events &rarr;</span>
            </Link>

            <Link
              href="/admin/blogs"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/80 hover:border-purple-200 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                  <FileEdit size={15} className="text-purple-600" />
                  <span>Write Blog Article</span>
                </div>
                <p className="text-[11px] text-slate-500">Use custom HTML, CSS and uploaded images.</p>
              </div>
              <span className="text-[11px] font-bold text-purple-700 mt-3 group-hover:underline">Write Article &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0008c1] flex items-center justify-center font-bold">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Recent Online Purchases</h3>
              <p className="text-xs text-slate-500">Latest transactions processed through Razorpay</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0008c1] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ord.orderId}</td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-slate-700">{ord.itemType || 'Book'}</td>
                    <td className="py-2.5 px-3 text-slate-900 truncate max-w-xs">{ord.itemTitle || ord.productId}</td>
                    <td className="py-2.5 px-3">{ord.customerName || ord.buyerPhone}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0008c1]">₹{Number(ord.amount).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {ord.purchaseTimestamp ? new Date(ord.purchaseTimestamp).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
