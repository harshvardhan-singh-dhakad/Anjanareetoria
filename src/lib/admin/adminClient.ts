"use client";

/**
 * Utility for authorized Admin API requests.
 * Transmits both the HTTP-only cookie and the Bearer token stored in localStorage.
 */

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('admin_token');
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('admin_token', token);
  } catch {}
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('admin_token');
  } catch {}
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }

  return response;
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {}
  clearAdminToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}
