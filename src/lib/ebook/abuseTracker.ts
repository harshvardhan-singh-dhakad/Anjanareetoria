import fs from 'fs';
import path from 'path';
import { DATA_DIR, ensureStorageDirs } from './storage';

export interface AccessLogEntry {
  orderId: string;
  ip: string;
  userAgent: string;
  timestamp: number;
}

export interface FlaggedOrderSummary {
  orderId: string;
  distinctIpCount: number;
  distinctIps: string[];
  totalViews: number;
  lastAccessed: number;
  flagged: boolean;
  reason?: string;
}

const LOGS_FILE = path.join(DATA_DIR, 'access_logs.json');
const MULTI_IP_THRESHOLD = 3; // Flag if accessed from > 3 distinct IPs in 24h

function readLogs(): AccessLogEntry[] {
  ensureStorageDirs();
  if (!fs.existsSync(LOGS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[abuseTracker] Error reading access logs:', err);
    return [];
  }
}

function writeLogs(logs: AccessLogEntry[]): void {
  ensureStorageDirs();
  // Keep last 2000 log entries to prevent infinite growth
  const trimmed = logs.slice(-2000);
  fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2));
}

/**
 * Logs an e-book view request.
 */
export function logEbookAccess(orderId: string, ip: string, userAgent: string): void {
  const logs = readLogs();
  logs.push({
    orderId: orderId.toUpperCase(),
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    timestamp: Date.now(),
  });
  writeLogs(logs);
}

/**
 * Inspects access logs from the last 24 hours and flags orders
 * accessed from more than N distinct IPs.
 */
export function getAbuseReport(): {
  flaggedOrders: FlaggedOrderSummary[];
  recentLogs: AccessLogEntry[];
} {
  const logs = readLogs();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((l) => l.timestamp >= oneDayAgo);

  // Group by orderId
  const orderMap = new Map<string, { ips: Set<string>; total: number; lastTime: number }>();

  for (const log of recentLogs) {
    const existing = orderMap.get(log.orderId) || {
      ips: new Set<string>(),
      total: 0,
      lastTime: log.timestamp,
    };
    existing.ips.add(log.ip);
    existing.total += 1;
    existing.lastTime = Math.max(existing.lastTime, log.timestamp);
    orderMap.set(log.orderId, existing);
  }

  const flaggedOrders: FlaggedOrderSummary[] = [];

  orderMap.forEach((data, orderId) => {
    const isFlagged = data.ips.size >= MULTI_IP_THRESHOLD;
    flaggedOrders.push({
      orderId,
      distinctIpCount: data.ips.size,
      distinctIps: Array.from(data.ips),
      totalViews: data.total,
      lastAccessed: data.lastTime,
      flagged: isFlagged,
      reason: isFlagged
        ? `Accessed from ${data.ips.size} distinct IP addresses within 24 hours`
        : undefined,
    });
  });

  // Sort with flagged first, then highest distinct IPs
  flaggedOrders.sort((a, b) => {
    if (a.flagged && !b.flagged) return -1;
    if (!a.flagged && b.flagged) return 1;
    return b.distinctIpCount - a.distinctIpCount;
  });

  return {
    flaggedOrders,
    recentLogs: logs.slice(-50).reverse(), // Last 50 accesses
  };
}
