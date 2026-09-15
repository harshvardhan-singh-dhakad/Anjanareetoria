import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken } from '@/lib/auth/userStore';
import { updateLessonProgressAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, lessonId, completed = true, phone } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { success: false, error: 'courseId and lessonId are required.' },
        { status: 400 }
      );
    }

    const cookieToken = req.cookies.get('customer_session')?.value;
    const session = cookieToken ? verifyCustomerSessionToken(cookieToken) : null;
    const cleanPhone = (session?.phone || phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'User session or phone number required.' },
        { status: 401 }
      );
    }

    const result = await updateLessonProgressAsync(cleanPhone, courseId, lessonId, completed);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/courses/progress] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update progress.' },
      { status: 500 }
    );
  }
}
