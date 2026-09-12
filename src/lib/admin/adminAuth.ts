import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.EBOOK_JWT_SECRET || 'arblessings-vps-ebook-secret-key-2024-secure';
export const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'arblessings@admin2024';
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

export function createAdminToken(): string {
  return jwt.sign(
    { role: 'admin', user: ADMIN_USERNAME, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieToken = req.cookies.get('admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) return false;
  return verifyAdminToken(token);
}
