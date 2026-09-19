"use client";

import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  UploadCloud,
  RefreshCw,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { adminFetch } from '@/lib/admin/adminClient';
import type { SiteSettings, SiteVideoItem, SiteTestimonialItem } from '@/lib/db/cmsStore';

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminFetch('/api/admin/site-settings');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load site settings.');
      setSettings(data.settings);
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to load site settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const uploadImage = async (file: File, key: string, apply: (url: string) => void) => {
    setUploadingKey(key);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await adminFetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) throw new Error(data.error || 'Image upload failed.');
      apply(data.url);
      setMessage({ type: 'success', text: 'Image uploaded to persistent CMS media storage.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Image upload failed.' });
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Save failed.');
      setSettings(data.settings);
      setMessage({ type: 'success', text: 'Saved to MySQL. Public website reads these settings on the next request.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const addVideo = () => {
    if (!settings) return;
    const next: SiteVideoItem = {
      id: crypto.randomUUID(),
      title: 'New Video',
      subtitle: '',
      poster: '',
      sources: [],
      enabled: true,
    };
    update('videos', [...settings.videos, next]);
  };

  const addTestimonial = () => {
    if (!settings) return;
    const next: SiteTestimonialItem = {
      id: crypto.randomUUID(),
      src: '',
      alt: 'Client Review',
      enabled: true,
    };
    update('testimonials', [...settings.testimonials, next]);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#1346af]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1346af] uppercase tracking-wider">
            <Settings size={16} /> Global Website CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">Site Content & Media</h1>
          <p className="text-sm text-slate-500 mt-1">Hero, posters, testimonials, topbar, footer and homepage copy. Saved content is MySQL-backed and survives deployment.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50" title="Reload">
            <RefreshCw size={16} />
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2">
            <ExternalLink size={14} /> Live Site
          </a>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><ImageIcon size={17} /> Brand & Hero</h2>

          {[
            ['topbarText','Top Bar Text'],
            ['heroLink','Hero Click URL'],
            ['heroAlt','Hero Alt Text'],
            ['productsKicker','Products Kicker'],
            ['productsTitle','Products Heading'],
            ['booksKicker','Books Kicker'],
            ['booksTitle','Books Heading'],
            ['booksDescription','Books Description'],
            ['videosKicker','Videos Kicker'],
            ['videosTitle','Videos Heading'],
            ['testimonialsKicker','Testimonials Kicker'],
            ['testimonialsTitle','Testimonials Heading'],
            ['footerDescription','Footer Description'],
            ['instagramUrl','Instagram URL'],
          ].map(([key,label]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{label}</label>
              {String(key).toLowerCase().includes('description') || key === 'topbarText' ? (
                <textarea
                  rows={key === 'booksDescription' || key === 'footerDescription' ? 3 : 2}
                  value={String(settings[key as keyof SiteSettings] ?? '')}
                  onChange={e => update(key as keyof SiteSettings, e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              ) : (
                <input
                  value={String(settings[key as keyof SiteSettings] ?? '')}
                  onChange={e => update(key as keyof SiteSettings, e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'logoUrl', label: 'Logo', accept: 'image/*' },
              { key: 'heroImage', label: 'Hero Banner / Poster', accept: 'image/*' },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">{item.label}</label>
                <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                  <img src={String(settings[item.key as keyof SiteSettings] || '')} alt={item.label} className="w-full h-full object-contain" />
                </div>
                <input
                  value={String(settings[item.key as keyof SiteSettings] || '')}
                  onChange={e => update(item.key as keyof SiteSettings, e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
                  <UploadCloud size={14} /> {uploadingKey === item.key ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept={item.accept}
                    className="hidden"
                    disabled={uploadingKey === item.key}
                    onChange={e => {
                      const file=e.target.files?.[0];
                      if (file) uploadImage(file, item.key, url => update(item.key as keyof SiteSettings, url as any));
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Homepage Videos / Posters</h2>
              <p className="text-xs text-slate-500">Add, edit, reorder by moving items in the array, or remove posters/videos.</p>
            </div>
            <button onClick={addVideo} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5"><Plus size={14}/> Add</button>
          </div>
          <div className="space-y-5">
            {settings.videos.map((video, index) => (
              <div key={video.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={video.title} onChange={e => update('videos', settings.videos.map((v,i)=>i===index?{...v,title:e.target.value}:v))} placeholder="Title" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs" />
                    <input value={video.subtitle} onChange={e => update('videos', settings.videos.map((v,i)=>i===index?{...v,subtitle:e.target.value}:v))} placeholder="Subtitle" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs" />
                  </div>
                  <button onClick={() => update('videos', settings.videos.filter((_,i)=>i!==index))} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Remove"><Trash2 size={15}/></button>
                </div>
                <input value={video.poster} onChange={e => update('videos', settings.videos.map((v,i)=>i===index?{...v,poster:e.target.value}:v))} placeholder="Poster image URL" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs" />
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold">
                  <UploadCloud size={14}/> Upload Poster
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingKey===`video-${index}`} onChange={e=>{const f=e.target.files?.[0];if(f)uploadImage(f,`video-${index}`,url=>update('videos',settings.videos.map((v,i)=>i===index?{...v,poster:url}:v)))}} />
                </label>
                <textarea
                  rows={3}
                  value={video.sources.join('\n')}
                  onChange={e => update('videos', settings.videos.map((v,i)=>i===index?{...v,sources:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)}:v))}
                  placeholder="One video source URL/path per line"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" checked={video.enabled !== false} onChange={e=>update('videos',settings.videos.map((v,i)=>i===index?{...v,enabled:e.target.checked}:v))}/>
                  Visible on homepage
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900">Client Testimonials / Review Posters</h2>
            <p className="text-xs text-slate-500">Upload, edit URL/alt text, show/hide or delete any review poster.</p>
          </div>
          <button onClick={addTestimonial} className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5"><Plus size={14}/> Add Review Poster</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {settings.testimonials.map((item,index)=>(
            <div key={item.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden">
                {item.src ? <img src={item.src} alt={item.alt} className="w-full h-full object-contain"/> : <div className="h-full flex items-center justify-center text-slate-400"><ImageIcon size={24}/></div>}
              </div>
              <input value={item.alt} onChange={e=>update('testimonials',settings.testimonials.map((v,i)=>i===index?{...v,alt:e.target.value}:v))} placeholder="Alt text" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"/>
              <input value={item.src} onChange={e=>update('testimonials',settings.testimonials.map((v,i)=>i===index?{...v,src:e.target.value}:v))} placeholder="Image URL" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"/>
              <div className="flex items-center justify-between gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold flex items-center gap-1.5">
                  <UploadCloud size={13}/> Upload
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingKey===`testimonial-${index}`} onChange={e=>{const f=e.target.files?.[0];if(f)uploadImage(f,`testimonial-${index}`,url=>update('testimonials',settings.testimonials.map((v,i)=>i===index?{...v,src:url}:v)))}} />
                </label>
                <label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={item.enabled!==false} onChange={e=>update('testimonials',settings.testimonials.map((v,i)=>i===index?{...v,enabled:e.target.checked}:v))}/> Show</label>
                <button onClick={()=>update('testimonials',settings.testimonials.filter((_,i)=>i!==index))} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
