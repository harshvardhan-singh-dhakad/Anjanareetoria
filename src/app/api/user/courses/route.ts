import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken } from '@/lib/auth/userStore';
import { getUserEnrollmentsAsync, getCoursesAsync } from '@/lib/db/cmsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('customer_session')?.value;
    const { searchParams } = new URL(req.url);
    const queryPhone = searchParams.get('phone');

    let phone = '';
    if (cookieToken) {
      const session = verifyCustomerSessionToken(cookieToken);
      if (session?.phone) phone = session.phone;
    }
    if (!phone && queryPhone) {
      phone = queryPhone;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to fetch enrolled courses.' },
        { status: 401 }
      );
    }

    const enrollments = await getUserEnrollmentsAsync(cleanPhone);
    const allCourses = await getCoursesAsync();

    const enrolledList = enrollments.map((enr) => {
      const course = allCourses.find((c) => c.id === enr.courseId || c.slug === enr.courseId);
      return {
        enrollmentId: enr.id,
        courseId: enr.courseId,
        courseSlug: course?.slug || enr.courseId,
        courseTitle: course?.title || 'Spiritual Masterclass',
        thumbnail: course?.thumbnail || '/images/blog/sacred-morning-rituals.svg',
        instructor: course?.instructor || { name: 'Aacharya Ji', title: 'Vedic Master' },
        totalLessons: course?.totalLessons || 10,
        totalDuration: course?.totalDuration || '5 Hours',
        progressPercentage: enr.progressPercentage || 0,
        completedLessonIds: enr.completedLessonIds || [],
        lastLessonId: enr.lastLessonId,
        enrolledAt: enr.enrolledAt,
        completedAt: enr.completedAt,
        classroomUrl: `/learn/${course?.slug || enr.courseId}`,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrolledList,
    });
  } catch (error: any) {
    console.error('[API /api/user/courses] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user courses.' },
      { status: 500 }
    );
  }
}
