import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin/adminAuth';
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettingsFromMySQLAsync,
  saveSiteSettingsToMySQLAsync,
} from '@/lib/db/cmsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const settings = await getSiteSettingsFromMySQLAsync();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[admin/site-settings] GET failed:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to load site settings.',
      settings: DEFAULT_SITE_SETTINGS,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = body?.settings;
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object is required.' }, { status: 400 });
    }

    const saved = await saveSiteSettingsToMySQLAsync({
      ...DEFAULT_SITE_SETTINGS,
      ...settings,
      videos: Array.isArray(settings.videos) ? settings.videos : [],
      testimonials: Array.isArray(settings.testimonials) ? settings.testimonials : [],
    });

    return NextResponse.json({ success: true, settings: saved });
  } catch (error: any) {
    console.error('[admin/site-settings] POST failed:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to save site settings.',
    }, { status: 500 });
  }
}
