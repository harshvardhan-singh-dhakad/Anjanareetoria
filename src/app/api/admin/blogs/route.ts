import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getBlogsAsync, saveBlogAsync, deleteBlogAsync, ExtendedBlogPost } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const blogs = await getBlogsAsync();
  return NextResponse.json({ success: true, blogs });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.excerpt) {
      return NextResponse.json({ error: 'Article title and excerpt are required.' }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const blog: ExtendedBlogPost = {
      id: body.id || `post-${Date.now().toString().slice(-4)}`,
      slug,
      title: body.title,
      excerpt: body.excerpt,
      coverImage: body.coverImage || '/images/blog/sacred-morning-rituals.svg',
      category: body.category || 'Manifestation & Wealth',
      tags: Array.isArray(body.tags) ? body.tags : ['Spiritual', 'Abundance'],
      author: {
        name: body.author?.name || 'AR Blessings Council',
        role: body.author?.role || 'Vedic Guidance Masters',
        avatar: body.author?.avatar,
      },
      publishedDate: body.publishedDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTimeMinutes: Number(body.readTimeMinutes || 5),
      featured: Boolean(body.featured),
      htmlContent: body.htmlContent || undefined,
      content: body.content || {
        introduction: body.excerpt,
        sections: [
          {
            heading: 'Key Spiritual Insights',
            body: [body.excerpt],
            tip: 'Focus on your morning vibrations for immediate shift.'
          }
        ],
        conclusion: 'Harmonize your actions with sacred intent.'
      },
      relatedProductSlugs: Array.isArray(body.relatedProductSlugs) ? body.relatedProductSlugs : [],
      relatedBookSlugs: Array.isArray(body.relatedBookSlugs) ? body.relatedBookSlugs : [],
    };

    await saveBlogAsync(blog);
    return NextResponse.json({ success: true, message: 'Article saved successfully.', blog });
  } catch (err: unknown) {
    console.error('[admin/blogs] Error:', err);
    return NextResponse.json({ error: 'Failed to save article.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Article ID required.' }, { status: 400 });
  }

  await deleteBlogAsync(id);
  return NextResponse.json({ success: true, message: 'Article deleted.' });
}
