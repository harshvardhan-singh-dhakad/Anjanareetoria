"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, Calendar, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { blogs as defaultBlogs, BlogPost } from '@/data/blogs';

export const BlogCatalogClient: React.FC<{ initialBlogs?: BlogPost[] }> = ({ initialBlogs }) => {
  const blogs = initialBlogs && initialBlogs.length > 0 ? initialBlogs : defaultBlogs;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogs.map((b) => b.category)));
    return ['All', ...cats];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, blogs]);

  const featuredPost = useMemo(() => {
    return blogs.find((b) => b.featured) || blogs[0];
  }, [blogs]);

  return (
    <div className="w-full bg-[#fafbfc] min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0008c1] to-[#0d2296] text-white py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-[1240px] mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-blue-200 border border-white/20">
            <Sparkles size={14} className="text-amber-300" />
            <span>Spiritual Insights &amp; Prosperity Wisdom</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
            The AR Blessings Journal
          </h1>

          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            In-depth guides on ancient Vedic manifestation laws, sacred geometry, spatial Vastu alignments, and daily abundance rituals for modern seekers.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 -mt-7 relative z-20 space-y-10">
        {/* Search & Categories Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-[#0008c1] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics, mantras, or tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:border-[#0008c1] focus:ring-1 focus:ring-[#0008c1] outline-none transition"
            />
          </div>
        </div>

        {/* Featured Story Banner (Shown when no search/filter is active or when featured is in result) */}
        {selectedCategory === 'All' && !searchQuery && featuredPost && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="relative aspect-[16/9] lg:aspect-auto lg:col-span-7 bg-slate-900 overflow-hidden">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                    Featured Spotlight
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-[#0008c1] font-semibold">
                    {featuredPost.category}
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 group-hover:text-[#0008c1] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={13} />
                    <span>{featuredPost.publishedDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock size={13} />
                    <span>{featuredPost.readTimeMinutes} min read</span>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#1346af] hover:bg-[#3a3a3a] text-white text-xs sm:text-sm font-semibold py-3 px-5 rounded-xl transition shadow-sm"
                >
                  <span>Read Complete Article</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
              {searchQuery
                ? `Search Results (${filteredBlogs.length})`
                : selectedCategory === 'All'
                ? 'Latest Articles & Guides'
                : `${selectedCategory} Articles (${filteredBlogs.length})`}
            </h3>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-lg mx-auto">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No articles found</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                We couldn&apos;t find any articles matching your search. Try searching for a different keyword.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 text-xs font-semibold text-[#0008c1] hover:underline"
              >
                View all articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredBlogs.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Image container */}
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] w-full bg-slate-900 block overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3 bg-[#0008c1]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      {post.category}
                    </span>
                  </Link>

                  {/* Body container */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{post.publishedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{post.readTimeMinutes} min read</span>
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0008c1] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        {post.author.name}
                      </span>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#0008c1] hover:text-[#1346af] transition"
                      >
                        <span>Read</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Spiritual Guidance / Newsletter Box */}
        <div className="bg-gradient-to-r from-[#0008c1] to-[#1346af] rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              Stay Aligned with Divine Auspiciousness
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Get weekly Vedic astrological alerts, Shubh Muhurta windows, and exclusive invitations to new consecrated book releases directly.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="px-4 py-3 rounded-xl text-xs sm:text-sm text-gray-900 bg-white placeholder-gray-400 outline-none w-full sm:w-64 focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => alert("Thank you for subscribing! May prosperity and blessings guide your path.")}
              className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition shadow-md whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
