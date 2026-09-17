import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.EBOOK_JWT_SECRET || process.env.JWT_SECRET || 'arblessings-vps-ebook-secret-key-2024-secure';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '40se40crore.merchandise@gmail.com';
export const ADMIN_PHONE = process.env.ADMIN_PHONE || '8433558905';
export const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'Mahadev@2026';
export const ADMIN_USERNAME = ADMIN_EMAIL;

export function createAdminToken(identifier?: string): string {
  return jwt.sign(
    {
      role: 'super_admin',
      email: ADMIN_EMAIL,
      user: identifier || ADMIN_EMAIL,
      permissions: ['all'],
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === 'admin' || decoded.role === 'super_admin';
  } catch {
    return false;
  }
}

export function getAdminSession(req: NextRequest): { authenticated: boolean; role?: string; user?: string } {
  const cookieToken = req.cookies.get('admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) return { authenticated: false };

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string; user?: string; email?: string };
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      return {
        authenticated: true,
        role: decoded.role,
        user: decoded.user || decoded.email || ADMIN_EMAIL
      };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const session = getAdminSession(req);
  return session.authenticated;
}
