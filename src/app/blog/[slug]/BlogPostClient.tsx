"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Share2,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lightbulb,
  ShoppingBag,
  BookOpen
} from 'lucide-react';
import { BlogPost, blogs } from '@/data/blogs';
import { products } from '@/data/products';
import { books } from '@/data/books';

export const BlogPostClient: React.FC<{ post: BlogPost }> = ({ post }) => {
  const [copied, setCopied] = useState(false);

  // Find related products and books
  const relatedProducts = (post.relatedProductSlugs || [])
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  const relatedBooks = (post.relatedBookSlugs || [])
    .map((slug) => books.find((b) => b.slug === slug))
    .filter(Boolean);

  // Find previous and next articles
  const currentIndex = blogs.findIndex((b) => b.slug === post.slug);
  const prevPost = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const nextPost = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <article className="w-full bg-[#fafbfc] min-h-screen pb-16">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-b from-[#0008c1] to-[#0a187a] text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Breadcrumbs */}
          <nav className="text-xs text-blue-200 flex items-center space-x-2">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <span>/</span>
            <span className="text-blue-100 font-medium line-clamp-1">{post.title}</span>
          </nav>

          {/* Category & Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber-400 text-gray-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center space-x-3 text-xs text-blue-200">
              <span className="flex items-center space-x-1">
                <Calendar size={13} />
                <span>{post.publishedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock size={13} />
                <span>{post.readTimeMinutes} min read</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif leading-tight text-white">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-gray-950 font-bold flex items-center justify-center text-sm shadow-md">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {post.author.name}
                </div>
                <div className="text-xs text-blue-200">
                  {post.author.role}
                </div>
              </div>
            </div>

            {/* Share action */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition border border-white/20"
                aria-label="Share article"
              >
                {copied ? <Check size={14} className="text-amber-300" /> : <Share2 size={14} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content Container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 -mt-6 relative z-20 space-y-10">
        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-gray-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8 text-gray-800 leading-relaxed font-sans">
          {/* Introduction Excerpt */}
          <div className="text-base sm:text-lg text-gray-700 font-serif leading-relaxed border-l-4 border-[#0008c1] pl-5 italic bg-blue-50/30 py-3 rounded-r-xl">
            {post.content.introduction}
          </div>

          {/* Sections */}
          {post.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-4 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0008c1]">
                {section.heading}
              </h2>

              {section.body.map((para, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {para}
                </p>
              ))}

              {/* Tip Callout if available */}
              {section.tip && (
                <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs sm:text-sm text-amber-950 my-4 shadow-sm">
                  <Lightbulb size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-900 mb-0.5">
                      Sacred Abundance Insight:
                    </strong>
                    <span>{section.tip}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <h3 className="text-lg font-bold font-serif text-gray-900">
              Harmonizing Your Journey
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold mr-2">Keywords:</span>
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Essentials & Literature Callout */}
        {(relatedProducts.length > 0 || relatedBooks.length > 0) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-[#0008c1]" />
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#0008c1]">
                Recommended Sacred Essentials &amp; Publications
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Deepen the lessons explored in this article with authentically consecrated essentials and companion books:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Related Products */}
              {relatedProducts.slice(0, 2).map((prod) => prod && (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#0008c1] uppercase tracking-wider block">
                      Sacred Token
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {prod.name}
                    </h4>
                    <div className="text-xs font-bold text-[#0008c1] mt-0.5">
                      ₹{prod.price}
                    </div>
                  </div>
                  <Link
                    href={`/product/${prod.slug}`}
                    className="p-2 rounded-full bg-blue-50 text-[#0008c1] hover:bg-[#0008c1] hover:text-white transition flex-shrink-0"
                    aria-label={`View ${prod.name}`}
                  >
                    <ShoppingBag size={16} />
                  </Link>
                </div>
              ))}

              {/* Related Books */}
              {relatedBooks.slice(0, 2).map((bk) => bk && (
                <div
                  key={bk.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition"
                >
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                    <Image
                      src={bk.image}
                      alt={bk.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      Companion Book
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {bk.name}
                    </h4>
                    <div className="text-xs font-bold text-[#0008c1] mt-0.5">
                      ₹{bk.price} • {bk.formatType === 'ebook' ? 'E-Book' : 'Book & E-Book'}
                    </div>
                  </div>
                  <Link
                    href={`/books/${bk.slug}`}
                    className="p-2 rounded-full bg-amber-50 text-amber-900 hover:bg-[#0008c1] hover:text-white transition flex-shrink-0"
                    aria-label={`View ${bk.name}`}
                  >
                    <BookOpen size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous / Next Article Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0008c1] transition flex items-center space-x-3 group"
            >
              <ArrowLeft size={18} className="text-gray-400 group-hover:text-[#0008c1] transition" />
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Previous Article
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block group-hover:text-[#0008c1] transition">
                  {prevPost.title}
                </span>
              </div>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0008c1] transition flex items-center justify-between space-x-3 group text-right"
            >
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Next Article
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 truncate block group-hover:text-[#0008c1] transition">
                  {nextPost.title}
                </span>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-[#0008c1] transition flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </article>
  );
};
