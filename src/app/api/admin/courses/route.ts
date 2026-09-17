import { NextRequest, NextResponse } from 'next/server';
import { getCoursesAsync, saveCourseAsync, deleteCourseAsync, Course } from '@/lib/db/cmsStore';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const courses = await getCoursesAsync();
    return NextResponse.json({ success: true, data: courses, courses });
  } catch (error: any) {
    console.error('[API /api/admin/courses GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required.' }, { status: 400 });
    }

    const course: Course = {
      id: body.id || `course-${Date.now()}`,
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || '',
      description: body.description || '',
      category: body.category || 'Spiritual Wisdom',
      level: body.level || 'All Levels',
      instructor: body.instructor || { name: 'Aacharya Ji', title: 'Vedic Master' },
      thumbnail: body.thumbnail || '/images/blog/sacred-morning-rituals.svg',
      trailerVideoUrl: body.trailerVideoUrl || '',
      price: Number(body.price) || 0,
      originalPrice: Number(body.originalPrice) || 0,
      rating: Number(body.rating) || 5.0,
      reviewsCount: Number(body.reviewsCount) || 0,
      totalDuration: body.totalDuration || '4 Hours',
      totalLessons: Number(body.totalLessons) || (body.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0),
      language: body.language || 'Hindi & English',
      whatYouWillLearn: body.whatYouWillLearn || [],
      requirements: body.requirements || [],
      certificateEnabled: Boolean(body.certificateEnabled),
      status: body.status || 'published',
      modules: body.modules || [],
    };

    await saveCourseAsync(course);
    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error('[API /api/admin/courses POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Course ID is required.' }, { status: 400 });
    }

    await deleteCourseAsync(id);
    return NextResponse.json({ success: true, message: 'Course deleted successfully.' });
  } catch (error: any) {
    console.error('[API /api/admin/courses DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
