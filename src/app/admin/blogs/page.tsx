"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  FileEdit,
  Plus,
  Search,
  Code2,
  Eye,
  Trash2,
  UploadCloud,
  X,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Layers,
  Wand2
} from 'lucide-react';
import type { ExtendedBlogPost } from '@/lib/db/cmsStore';
import { adminFetch } from '@/lib/admin/adminClient';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<ExtendedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<ExtendedBlogPost | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'preview' | 'meta'>('code');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    category: 'Manifestation & Wealth',
    coverImage: '/images/blog/sacred-morning-rituals.svg',
    publishedDate: 'September 12, 2024',
    readTimeMinutes: 5,
    featured: false,
    authorName: 'AR Blessings Spiritual Council',
    authorRole: 'Vedic Guidance Masters',
    tagsText: 'Brahma Muhurta, Vedic Wisdom, Abundance',
    htmlContent: '',
  });

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/blogs');
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.blogs) ? data.blogs : Array.isArray(data.data) ? data.data : [];
        setBlogs(list);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const list = Array.isArray(blogs) ? blogs : [];
    return list.filter(b => {
      if (!b) return false;
      const q = search.toLowerCase().trim();
      const title = b.title || '';
      const category = b.category || '';
      const slug = b.slug || '';
      return (
        !q ||
        title.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q)
      );
    });
  }, [blogs, search]);

  const defaultHtmlTemplate = `<style>
  .sacred-article {
    font-family: system-ui, -apple-system, sans-serif;
    color: #1e293b;
    line-height: 1.8;
  }
  .sacred-hero-callout {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 2.25rem;
    border-radius: 1.25rem;
    margin: 2rem 0;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  .sacred-hero-callout h3 {
    color: #fbbf24;
    font-family: serif;
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .golden-card {
    border-left: 4px solid #f59e0b;
    background: #fffbeb;
    padding: 1.25rem 1.5rem;
    border-radius: 0 1rem 1rem 0;
    margin: 1.75rem 0;
    font-size: 0.95rem;
    color: #78350f;
  }
  .article-subheading {
    font-size: 1.4rem;
    font-family: serif;
    font-weight: 700;
    color: #0f172a;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }
</style>

<div class="sacred-article">
  <div class="sacred-hero-callout">
    <h3>The Sacred Science of Cosmic Alignment</h3>
    <p>Discover how subtle vibrational shifts can dissolve energetic resistance and open channels of boundless abundance in your day-to-day life.</p>
  </div>

  <p>In the ancient Indian spiritual tradition, material prosperity is recognized not as a contradiction to spiritual evolution, but as one of the four essential pillars of human existence (Purusharthas): Dharma, Artha, Kama, and Moksha.</p>

  <h3 class="article-subheading">1. Awakening the Mind to Golden Frequencies</h3>
  <p>Every thought emits a subtle electromagnetic pulse. When we begin our morning aligned with sacred geometry, energized elements, and pure intent, our personal aura acts as a magnet for positive opportunities.</p>

  <div class="golden-card">
    <strong>Sacred Abundance Practice:</strong>
    <p>Spend the first 5 minutes of waking without looking at screens. Gaze into your open palms and offer gratitude for life and vitality.</p>
  </div>

  <h3 class="article-subheading">2. Harmony in Physical Spaces</h3>
  <p>The energy conduits of your workspace and home dictate how smoothly financial resources enter and remain. Keep north-east sectors clear, illuminated, and scented with consecrated fragrances.</p>
</div>`;

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      id: `post-${Date.now()}`,
      slug: '',
      title: '',
      excerpt: '',
      category: 'Manifestation & Wealth',
      coverImage: '/images/blog/sacred-morning-rituals.svg',
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTimeMinutes: 6,
      featured: false,
      authorName: 'AR Blessings Spiritual Council',
      authorRole: 'Vedic Guidance Masters',
      tagsText: 'Vedic Wisdom, Manifestation, Abundance, Morning Rituals',
      htmlContent: defaultHtmlTemplate,
    });
    setLastUploadedImageUrl(null);
    setActiveEditorTab('code');
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: ExtendedBlogPost) => {
    setEditingBlog(b);
    setFormData({
      id: b.id || '',
      slug: b.slug || '',
      title: b.title || '',
      excerpt: b.excerpt || '',
      category: b.category || 'Manifestation & Wealth',
      coverImage: b.coverImage || '/images/blog/sacred-morning-rituals.svg',
      publishedDate: b.publishedDate || '',
      readTimeMinutes: b.readTimeMinutes || 5,
      featured: b.featured ?? false,
      authorName: b.author?.name || 'AR Blessings Spiritual Council',
      authorRole: b.author?.role || 'Vedic Guidance Masters',
      tagsText: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      htmlContent: b.htmlContent || defaultHtmlTemplate,
    });
    setLastUploadedImageUrl(null);
    setActiveEditorTab('code');
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
        setLastUploadedImageUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const copyImgTag = () => {
    if (!lastUploadedImageUrl) return;
    const tag = `<img src="${lastUploadedImageUrl}" alt="Spiritual Illustration" style="max-width:100%; height:auto; border-radius:1rem; margin:1.5rem 0; box-shadow:0 4px 20px rgba(0,0,0,0.08);" />`;
    navigator.clipboard.writeText(tag);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2500);
  };

  const insertImgTagIntoCode = () => {
    if (!lastUploadedImageUrl) return;
    const tag = `\n<img src="${lastUploadedImageUrl}" alt="Spiritual Illustration" style="max-width:100%; height:auto; border-radius:1rem; margin:1.5rem 0; box-shadow:0 4px 20px rgba(0,0,0,0.08);" />\n`;
    setFormData(prev => ({
      ...prev,
      htmlContent: prev.htmlContent + tag,
    }));
    setActiveEditorTab('code');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const slug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tags = formData.tagsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: ExtendedBlogPost = {
      id: formData.id || `post-${Date.now()}`,
      slug,
      title: formData.title,
      excerpt: formData.excerpt,
      coverImage: formData.coverImage,
      category: formData.category,
      tags,
      author: {
        name: formData.authorName,
        role: formData.authorRole,
      },
      publishedDate: formData.publishedDate,
      readTimeMinutes: Number(formData.readTimeMinutes),
      featured: formData.featured,
      htmlContent: formData.htmlContent,
      content: editingBlog?.content || {
        introduction: formData.excerpt,
        sections: [
          {
            heading: 'Sacred Insights',
            body: [formData.excerpt],
          }
        ],
        conclusion: 'May this wisdom illuminate your path toward harmonious abundance.'
      }
    };

    try {
      const res = await adminFetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadBlogs();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save blog' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error saving blog' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadBlogs();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Error deleting blog');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 mb-1">
            <FileEdit size={16} />
            <span className="uppercase tracking-wider">Custom HTML &amp; CSS CMS</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Blog Articles &amp; Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Write rich articles with HTML, CSS, JavaScript styling, uploaded media, and live real-time preview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadBlogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus size={16} />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, category, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>
        <span className="text-xs text-slate-400 flex items-center">
          {filteredBlogs.length} Articles published
        </span>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-purple-700" />
            <p className="text-xs">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No articles found</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Write New Article&quot; to publish your first post.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Article Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-4">Content Type</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                          {b.coverImage ? (
                            <Image src={b.coverImage} alt={b.title || 'Blog'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FileEdit size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 font-serif line-clamp-1">
                            {b.title || 'Untitled Article'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /blog/{b.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        {b.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {b.publishedDate}
                    </td>

                    <td className="py-3.5 px-4">
                      {b.htmlContent ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Code2 size={12} />
                          <span>Custom HTML/CSS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          <span>Standard Text</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition"
                          title="View on website"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-slate-600 hover:text-purple-700 rounded-lg hover:bg-slate-100 transition"
                          title="Edit Article & HTML"
                        >
                          <FileEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Article"
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

      {/* Write / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between z-20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Code2 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-slate-900">
                    {editingBlog ? 'Edit Article & HTML/CSS' : 'Create Rich Article'}
                  </h2>
                  <p className="text-[11px] text-slate-400">Design your article using custom HTML, CSS and uploaded images</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab('code')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                      activeEditorTab === 'code'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 size={13} />
                    <span>HTML / CSS Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveEditorTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                      activeEditorTab === 'preview'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Live Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveEditorTab('meta')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                      activeEditorTab === 'meta'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers size={13} />
                    <span>Post Settings</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 flex-1 space-y-5 text-xs sm:text-sm">
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

              {/* Quick Image Uploader Helper Bar (Always Visible) */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <UploadCloud size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-purple-950 block">Inline Image Media Uploader</span>
                    <span className="text-[11px] text-purple-800/80">Upload photos, graphics or diagrams to embed directly in your article.</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-sm">
                    <UploadCloud size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  {lastUploadedImageUrl && (
                    <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-purple-200">
                      <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">
                        {lastUploadedImageUrl}
                      </span>
                      <button
                        type="button"
                        onClick={copyImgTag}
                        className="p-1 text-purple-700 hover:bg-purple-50 rounded"
                        title="Copy <img> tag"
                      >
                        {copiedTag ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={insertImgTagIntoCode}
                        className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-semibold text-[10px]"
                        title="Insert into code"
                      >
                        + Insert into Editor
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: HTML & CSS CODE EDITOR */}
              {activeEditorTab === 'code' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="font-semibold text-slate-800 flex items-center space-x-1.5">
                        <Code2 size={15} className="text-purple-700" />
                        <span>Custom HTML, CSS &amp; JavaScript Studio</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Write full HTML structure, &lt;style&gt; blocks, responsive grids, buttons, or embeds.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, htmlContent: defaultHtmlTemplate })}
                      className="flex items-center space-x-1 text-[11px] text-purple-700 hover:underline font-semibold"
                    >
                      <Wand2 size={12} />
                      <span>Reset to Sacred Template</span>
                    </button>
                  </div>

                  <div className="relative border border-slate-300 rounded-2xl overflow-hidden shadow-inner bg-slate-950">
                    <div className="bg-slate-900 px-4 py-2 text-[11px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
                      <span className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="ml-2 text-slate-300 font-semibold">article-content.html</span>
                      </span>
                      <span className="text-[10px] text-slate-500">HTML5 + Embedded CSS</span>
                    </div>

                    <textarea
                      rows={18}
                      value={formData.htmlContent}
                      onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                      placeholder="<div><h1>Title</h1><p>Content...</p></div>"
                      className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-purple-900"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE PREVIEW */}
              {activeEditorTab === 'preview' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Eye size={15} className="text-purple-700" />
                      <span>Live Rendered Preview</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      This is how your readers will see the article on the public site
                    </span>
                  </div>

                  <div className="p-6 sm:p-10 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">
                      {formData.title || 'Untitled Article'}
                    </h1>
                    <div className="text-xs text-slate-400 mb-6 flex items-center space-x-3">
                      <span>{formData.publishedDate}</span>
                      <span>&bull;</span>
                      <span>{formData.category}</span>
                      <span>&bull;</span>
                      <span>{formData.readTimeMinutes} min read</span>
                    </div>

                    {formData.htmlContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                        className="prose max-w-none"
                      />
                    ) : (
                      <p className="text-slate-400 italic">No HTML content yet. Switch to the HTML/CSS Code tab to write.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: POST METADATA & SEO SETTINGS */}
              {activeEditorTab === 'meta' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Article Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. 5 Sacred Morning Rituals to Attract Wealth"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">URL Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. sacred-morning-rituals-for-wealth"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Excerpt / Subtitle *</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief teaser summarizing the article for catalog listings..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Manifestation & Wealth"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Published Date</label>
                      <input
                        type="text"
                        value={formData.publishedDate}
                        onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                        placeholder="September 12, 2024"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Read Time (Mins)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.readTimeMinutes}
                        onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Author Name</label>
                      <input
                        type="text"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Author Role</label>
                      <input
                        type="text"
                        value={formData.authorRole}
                        onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Cover Image URL</label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="/images/blog/... or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Keywords / Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tagsText}
                      onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                      placeholder="Brahma Muhurta, Manifestation, Lakshmi, Vastu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="featuredToggle"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="featuredToggle" className="font-semibold text-slate-800 cursor-pointer">
                      Feature on Blog Homepage Banner
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">
                    Active tab: <strong className="text-slate-700 uppercase">{activeEditorTab}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
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
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {saving ? 'Publishing...' : editingBlog ? 'Update Article' : 'Publish Article'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
