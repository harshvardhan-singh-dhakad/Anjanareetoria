import { NextResponse } from 'next/server';
import { getCourseBySlugAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await getCourseBySlugAsync(params.slug);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('[API /api/courses/[slug]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}
