import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.EBOOK_JWT_SECRET || 'arblessings-vps-ebook-secret-key-2024-secure';

export interface SessionTokenPayload {
  orderId: string;
  buyerPhone: string;
  buyerEmail?: string;
  type: 'session';
}

export interface StreamTokenPayload {
  orderId: string;
  buyerPhone: string;
  type: 'stream';
}

/**
 * Creates a 24-hour buyer session JWT for cookie authentication.
 */
export function createSessionToken(payload: {
  orderId: string;
  buyerPhone: string;
  buyerEmail?: string;
}): string {
  return jwt.sign(
    {
      orderId: payload.orderId,
      buyerPhone: payload.buyerPhone,
      buyerEmail: payload.buyerEmail,
      type: 'session',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verifies a buyer session JWT.
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionTokenPayload;
    if (decoded.type !== 'session') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Creates a short-lived (15-minute), single-purpose access token
 * specifically for streaming the watermarked PDF.
 */
export function createStreamToken(payload: {
  orderId: string;
  buyerPhone: string;
}): string {
  return jwt.sign(
    {
      orderId: payload.orderId,
      buyerPhone: payload.buyerPhone,
      type: 'stream',
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Verifies the single-purpose stream token.
 */
export function verifyStreamToken(token: string): StreamTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as StreamTokenPayload;
    if (decoded.type !== 'stream') return null;
    return decoded;
  } catch {
    return null;
  }
}
