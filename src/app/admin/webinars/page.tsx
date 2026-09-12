"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  RefreshCw,
  Star,
  MessageSquare
} from 'lucide-react';
import { Webinar, WebinarReview } from '@/lib/db/cmsStore';

export default function AdminWebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingReviewAvatar, setUploadingReviewAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    speakerName: 'Acharya Rajesh Shastri',
    speakerTitle: 'Master Vedic Astrologer',
    speakerImage: '/images/testimonials/review-1.png',
    dateTime: 'Sunday, October 27, 2024 at 10:00 AM IST',
    duration: '90 Minutes',
    price: 0,
    registrationUrl: 'https://meet.google.com',
    status: 'upcoming' as 'upcoming' | 'live' | 'completed',
    bannerImage: '/images/blog/sacred-morning-rituals.svg',
    agendaText: '',
    reviews: [] as WebinarReview[],
  });

  // Review Sub-form State
  const [newReview, setNewReview] = useState({
    name: '',
    roleOrLocation: '',
    rating: 5,
    comment: '',
    avatar: '/images/testimonials/review-1.png',
  });

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/webinars');
      const data = await res.json();
      if (data.success) {
        setWebinars(data.data);
      }
    } catch (err) {
      console.error('Failed to load webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebinars();
  }, []);

  const openAddModal = () => {
    setEditingWebinar(null);
    setFormData({
      id: `web-${Date.now()}`,
      slug: '',
      title: '',
      subtitle: '',
      description: 'Exclusive spiritual live session exploring Vedic prosperity frequencies and sacred practices.',
      speakerName: 'Acharya Rajesh Shastri',
      speakerTitle: 'Vedic Astrologer & Manifestation Luminary',
      speakerImage: '/images/testimonials/review-1.png',
      dateTime: 'Sunday, October 27, 2024 at 10:00 AM IST',
      duration: '90 Minutes + Q&A',
      price: 0,
      registrationUrl: 'https://meet.google.com',
      status: 'upcoming',
      bannerImage: '/images/blog/sacred-morning-rituals.svg',
      agendaText: 'Understanding the 4 AM Cosmic Frequency\nPurifying Financial Energy Conduits\nLive Guided Mantra Transmission\nDirect Consultation & Q&A',
      reviews: [
        {
          id: `rev-${Date.now()}-1`,
          name: 'Vikram Malhotra',
          roleOrLocation: 'Surat, Gujarat',
          rating: 5,
          comment: 'The morning ritual transmission cleared financial blockage that had persisted for months.',
          date: 'Recently',
          avatar: '/images/testimonials/review-1.png'
        }
      ],
    });
    setActiveTab('details');
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (w: Webinar) => {
    setEditingWebinar(w);
    setFormData({
      id: w.id,
      slug: w.slug,
      title: w.title,
      subtitle: w.subtitle,
      description: w.description,
      speakerName: w.speaker?.name || '',
      speakerTitle: w.speaker?.title || '',
      speakerImage: w.speaker?.image || '',
      dateTime: w.dateTime,
      duration: w.duration,
      price: w.price,
      registrationUrl: w.registrationUrl,
      status: w.status,
      bannerImage: w.bannerImage,
      agendaText: (w.agenda || []).join('\n'),
      reviews: w.reviews || [],
    });
    setActiveTab('details');
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, bannerImage: data.url }));
      } else {
        alert(data.error || 'Failed to upload banner');
      }
    } catch {
      alert('Error uploading banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleReviewAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReviewAvatar(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setNewReview(prev => ({ ...prev, avatar: data.url }));
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch {
      alert('Error uploading avatar');
    } finally {
      setUploadingReviewAvatar(false);
    }
  };

  const addReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert('Please provide reviewer name and comment');
      return;
    }

    const reviewToAdd: WebinarReview = {
      id: `rev-${Date.now()}`,
      name: newReview.name.trim(),
      roleOrLocation: newReview.roleOrLocation.trim() || undefined,
      rating: Number(newReview.rating),
      comment: newReview.comment.trim(),
      avatar: newReview.avatar || undefined,
      date: 'Verified Attendee'
    };

    setFormData(prev => ({
      ...prev,
      reviews: [reviewToAdd, ...prev.reviews]
    }));

    // Reset sub-form
    setNewReview({
      name: '',
      roleOrLocation: '',
      rating: 5,
      comment: '',
      avatar: '/images/testimonials/review-1.png',
    });
  };

  const removeReview = (id: string) => {
    setFormData(prev => ({
      ...prev,
      reviews: prev.reviews.filter(r => r.id !== id)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const slug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const agenda = formData.agendaText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Webinar = {
      id: formData.id || `web-${Date.now()}`,
      slug,
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      speaker: {
        name: formData.speakerName,
        title: formData.speakerTitle,
        image: formData.speakerImage,
      },
      dateTime: formData.dateTime,
      duration: formData.duration,
      price: Number(formData.price),
      registrationUrl: formData.registrationUrl,
      status: formData.status,
      bannerImage: formData.bannerImage,
      agenda,
      reviews: formData.reviews,
      whoShouldAttend: editingWebinar?.whoShouldAttend || [
        "Seekers ready to clear energetic stagnation",
        "Individuals wanting authentic morning Vedic discipline",
        "Entrepreneurs looking for business prosperity alignment"
      ],
    };

    try {
      const res = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadWebinars();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save webinar' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error saving webinar' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete webinar "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/webinars?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadWebinars();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Error deleting webinar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 mb-1">
            <Video size={16} />
            <span className="uppercase tracking-wider">Live Spiritual Events &amp; Reviews CMS</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Webinars &amp; Masterclasses Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule live Zoom/Meet workshops, manage attendee reviews &amp; ratings, and publish dedicated landing pages.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadWebinars}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus size={16} />
            <span>Create New Webinar</span>
          </button>
        </div>
      </div>

      {/* Webinars List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs">Loading webinars...</p>
          </div>
        ) : webinars.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
            <Video size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No webinars scheduled yet</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Create New Webinar&quot; to schedule your first masterclass.</p>
          </div>
        ) : (
          webinars.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              {/* Top Banner Image */}
              <div className="relative h-44 w-full bg-slate-900">
                {w.bannerImage ? (
                  <Image src={w.bannerImage} alt={w.title} fill className="object-cover opacity-85" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Video size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                      w.status === 'live'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : w.status === 'completed'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                    }`}
                  >
                    {w.status}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-950 flex items-center space-x-1">
                    <Star size={11} className="fill-slate-950" />
                    <span>{w.reviews?.length || 0} Reviews</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-slate-950 shadow-sm">
                    {w.price === 0 ? 'FREE' : `₹${w.price}`}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-base font-bold font-serif line-clamp-1">{w.title}</h3>
                  <p className="text-xs text-amber-200/90 line-clamp-1">{w.subtitle}</p>
                </div>
              </div>

              {/* Webinar Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-emerald-600" />
                      <span className="font-semibold text-slate-900">{w.speaker.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Clock size={13} />
                      <span>{w.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <Calendar size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>{w.dateTime}</span>
                  </div>

                  {/* Devotee Reviews preview */}
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-950 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <MessageSquare size={14} className="text-amber-700" />
                      <span>{w.reviews?.length || 0} Attendee Testimonials Linked</span>
                    </span>
                    <button
                      onClick={() => {
                        openEditModal(w);
                        setActiveTab('reviews');
                      }}
                      className="text-[11px] font-bold text-amber-900 hover:underline"
                    >
                      + Manage Reviews
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/webinars/${w.slug}`}
                    target="_blank"
                    className="flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    <span>View Landing Page</span>
                    <ExternalLink size={13} />
                  </Link>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(w)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Webinar & Reviews"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id, w.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Webinar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal with Dual Tabs (Details + Reviews) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header & Tabs */}
            <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <Video size={20} className="text-emerald-700" />
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  {editingWebinar ? 'Edit Spiritual Webinar' : 'Schedule New Webinar'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Webinar Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                      activeTab === 'reviews' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>Attendee Reviews ({formData.reviews.length})</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <form onSubmit={handleSave} className="p-6 space-y-5 text-xs sm:text-sm flex-1">
                {statusMessage && (
                  <div
                    className={`p-3 rounded-xl ${
                      statusMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                {/* Title & Subtitle */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Webinar Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Brahma Muhurta & Wealth Manifestation Live Masterclass"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Unlock the 4:00 AM Cosmic Frequency to Clear Financial Stagnation"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Speaker Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Speaker Name</label>
                    <input
                      type="text"
                      value={formData.speakerName}
                      onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                      placeholder="Acharya Rajesh Shastri"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Speaker Title / Role</label>
                    <input
                      type="text"
                      value={formData.speakerTitle}
                      onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })}
                      placeholder="Master Vedic Astrologer & Vastu Luminary"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Schedule, Duration, Price, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Date &amp; Time *</label>
                    <input
                      type="text"
                      required
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      placeholder="Sunday, Nov 10, 2024 at 10:00 AM IST"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="90 Minutes"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Fee (₹, 0 = Free)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Meeting Link & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Meeting / Registration URL</label>
                    <input
                      type="text"
                      value={formData.registrationUrl}
                      onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                      placeholder="https://meet.google.com/xyz or Zoom URL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Event Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'live' | 'completed' })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    >
                      <option value="upcoming">Upcoming Event</option>
                      <option value="live">Live Now (Streaming)</option>
                      <option value="completed">Completed / Archive</option>
                    </select>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700">Banner Image</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={formData.bannerImage}
                      onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                      placeholder="/images/blog/... or https://..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition">
                      <UploadCloud size={16} />
                      <span>{uploadingBanner ? 'Uploading...' : 'Upload Banner'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        disabled={uploadingBanner}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Session Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Agenda Items */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Agenda Topics (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.agendaText}
                    onChange={(e) => setFormData({ ...formData, agendaText: e.target.value })}
                    placeholder="The Metaphysical Science of Brahma Muhurta&#10;How to Tune Your Wallet to Lakshmi Frequency&#10;Live Beej Mantra Transmission"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono text-xs"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingWebinar ? 'Update Webinar' : 'Schedule Webinar'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REVIEWS MANAGER (User Request: Admin can manage attendee reviews!) */}
            {activeTab === 'reviews' && (
              <div className="p-6 space-y-6 text-xs sm:text-sm flex-1">
                {/* Add New Review Sub-form */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span>Add New Attendee Review / Testimonial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Attendee Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Vikram Malhotra"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Location / Profession</label>
                      <input
                        type="text"
                        placeholder="e.g. Surat, Textile Businessman"
                        value={newReview.roleOrLocation}
                        onChange={(e) => setNewReview({ ...newReview, roleOrLocation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Star Rating</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none text-xs"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      </select>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Review / Testimonial Text *</label>
                    <textarea
                      rows={2}
                      placeholder="Describe the spiritual experience, transformation or manifestation results..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none text-xs"
                    />
                  </div>

                  {/* Photo / Avatar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-700">Attendee Avatar:</span>
                      <input
                        type="text"
                        value={newReview.avatar}
                        onChange={(e) => setNewReview({ ...newReview, avatar: e.target.value })}
                        placeholder="/images/testimonials/review-1.png"
                        className="px-2.5 py-1 rounded-lg border border-amber-200 bg-white text-[11px] font-mono w-48"
                      />
                      <label className="cursor-pointer px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold text-[11px] rounded-lg transition">
                        <span>{uploadingReviewAvatar ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReviewAvatarUpload}
                          disabled={uploadingReviewAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={addReview}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                    >
                      + Add This Review
                    </button>
                  </div>
                </div>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Linked Reviews ({formData.reviews.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      These reviews display on the dedicated webinar page &amp; main landing page
                    </span>
                  </div>

                  {formData.reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-xl">
                      No reviews added yet. Fill the form above to add an attendee testimonial.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {formData.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-full bg-amber-200 relative overflow-hidden flex-shrink-0 border border-amber-300">
                              {rev.avatar ? (
                                <Image src={rev.avatar} alt={rev.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-amber-900">
                                  {rev.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <strong className="text-slate-900 font-serif">{rev.name}</strong>
                                {rev.roleOrLocation && (
                                  <span className="text-[11px] text-slate-400">
                                    &bull; {rev.roleOrLocation}
                                  </span>
                                )}
                                <span className="text-amber-500 text-xs">
                                  {'★'.repeat(rev.rating || 5)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 italic">
                                &quot;{rev.comment}&quot;
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeReview(rev.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                            title="Delete review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer to save all reviews */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    &larr; Back to Details
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save All Webinar Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
