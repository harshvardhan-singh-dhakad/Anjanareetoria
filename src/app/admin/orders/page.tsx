"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  BookOpen,
  Gem,
  Video,
  ExternalLink,
  ShieldCheck,
  X,
  CreditCard,
  MapPin,
  Phone,
  User,
  Calendar
} from 'lucide-react';
import { EbookOrder } from '@/lib/ebook/orderStore';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<EbookOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'book' | 'webinar'>('all');
  const [selectedOrder, setSelectedOrder] = useState<EbookOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Sort descending by purchaseTimestamp
        const sorted = [...data.orders].sort((a, b) => (b.purchaseTimestamp || 0) - (a.purchaseTimestamp || 0));
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const typeMatch = filterType === 'all' || (o.itemType || 'book') === filterType;
      const term = search.toLowerCase().trim();
      if (!term) return typeMatch;

      const orderIdMatch = (o.orderId || '').toLowerCase().includes(term);
      const nameMatch = (o.customerName || '').toLowerCase().includes(term);
      const phoneMatch = (o.buyerPhone || '').includes(term);
      const paymentIdMatch = (o.paymentId || '').toLowerCase().includes(term);
      const titleMatch = (o.itemTitle || o.productId || '').toLowerCase().includes(term);

      return typeMatch && (orderIdMatch || nameMatch || phoneMatch || paymentIdMatch || titleMatch);
    });
  }, [orders, filterType, search]);

  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const productCount = orders.filter((o) => o.itemType === 'product').length;
    const bookCount = orders.filter((o) => !o.itemType || o.itemType === 'book').length;
    const webinarCount = orders.filter((o) => o.itemType === 'webinar').length;

    return {
      totalRev,
      totalOrders: orders.length,
      productCount,
      bookCount,
      webinarCount,
    };
  }, [orders]);

  const renderTypeBadge = (type?: string) => {
    switch (type) {
      case 'product':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Gem size={12} />
            <span>Product</span>
          </span>
        );
      case 'webinar':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Video size={12} />
            <span>Webinar</span>
          </span>
        );
      case 'book':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <BookOpen size={12} />
            <span>Book / E-Book</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
              Live Transactions
            </span>
            <span className="text-xs text-slate-400 font-mono">Razorpay Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Orders &amp; Revenue
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time multi-channel purchases across Sacred Merchandise, E-Books, and Spiritual Masterclasses.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-sm self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#1346af]' : 'text-slate-500'} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0008c1]">
            ₹{stats.totalRev.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all live payments</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Orders
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {stats.totalOrders}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Confirmed transactions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            E-Books / Books
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-600">
            {stats.bookCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Digital &amp; Print editions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Webinars &amp; Products
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600">
            {stats.webinarCount + stats.productCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.webinarCount} Webinars • {stats.productCount} Products
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'product', 'book', 'webinar'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                filterType === type
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {type === 'all' ? 'All Orders' : `${type}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0008c1]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0008c1]" />
                    <span>Loading verified transactions...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No orders found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateStr = order.purchaseTimestamp
                    ? new Date(order.purchaseTimestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderTypeBadge(order.itemType)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {order.itemTitle || order.productId}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {order.productId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.customerName || 'Devotee'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          +91 {order.buyerPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ₹{Number(order.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          {order.paymentId ? order.paymentId.slice(0, 14) + '...' : 'Direct'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0008c1] text-slate-600 hover:text-white transition inline-flex items-center justify-center"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0008c1] flex items-center justify-center flex-shrink-0">
                <Receipt size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold font-serif text-slate-900">
                    Order {selectedOrder.orderId}
                  </h3>
                  {renderTypeBadge(selectedOrder.itemType)}
                </div>
                <p className="text-xs text-slate-400">
                  Razorpay Transaction Details &amp; Fulfillment
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Information
                </div>
                <div className="flex items-center space-x-2 text-slate-800">
                  <User size={14} className="text-slate-400" />
                  <span className="font-bold text-sm">{selectedOrder.customerName || 'Devotee'}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 font-mono">
                  <Phone size={14} className="text-slate-400" />
                  <span>+91 {selectedOrder.buyerPhone}</span>
                </div>
                {selectedOrder.buyerEmail && (
                  <div className="text-slate-600">
                    Email: {selectedOrder.buyerEmail}
                  </div>
                )}
              </div>

              {/* Purchase Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Purchase Details
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Item Title:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.itemTitle || selectedOrder.productId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Item Type:</span>
                  <span className="capitalize font-semibold text-slate-800">{selectedOrder.itemType || 'Book'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-extrabold text-base text-[#0008c1]">
                    ₹{Number(selectedOrder.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 font-mono">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedOrder.paymentId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Transaction Time:</span>
                  <span className="text-slate-700">
                    {selectedOrder.purchaseTimestamp ? new Date(selectedOrder.purchaseTimestamp).toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Shipping Address (for physical merchandise) */}
              {selectedOrder.shippingAddress && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                    <MapPin size={14} className="text-amber-700" />
                    <span>Shipping / Delivery Address</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              )}

              {/* E-Book Access info */}
              {(!selectedOrder.itemType || selectedOrder.itemType === 'book') && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    <span>Digital E-Book Watermarking</span>
                  </div>
                  <p className="text-emerald-800">
                    Watermark stamped with buyer phone: <strong>{selectedOrder.buyerPhone}</strong> and Order ID: <strong>{selectedOrder.orderId}</strong>.
                  </p>
                  <a
                    href={`/reader?phone=${selectedOrder.buyerPhone}&orderId=${selectedOrder.orderId}`}
                    target="_blank"
                    className="inline-flex items-center space-x-1 text-[#0008c1] font-bold hover:underline mt-1"
                  >
                    <span>View Watermarked Reader</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
