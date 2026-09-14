import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getMySQLPool, initializeDatabaseTables } from '../db/database';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'arb_super_secure_jwt_token_secret_998877';

export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByPhoneAsync(phone: string): Promise<User | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    await initializeDatabaseTables();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE phone = ? LIMIT 1',
      [cleanPhone]
    ) as [any[], any];

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        phone: r.phone,
        name: r.name || undefined,
        email: r.email || undefined,
        passwordHash: r.password_hash || undefined,
        role: r.role || 'customer',
        avatar: r.avatar || undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('[userStore] findUserByPhoneAsync error:', err);
  }
  return null;
}

export async function findUserByIdAsync(id: string): Promise<User | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    await initializeDatabaseTables();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    ) as [any[], any];

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        phone: r.phone,
        name: r.name || undefined,
        email: r.email || undefined,
        passwordHash: r.password_hash || undefined,
        role: r.role || 'customer',
        avatar: r.avatar || undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('[userStore] findUserByIdAsync error:', err);
  }
  return null;
}

export async function createUserAsync(phone: string, name?: string, email?: string): Promise<User> {
  const pool = getMySQLPool();
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query(
        'INSERT INTO users (id, phone, name, email, role) VALUES (?, ?, ?, ?, ?)',
        [id, cleanPhone, name || null, email ? email.trim().toLowerCase() : null, 'customer']
      );
    } catch (err) {
      console.error('[userStore] createUserAsync error:', err);
    }
  }

  return {
    id,
    phone: cleanPhone,
    name: name || undefined,
    email: email || undefined,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
}

export async function updateUserPasswordAsync(userId: string, rawPassword: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  try {
    await initializeDatabaseTables();
    const hash = await hashPasswordAsync(rawPassword);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hash, userId]
    );
    return true;
  } catch (err) {
    console.error('[userStore] updateUserPasswordAsync error:', err);
    return false;
  }
}

export async function updateUserProfileAsync(userId: string, data: { name?: string; email?: string }): Promise<User | null> {
  const pool = getMySQLPool();
  if (!pool) return null;

  try {
    await initializeDatabaseTables();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name ? data.name.trim() : null);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email ? data.email.trim().toLowerCase() : null);
    }

    if (updates.length > 0) {
      values.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return findUserByIdAsync(userId);
  } catch (err) {
    console.error('[userStore] updateUserProfileAsync error:', err);
    return null;
  }
}

export async function generateAndSaveOtpAsync(phone: string): Promise<{ otp: string; expiresAt: Date }> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('UPDATE otps SET verified = TRUE WHERE phone = ?', [cleanPhone]);
      await pool.query(
        'INSERT INTO otps (phone, otp_code, expires_at, verified) VALUES (?, ?, ?, FALSE)',
        [cleanPhone, otp, expiresAt]
      );
    } catch (err) {
      console.error('[userStore] generateAndSaveOtpAsync error:', err);
    }
  }

  return { otp, expiresAt };
}

export async function verifyOtpAsync(phone: string, otpCode: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const cleanCode = otpCode.trim();

  // Test bypass: allow 123456 as master test OTP
  if (cleanCode === '123456') {
    return true;
  }

  const pool = getMySQLPool();
  if (!pool) return false;

  try {
    await initializeDatabaseTables();
    const [rows] = await pool.query(
      'SELECT * FROM otps WHERE phone = ? AND otp_code = ? AND verified = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [cleanPhone, cleanCode]
    ) as [any[], any];

    if (rows && rows.length > 0) {
      await pool.query('UPDATE otps SET verified = TRUE WHERE id = ?', [rows[0].id]);
      return true;
    }
  } catch (err) {
    console.error('[userStore] verifyOtpAsync error:', err);
  }

  return false;
}

// ---------------- USER ADDRESSES ----------------

export async function getUserAddressesAsync(userId: string): Promise<UserAddress[]> {
  const pool = getMySQLPool();
  if (!pool) return [];

  try {
    await initializeDatabaseTables();
    const [rows] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    ) as [any[], any];

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        fullName: r.full_name,
        phone: r.phone,
        altPhone: r.alt_phone || undefined,
        streetAddress: r.street_address,
        landmark: r.landmark || undefined,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        isDefault: Boolean(r.is_default),
      }));
    }
  } catch (err) {
    console.error('[userStore] getUserAddressesAsync error:', err);
  }
  return [];
}

export async function saveUserAddressAsync(
  userId: string,
  addr: Omit<UserAddress, 'id' | 'userId'> & { id?: string }
): Promise<UserAddress> {
  const pool = getMySQLPool();
  const id = addr.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (pool) {
    try {
      await initializeDatabaseTables();
      if (addr.isDefault) {
        await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      }

      const query = `
        INSERT INTO user_addresses (id, user_id, full_name, phone, alt_phone, street_address, landmark, city, state, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          phone = VALUES(phone),
          alt_phone = VALUES(alt_phone),
          street_address = VALUES(street_address),
          landmark = VALUES(landmark),
          city = VALUES(city),
          state = VALUES(state),
          pincode = VALUES(pincode),
          is_default = VALUES(is_default);
      `;

      await pool.query(query, [
        id,
        userId,
        addr.fullName,
        addr.phone,
        addr.altPhone || null,
        addr.streetAddress,
        addr.landmark || null,
        addr.city,
        addr.state,
        addr.pincode,
        addr.isDefault ? 1 : 0,
      ]);
    } catch (err) {
      console.error('[userStore] saveUserAddressAsync error:', err);
    }
  }

  return {
    id,
    userId,
    fullName: addr.fullName,
    phone: addr.phone,
    altPhone: addr.altPhone,
    streetAddress: addr.streetAddress,
    landmark: addr.landmark,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    isDefault: addr.isDefault,
  };
}

export async function deleteUserAddressAsync(userId: string, addressId: string): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  try {
    await initializeDatabaseTables();
    await pool.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    return true;
  } catch (err) {
    console.error('[userStore] deleteUserAddressAsync error:', err);
    return false;
  }
}

// ---------------- JWT SESSIONS ----------------

export function createCustomerSessionToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyCustomerSessionToken(token: string): {
  userId: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.userId) {
      return {
        userId: decoded.userId,
        phone: decoded.phone,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}