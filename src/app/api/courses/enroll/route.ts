import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerSessionToken } from '@/lib/auth/userStore';
import { getCourseBySlugAsync, enrollUserInCourse, getUserEnrollmentsAsync } from '@/lib/db/cmsStore';
import { findOrderByPhoneAndOrderIdAsync } from '@/lib/ebook/orderStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, phone, name, orderId } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Course ID is required.' }, { status: 400 });
    }

    // Determine user phone from session or body
    const cookieToken = req.cookies.get('customer_session')?.value;
    const session = cookieToken ? verifyCustomerSessionToken(cookieToken) : null;
    const cleanPhone = (session?.phone || phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Valid 10-digit mobile number required to enroll.' },
        { status: 401 }
      );
    }

    const course = await getCourseBySlugAsync(courseId);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
    }

    // Check if user already enrolled
    const existingEnrollments = await getUserEnrollmentsAsync(cleanPhone);
    const alreadyEnrolled = existingEnrollments.find((e) => e.courseId === course.id || e.courseId === course.slug);
    if (alreadyEnrolled) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        enrollment: alreadyEnrolled,
        classroomUrl: `/learn/${course.slug}`,
      });
    }

    // If course is paid and no orderId, verify order
    if (course.price > 0 && !orderId) {
      return NextResponse.json(
        { success: false, requiresPayment: true, error: 'Payment required for this course.' },
        { status: 402 }
      );
    }

    if (orderId) {
      const verifiedOrder = await findOrderByPhoneAndOrderIdAsync(cleanPhone, orderId);
      if (!verifiedOrder || verifiedOrder.status !== 'paid') {
        return NextResponse.json(
          { success: false, error: 'Payment order could not be validated.' },
          { status: 400 }
        );
      }
    }

    const enrollment = await enrollUserInCourse(cleanPhone, cleanPhone, course.id, orderId);

    return NextResponse.json({
      success: true,
      enrollment,
      classroomUrl: `/learn/${course.slug}`,
      message: 'Successfully enrolled into course!',
    });
  } catch (error: any) {
    console.error('[API /api/courses/enroll] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Enrollment failed.' },
      { status: 500 }
    );
  }
}
