import fs from 'fs';
import path from 'path';
import { DATA_DIR, ensureStorageDirs } from './storage';

export interface EbookOrder {
  orderId: string;
  buyerPhone: string;
  buyerEmail: string;
  productId: string;
  paymentId: string;
  purchaseTimestamp: number;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

const SEED_ORDERS: EbookOrder[] = [
  {
    orderId: 'ARB-88991',
    buyerPhone: '9876543210',
    buyerEmail: 'rajesh.sharma@example.com',
    productId: 'bk-101',
    paymentId: 'pay_demo_88991',
    purchaseTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    amount: 500,
    status: 'paid',
  },
  {
    orderId: 'ARB-50021',
    buyerPhone: '9988776655',
    buyerEmail: 'priya.verma@example.com',
    productId: 'bk-101',
    paymentId: 'pay_demo_50021',
    purchaseTimestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
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

/**
 * Finds an order by buyer phone and order ID.
 * Normalizes phone numbers (removes spaces, dashes, +91 prefixes).
 */
export function findOrderByPhoneAndOrderId(phone: string, orderId: string): EbookOrder | null {
  const orders = readOrdersFromDisk();
  const cleanInputPhone = phone.replace(/\D/g, '').slice(-10);
  const cleanInputOrderId = orderId.trim().toUpperCase();

  const found = orders.find((o) => {
    const cleanDbPhone = o.buyerPhone.replace(/\D/g, '').slice(-10);
    const cleanDbOrderId = o.orderId.trim().toUpperCase();
    return cleanDbPhone === cleanInputPhone && cleanDbOrderId === cleanInputOrderId;
  });

  return found || null;
}

/**
 * Finds an order by its order ID.
 */
export function findOrderById(orderId: string): EbookOrder | null {
  const orders = readOrdersFromDisk();
  const cleanId = orderId.trim().toUpperCase();
  return orders.find((o) => o.orderId.trim().toUpperCase() === cleanId) || null;
}

/**
 * Creates or updates an order in the store.
 */
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

/**
 * Returns all orders.
 */
export function getAllOrders(): EbookOrder[] {
  return readOrdersFromDisk();
}
