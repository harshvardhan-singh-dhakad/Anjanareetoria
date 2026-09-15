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

const SEED_ORDERS: EbookOrder[] = [
  {
    orderId: 'ARB-88991',
    buyerPhone: '9876543210',
    buyerEmail: 'rajesh.sharma@example.com',
    productId: 'bk-101',
    paymentId: 'pay_demo_88991',
    purchaseTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    amount: 500,
    status: 'paid',
  },
  {
    orderId: 'ARB-50021',
    buyerPhone: '9988776655',
    buyerEmail: 'priya.verma@example.com',
    productId: 'bk-101',
    paymentId: 'pay_demo_50021',
    purchaseTimestamp: Date.now() - 5 * 60 * 60 * 1000,
    amount: 500,
    status: 'paid',
  }
];

function readOrdersFromDisk(): EbookOrder[] {
  ensureStorageDirs();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2));
    return SEED_ORDERS;
  }
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[orderStore] Error reading orders file:', err);
    return SEED_ORDERS;
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
      console.error('[orderStore] MySQL query error, falling back to disk:', err);
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
      console.error('[orderStore] MySQL query error, falling back to disk:', err);
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
  saveOrder(order);
  const pool = getMySQLPool();
  if (pool) {
    try {
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
    } catch (err) {
      console.error('[orderStore] MySQL saveOrder error:', err);
    }
  }
}

export function getAllOrders(): EbookOrder[] {
  return readOrdersFromDisk();
}

export async function getAllOrdersAsync(): Promise<EbookOrder[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC') as [any[], any];
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
      console.error('[orderStore] MySQL getAllOrders error, falling back to disk:', err);
    }
  }
  return getAllOrders();
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
