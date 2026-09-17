import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import { getWebinarsAsync, saveWebinarAsync, deleteWebinarAsync, Webinar } from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const webinars = await getWebinarsAsync();
  return NextResponse.json({ success: true, webinars, data: webinars });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.dateTime) {
      return NextResponse.json({ error: 'Webinar title and date/time are required.' }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const webinar: Webinar = {
      id: body.id || `web-${Date.now().toString().slice(-4)}`,
      slug,
      title: body.title,
      subtitle: body.subtitle || '',
      description: body.description || '',
      speaker: {
        name: body.speaker?.name || 'Spiritual Guide',
        title: body.speaker?.title || 'Vedic Mentor',
        image: body.speaker?.image || '/images/testimonials/review-1.png',
      },
      dateTime: body.dateTime,
      duration: body.duration || '90 Minutes',
      price: Number(body.price || 0),
      registrationUrl: body.registrationUrl || 'https://meet.google.com',
      status: body.status || 'upcoming',
      bannerImage: body.bannerImage || '/images/blog/sacred-morning-rituals.svg',
      agenda: Array.isArray(body.agenda) ? body.agenda : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      whoShouldAttend: Array.isArray(body.whoShouldAttend) ? body.whoShouldAttend : [],
    };

    await saveWebinarAsync(webinar);
    return NextResponse.json({ success: true, message: 'Webinar saved successfully.', webinar });
  } catch (err: unknown) {
    console.error('[admin/webinars] Error:', err);
    return NextResponse.json({ error: 'Failed to save webinar.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Webinar ID required.' }, { status: 400 });
  }

  await deleteWebinarAsync(id);
  return NextResponse.json({ success: true, message: 'Webinar deleted.' });
}
