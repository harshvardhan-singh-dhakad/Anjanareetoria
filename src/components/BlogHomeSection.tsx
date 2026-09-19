import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { blogs as defaultBlogs, BlogPost } from '@/data/blogs';

export const BlogHomeSection: React.FC<{ initialBlogs?: BlogPost[] }> = ({ initialBlogs }) => {
  const displayBlogs = initialBlogs ?? defaultBlogs;
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold tracking-widest text-[#0008c1] uppercase mb-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>Sacred Knowledge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0008c1] font-serif">
              Latest from the Spiritual Journal
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl">
              Practical Vedic wisdom, sacred geometry principles, and energy cleansing guides written by our spiritual council.
            </p>
          </div>

          <Link
            href="/blog"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#0008c1] hover:text-[#1346af] transition"
          >
            <span>Read All Articles</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayBlogs.slice(0, 3).map((post) => (
            <article
              key={post.id}
              className="bg-[#fafbfc] rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] w-full bg-slate-900 block overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#0008c1] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {post.category}
                </span>
              </Link>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar size={11} />
                      <span>{post.publishedDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock size={11} />
                      <span>{post.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#0008c1] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">
                    {post.author.name}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#0008c1] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
