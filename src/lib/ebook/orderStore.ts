import fs from 'fs';
import path from 'path';
import { DATA_DIR, ensureStorageDirs } from './storage';
import { getMySQLPool, initializeDatabaseTables } from '../db/database';

export interface EbookOrder {
  orderId: string;
  buyerPhone: string;
  buyerEmail: string;
  productId: string;
  paymentId: string;
  purchaseTimestamp: number;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  viewToken?: string;
  accessCount?: number;
  firstAccessedAt?: string;
  itemType?: 'product' | 'book' | 'webinar';
  itemTitle?: string;
  customerName?: string;
  shippingAddress?: string;
  metadata?: any;
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const SEED_ORDERS: EbookOrder[] = [];

function readOrdersFromDisk(): EbookOrder[] {
  ensureStorageDirs();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[orderStore] Error reading orders file:', err);
    return [];
  }
}

function writeOrdersToDisk(orders: EbookOrder[]): void {
  ensureStorageDirs();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function findOrderByPhoneAndOrderId(phone: string, orderId: string): EbookOrder | null {
  const orders = readOrdersFromDisk();
  const cleanInputPhone = phone.replace(/\D/g, '');
  const cleanInputOrderId = orderId.trim().toUpperCase();

  const found = orders.find((o) => {
    const cleanDbPhone = o.buyerPhone.replace(/\D/g, '');
    const cleanDbOrderId = o.orderId.trim().toUpperCase();
    return cleanDbPhone === cleanInputPhone && cleanDbOrderId === cleanInputOrderId;
  });

  return found || null;
}

export async function findOrderByPhoneAndOrderIdAsync(phone: string, orderId: string): Promise<EbookOrder | null> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanId = orderId.trim().toUpperCase();
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE buyer_phone = ? AND order_id = ? LIMIT 1',
        [cleanPhone, cleanId]
      ) as [any[], any];

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          orderId: r.order_id,
          paymentId: r.payment_id,
          buyerEmail: r.buyer_email,
          buyerPhone: r.buyer_phone,
          productId: r.product_id,
          amount: r.amount,
          status: r.status.toLowerCase() as any,
          viewToken: r.view_token || undefined,
          accessCount: r.access_count || 0,
          firstAccessedAt: r.first_accessed_at || undefined,
          purchaseTimestamp: new Date(r.created_at).getTime(),
        };
      }
    } catch (err) {
      console.error('[orderStore] MySQL query error:', err);
      throw err;
    }
  }
  return findOrderByPhoneAndOrderId(phone, orderId);
}

export function findOrderById(orderId: string): EbookOrder | null {
  const orders = readOrdersFromDisk();
  const cleanId = orderId.trim().toUpperCase();
  return orders.find((o) => o.orderId.trim().toUpperCase() === cleanId) || null;
}

export async function findOrderByIdAsync(orderId: string): Promise<EbookOrder | null> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const cleanId = orderId.trim().toUpperCase();
      const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ? LIMIT 1', [cleanId]) as [any[], any];
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          orderId: r.order_id,
          paymentId: r.payment_id,
          buyerEmail: r.buyer_email,
          buyerPhone: r.buyer_phone,
          productId: r.product_id,
          amount: r.amount,
          status: r.status.toLowerCase() as any,
          viewToken: r.view_token || undefined,
          accessCount: r.access_count || 0,
          firstAccessedAt: r.first_accessed_at || undefined,
          purchaseTimestamp: new Date(r.created_at).getTime(),
        };
      }
    } catch (err) {
      console.error('[orderStore] MySQL query error:', err);
      throw err;
    }
  }
  return findOrderById(orderId);
}

export function saveOrder(order: EbookOrder): void {
  const orders = readOrdersFromDisk();
  const existingIdx = orders.findIndex((o) => o.orderId.toUpperCase() === order.orderId.toUpperCase());
  if (existingIdx >= 0) {
    orders[existingIdx] = order;
  } else {
    orders.unshift(order);
  }
  writeOrdersToDisk(orders);
}

export async function saveOrderAsync(order: EbookOrder): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    await initializeDatabaseTables();
    const query = `
      INSERT INTO orders (
        order_id, payment_id, buyer_email, buyer_phone, product_id, amount, status,
        view_token, access_count, first_accessed_at, item_type, item_title, customer_name, shipping_address, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        payment_id = VALUES(payment_id),
        buyer_email = VALUES(buyer_email),
        buyer_phone = VALUES(buyer_phone),
        product_id = VALUES(product_id),
        amount = VALUES(amount),
        status = VALUES(status),
        view_token = VALUES(view_token),
        access_count = VALUES(access_count),
        first_accessed_at = VALUES(first_accessed_at),
        item_type = VALUES(item_type),
        item_title = VALUES(item_title),
        customer_name = VALUES(customer_name),
        shipping_address = VALUES(shipping_address),
        metadata = VALUES(metadata);
    `;
    await pool.query(query, [
      order.orderId.toUpperCase(),
      order.paymentId,
      order.buyerEmail,
      order.buyerPhone.replace(/\D/g, ''),
      order.productId,
      order.amount,
      order.status.toUpperCase(),
      order.viewToken || null,
      order.accessCount || 0,
      order.firstAccessedAt || null,
      order.itemType || 'product',
      order.itemTitle || null,
      order.customerName || null,
      order.shippingAddress || null,
      order.metadata ? JSON.stringify(order.metadata) : null,
    ]);
    return;
  }

  // Local development only. Production must have MySQL configured.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MYSQL_NOT_CONFIGURED');
  }
  saveOrder(order);
}

export function getAllOrders(): EbookOrder[] {
  return readOrdersFromDisk();
}

export async function getAllOrdersAsync(): Promise<EbookOrder[]> {
  const pool = getMySQLPool();
  if (pool) {
    await initializeDatabaseTables();
    try {
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC') as [any[], any];
      return (rows || []).map((r) => ({
        orderId: r.order_id,
        paymentId: r.payment_id,
        buyerEmail: r.buyer_email,
        buyerPhone: r.buyer_phone,
        productId: r.product_id,
        amount: r.amount,
        status: r.status.toLowerCase() as any,
        viewToken: r.view_token || undefined,
        accessCount: r.access_count || 0,
        firstAccessedAt: r.first_accessed_at || undefined,
        itemType: r.item_type || 'product',
        itemTitle: r.item_title || undefined,
        customerName: r.customer_name || undefined,
        shippingAddress: r.shipping_address || undefined,
        metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : undefined,
        purchaseTimestamp: new Date(r.created_at).getTime(),
      }));
    } catch (err) {
      console.error('[orderStore] MySQL getAllOrders error:', err);
      throw err;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MYSQL_NOT_CONFIGURED');
  }
  return getAllOrders();
}

export async function findOrdersByCustomerAsync(criteria: { email?: string; phone?: string }): Promise<EbookOrder[]> {
  const cleanEmail = (criteria.email || '').trim().toLowerCase();
  const cleanPhone = criteria.phone ? criteria.phone.replace(/\D/g, '').slice(-10) : '';
  const pool = getMySQLPool();
  if (pool && (cleanEmail || cleanPhone)) {
    try {
      await initializeDatabaseTables();
      const conditions: string[] = [];
      const params: any[] = [];

      if (cleanEmail) {
        conditions.push('LOWER(buyer_email) = ?');
        params.push(cleanEmail);
      }
      if (cleanPhone) {
        conditions.push('buyer_phone LIKE ?');
        params.push(`%${cleanPhone}`);
      }

      const [rows] = await pool.query(
        `SELECT * FROM orders WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC`,
        params
      ) as [any[], any];

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          orderId: r.order_id,
          paymentId: r.payment_id,
          buyerEmail: r.buyer_email,
          buyerPhone: r.buyer_phone,
          productId: r.product_id,
          amount: r.amount,
          status: r.status.toLowerCase() as any,
          viewToken: r.view_token || undefined,
          accessCount: r.access_count || 0,
          firstAccessedAt: r.first_accessed_at || undefined,
          itemType: r.item_type || 'product',
          itemTitle: r.item_title || undefined,
          customerName: r.customer_name || undefined,
          shippingAddress: r.shipping_address || undefined,
          metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : undefined,
          purchaseTimestamp: new Date(r.created_at).getTime(),
        }));
      }
    } catch (err) {
      console.error('[orderStore] MySQL findOrdersByCustomerAsync error:', err);
    }
  }
  return getAllOrders().filter((o) => {
    const matchEmail = cleanEmail && (o.buyerEmail || '').toLowerCase() === cleanEmail;
    const matchPhone = cleanPhone && (o.buyerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone;
    return matchEmail || matchPhone;
  });
}

export async function findOrdersByPhoneAsync(phone: string): Promise<EbookOrder[]> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE buyer_phone LIKE ? ORDER BY created_at DESC',
        [`%${cleanPhone}`]
      ) as [any[], any];
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          orderId: r.order_id,
          paymentId: r.payment_id,
          buyerEmail: r.buyer_email,
          buyerPhone: r.buyer_phone,
          productId: r.product_id,
          amount: r.amount,
          status: r.status.toLowerCase() as any,
          viewToken: r.view_token || undefined,
          accessCount: r.access_count || 0,
          firstAccessedAt: r.first_accessed_at || undefined,
          itemType: r.item_type || 'product',
          itemTitle: r.item_title || undefined,
          customerName: r.customer_name || undefined,
          shippingAddress: r.shipping_address || undefined,
          metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : undefined,
          purchaseTimestamp: new Date(r.created_at).getTime(),
        }));
      }
    } catch (err) {
      console.error('[orderStore] MySQL findOrdersByPhone error, falling back to disk:', err);
    }
  }
  const all = readOrdersFromDisk();
  return all.filter((o) => o.buyerPhone.replace(/\D/g, '').slice(-10) === cleanPhone);
}
