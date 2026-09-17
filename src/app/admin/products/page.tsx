"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Gem,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  UploadCloud,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Product } from '@/data/products';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    name: '',
    price: 0,
    originalPrice: 0,
    discountPercent: 0,
    category: 'General',
    image: '',
    inStock: true,
    shortDescription: '',
    description: '',
    featuresText: '',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
          ? data.data
          : [];
        setProducts(list);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const set = new Set(list.map(p => p?.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter(p => {
      if (!p) return false;
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `prod-${Date.now()}`,
      slug: '',
      name: '',
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      category: 'General',
      image: '/images/products/dollar.jpg',
      inStock: true,
      shortDescription: '',
      description: '',
      featuresText: 'Consecrated and Energized\nAttracts Positive Financial Energy\nBlessed with Vedic Mantras',
    });
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      discountPercent: p.discountPercent || 0,
      category: p.category || 'General',
      image: p.image || '',
      inStock: p.inStock ?? true,
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      featuresText: (p.features || []).join('\n'),
    });
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
      const res = await fetch('/api/admin/upload-image', {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const features = formData.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Product = {
      id: formData.id || `prod-${Date.now()}`,
      slug,
      name: formData.name,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || undefined,
      discountPercent: Number(formData.discountPercent) || undefined,
      category: formData.category,
      image: formData.image,
      inStock: formData.inStock,
      shortDescription: formData.shortDescription,
      description: formData.description,
      features,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadProducts();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save product' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error saving product' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadProducts();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#1346af] mb-1">
            <Gem size={16} />
            <span className="uppercase tracking-wider">Merchandise Catalog</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Products Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage energized sacred products, pricing, stock availability, images, and descriptions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1346af] hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, slug, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-[#1346af]" />
            <p className="text-xs">Loading products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Gem size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing search query or add a new product</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Gem size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 font-serif">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {p.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-[11px] text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.inStock ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          <CheckCircle2 size={12} />
                          <span>In Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          <XCircle size={12} />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-[#1346af] rounded-lg hover:bg-blue-50 transition"
                          title="View on public store"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-[#1346af] rounded-lg hover:bg-slate-100 transition"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Product"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs sm:text-sm">
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

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Karodon Ka Dollar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. karodon-ka-dollar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />
                </div>
              </div>

              {/* Pricing & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Dollar, Khushboo, Tilak..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="inStockToggle"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1346af] focus:ring-blue-500"
                />
                <label htmlFor="inStockToggle" className="font-semibold text-slate-800 cursor-pointer">
                  In Stock &amp; Available for Purchase
                </label>
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700">Product Image</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/products/dollar.jpg or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                  />

                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition">
                    <UploadCloud size={16} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-[11px] text-slate-400">Preview:</span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-slate-200">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Short Catchy Summary</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Special energized Karodon Ka Dollar for abundance and prosperity."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full spiritual and material description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af]"
                />
              </div>

              {/* Features List */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Key Features (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Consecrated and Energized&#10;Premium Metallic Crafting&#10;Attracts Positive Financial Energy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1346af] font-mono text-xs"
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
                  className="px-6 py-2.5 rounded-xl bg-[#1346af] hover:bg-blue-700 text-white font-semibold shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
