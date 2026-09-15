import { NextResponse } from 'next/server';
import { getCoursesAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let courses = await getCoursesAsync();
    // Filter to published courses for public view
    courses = courses.filter((c) => c.status === 'published');

    if (category && category !== 'all') {
      courses = courses.filter((c) => c.category.toLowerCase().includes(category.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    console.error('[API /api/courses] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
