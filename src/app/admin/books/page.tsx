"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  FileCheck,
  FileWarning,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  BookMarked
} from 'lucide-react';
import type { ExtendedBook } from '@/lib/db/cmsStore';
import { adminFetch } from '@/lib/admin/adminClient';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<ExtendedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<ExtendedBook | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    name: '',
    author: 'AR Blessings Research Guild',
    formatType: 'both' as 'ebook' | 'physical' | 'both',
    ebookPrice: 499,
    physicalPrice: 899,
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    pages: 200,
    language: 'Hindi & English Edition',
    publishedYear: 2024,
    isbn: '',
    category: 'Books & E-Books',
    image: '/images/books/karodon-ka-rahasya.svg',
    pdfSourceFile: '',
    inStock: true,
    badge: 'Bestseller',
    shortDescription: '',
    description: '',
    featuresText: '',
  });

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/books');
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.books) ? data.books : Array.isArray(data.data) ? data.data : [];
        setBooks(list);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const list = Array.isArray(books) ? books : [];
    return list.filter(b => {
      if (!b) return false;
      const matchesFormat = selectedFormat === 'All' || b.formatType === selectedFormat;
      const q = search.toLowerCase().trim();
      const name = b.name || (b as any).title || '';
      const author = typeof b.author === 'string' ? b.author : (b.author as any)?.name || '';
      const slug = b.slug || '';
      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q);
      return matchesFormat && matchesSearch;
    });
  }, [books, selectedFormat, search]);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      id: `bk-${Date.now()}`,
      slug: '',
      name: '',
      author: 'AR Blessings Research Guild',
      formatType: 'both',
      ebookPrice: 499,
      physicalPrice: 899,
      price: 499,
      originalPrice: 999,
      discountPercent: 50,
      pages: 220,
      language: 'Hindi & English Edition',
      publishedYear: 2024,
      isbn: '978-81-965412-1-2',
      category: 'Books & E-Books',
      image: '/images/books/karodon-ka-rahasya.svg',
      pdfSourceFile: '',
      inStock: true,
      badge: 'New Release',
      shortDescription: 'Sacred literature revealing ancient prosperity laws and energetic alignment.',
      description: 'Comprehensive guide uniting ancient spiritual teachings with modern manifestation principles.',
      featuresText: 'Instant PDF / EPUB Watermarked Access\nHigh-definition typography\nIncludes 21-Day Abundance Plan',
    });
    setPdfSuccessMessage(null);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: ExtendedBook) => {
    setEditingBook(b);
    setFormData({
      id: b.id || '',
      slug: b.slug || '',
      name: b.name || (b as any).title || '',
      author: (typeof b.author === 'string' ? b.author : (b.author as any)?.name) || 'AR Blessings Research Guild',
      formatType: b.formatType || 'both',
      ebookPrice: b.ebookPrice || b.price || 499,
      physicalPrice: b.physicalPrice || 899,
      price: b.price || 499,
      originalPrice: b.originalPrice || 0,
      discountPercent: b.discountPercent || 0,
      pages: b.pages || 200,
      language: b.language || 'Hindi & English Edition',
      publishedYear: b.publishedYear || 2024,
      isbn: b.isbn || '',
      category: b.category || 'Books & E-Books',
      image: b.image || b.coverImage || '',
      pdfSourceFile: b.pdfSourceFile || '',
      inStock: b.inStock ?? true,
      badge: b.badge || '',
      shortDescription: b.shortDescription || '',
      description: b.description || '',
      featuresText: Array.isArray(b.features) ? b.features.join('\n') : '',
    });
    setPdfSuccessMessage(null);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await adminFetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file');
      return;
    }

    setUploadingPdf(true);
    setPdfSuccessMessage(null);
    const fd = new FormData();
    fd.append('pdf', file);
    if (formData.id) {
      fd.append('bookId', formData.id);
    }

    try {
      const res = await adminFetch('/api/admin/books/upload-pdf', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, pdfSourceFile: data.filename }));
        setPdfSuccessMessage(`Master PDF "${data.filename}" saved to private storage.`);
      } else {
        alert(data.error || 'Failed to upload PDF');
      }
    } catch {
      alert('Error uploading PDF file');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const features = formData.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: ExtendedBook = {
      id: formData.id || `bk-${Date.now()}`,
      slug,
      name: formData.name,
      author: formData.author,
      formatType: formData.formatType,
      ebookPrice: Number(formData.ebookPrice),
      physicalPrice: Number(formData.physicalPrice),
      price: Number(formData.ebookPrice) || Number(formData.price),
      originalPrice: Number(formData.originalPrice) || undefined,
      discountPercent: Number(formData.discountPercent) || undefined,
      pages: Number(formData.pages),
      language: formData.language,
      publishedYear: Number(formData.publishedYear),
      isbn: formData.isbn || undefined,
      category: formData.category,
      image: formData.image,
      pdfSourceFile: formData.pdfSourceFile || undefined,
      inStock: formData.inStock,
      badge: formData.badge || undefined,
      shortDescription: formData.shortDescription,
      description: formData.description,
      features,
      tableOfContents: editingBook?.tableOfContents || [
        { number: 1, title: 'The Sacred Awakening', summary: 'Understanding subtle cosmic laws of wealth retention.' },
        { number: 2, title: 'The Lakshmi Frequency', summary: 'Reprogramming internal subconscious limits.' }
      ],
      sampleExcerpt: editingBook?.sampleExcerpt || {
        chapterTitle: 'Chapter 1: The Sacred Awakening',
        paragraphs: ['Wealth is not merely numeric accumulation; it is an energetic harmony with the cosmos.']
      }
    };

    try {
      const res = await adminFetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadBooks();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save book' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error saving book' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete book "${name}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/books?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadBooks();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Error deleting book');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 mb-1">
            <BookOpen size={16} />
            <span className="uppercase tracking-wider">Literature &amp; Digital eBooks</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Books &amp; E-Books Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage physical hardcovers, instant digital PDFs, and direct master PDF uploads for anti-piracy watermarking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadBooks}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Watermarking Engine Status Mini-Alert */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <ShieldCheck size={20} className="text-amber-700 flex-shrink-0" />
          <span className="text-amber-950">
            <strong>Server-Side Watermark Engine:</strong> Uploaded master PDFs are saved securely in <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-900">/private-ebooks/source/</code>, never served as static assets.
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[11px] self-end sm:self-auto">
          {(Array.isArray(books) ? books : []).filter(b => b?.pdfSourceFile).length} of {Array.isArray(books) ? books.length : 0} eBooks have master PDF linked
        </span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search books by title, author, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Format:</span>
          {['All', 'ebook', 'physical', 'both'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                selectedFormat === fmt
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {fmt === 'both' ? 'E-Book & Print' : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-amber-600" />
            <p className="text-xs">Loading books and eBooks...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookMarked size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No books found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing filters or add a new book.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Book Title &amp; Author</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Master PDF (Watermarking)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                          {b.image ? (
                            <Image
                              src={b.image}
                              alt={b.name || (b as any).title || 'Book'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 font-serif">
                            {b.name || (b as any).title || 'Untitled Book'}
                          </div>
                          <div className="text-xs text-slate-500">
                            By {b.author || 'AR Blessings'} &bull; {b.pages || 0} Pages
                          </div>
                          {b.badge && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              {b.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {b.formatType === 'both' ? 'E-Book + Print' : b.formatType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-semibold text-slate-900">
                        E-Book: ₹{b.ebookPrice || b.price}
                      </div>
                      {b.physicalPrice && (
                        <div className="text-xs text-slate-500">
                          Hardcover: ₹{b.physicalPrice}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {b.pdfSourceFile ? (
                        <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60 w-fit">
                          <FileCheck size={14} className="flex-shrink-0" />
                          <span className="font-mono text-[11px] truncate max-w-[180px]" title={b.pdfSourceFile}>
                            {b.pdfSourceFile}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 w-fit">
                          <FileWarning size={14} className="flex-shrink-0" />
                          <span className="text-[11px] font-medium">No Master PDF Linked</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/books/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition"
                          title="View Book page"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition"
                          title="Edit Book & Upload PDF"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name || (b as any).title || 'Book')}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Book"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} className="text-amber-700" />
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  {editingBook ? 'Edit Book & PDF Details' : 'Add New Book & E-Book'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 text-xs sm:text-sm">
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

              {/* PDF Master Upload Dropzone (Key Feature) */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl border-2 border-dashed border-amber-300 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                      <UploadCloud size={18} className="text-amber-700" />
                      <span>Master E-Book PDF Upload (Anti-Piracy Source)</span>
                    </div>
                    <p className="text-xs text-amber-800/80">
                      Upload your high-res digital booklet PDF. Stored privately in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">/private-ebooks/source/</code> for per-buyer watermarking upon purchase.
                    </p>
                  </div>
                  {formData.pdfSourceFile && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold rounded-lg border border-emerald-300">
                      Linked: {formData.pdfSourceFile}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <label className="cursor-pointer w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition">
                    <UploadCloud size={16} />
                    <span>{uploadingPdf ? 'Uploading Master PDF...' : 'Choose PDF Document'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Or specify filename e.g. karodon-ka-rahasya.pdf"
                      value={formData.pdfSourceFile}
                      onChange={(e) => setFormData({ ...formData, pdfSourceFile: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {pdfSuccessMessage && (
                  <p className="text-xs text-emerald-700 font-medium pt-1">
                    ✓ {pdfSuccessMessage}
                  </p>
                )}
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Karodon Ka Rahasya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. AR Blessings Research Guild"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Format & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Format</label>
                  <select
                    value={formData.formatType}
                    onChange={(e) => setFormData({ ...formData, formatType: e.target.value as 'ebook' | 'physical' | 'both' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  >
                    <option value="both">Both (E-Book &amp; Print)</option>
                    <option value="ebook">Digital E-Book Only</option>
                    <option value="physical">Physical Hardcover Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">E-Book Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.ebookPrice}
                    onChange={(e) => setFormData({ ...formData, ebookPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Hardcover Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.physicalPrice}
                    onChange={(e) => setFormData({ ...formData, physicalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pages Count</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Published Year</label>
                  <input
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Highlight Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Bestseller #1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700">Book Cover Image</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/books/... or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition">
                    <UploadCloud size={16} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Cover'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Short Summary</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Reveals ancient Vedic prosperity laws..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Features */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Features / Takeaways (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono text-xs"
                />
              </div>

              {/* Form Footer */}
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
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBook ? 'Update Book Details' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
