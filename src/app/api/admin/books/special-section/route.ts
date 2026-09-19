import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import {
  DEFAULT_LAKSHMI_SPECIAL_SECTION,
  getLakshmiSpecialSectionAsync,
  saveLakshmiSpecialSectionAsync,
} from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const config = await getLakshmiSpecialSectionAsync();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const config = {
      ...DEFAULT_LAKSHMI_SPECIAL_SECTION,
      id: 'lakshmi-journey',
      enabled: body.enabled !== false,
      digitalImage:
        typeof body.digitalImage === 'string' && body.digitalImage.trim()
          ? body.digitalImage.trim()
          : DEFAULT_LAKSHMI_SPECIAL_SECTION.digitalImage,
      comboImage:
        typeof body.comboImage === 'string' && body.comboImage.trim()
          ? body.comboImage.trim()
          : DEFAULT_LAKSHMI_SPECIAL_SECTION.comboImage,
      physicalImage:
        typeof body.physicalImage === 'string' && body.physicalImage.trim()
          ? body.physicalImage.trim()
          : DEFAULT_LAKSHMI_SPECIAL_SECTION.physicalImage,
    };

    await saveLakshmiSpecialSectionAsync(config);

    return NextResponse.json({
      success: true,
      message: 'Lakshmi special section updated successfully.',
      config,
    });
  } catch (err) {
    console.error('[admin/books/special-section] Error:', err);
    return NextResponse.json(
      { error: 'Failed to save Lakshmi special section.' },
      { status: 500 }
    );
  }
}
