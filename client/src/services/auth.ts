const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'pp360_token';
const USER_KEY = 'pp360_user';
const PERMS_KEY = 'pp360_perms';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: any; // populated role document
}

export interface AuthContextData {
  user: AuthUser | null;
  permissions: string[];
  isAdmin: boolean;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const getStoredPerms = (): { permissions: string[]; isAdmin: boolean } => {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    return raw ? JSON.parse(raw) : { permissions: [], isAdmin: false };
  } catch {
    return { permissions: [], isAdmin: false };
  }
};

const storePerms = (permissions: string[], isAdmin: boolean) =>
  localStorage.setItem(PERMS_KEY, JSON.stringify({ permissions, isAdmin }));

export const roleLabel = (user: AuthUser | null): string => {
  const r: any = user?.role;
  if (!r) return 'User';
  return typeof r === 'string' ? r : r.name || 'User';
};

/** Bearer header for authenticated requests (used by every apiService call). */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || 'Invalid email or password');

  const payload = json?.data ?? json;
  if (!payload?.token || !payload?.user) throw new Error('Login response did not include a token');

  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  return payload.user;
}

export async function register(email: string, password: string, name: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || 'Registration failed');

  return json?.data ?? json;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PERMS_KEY);
}

/**
 * Fetches the current user with permissions + isAdmin (login alone doesn't
 * return permissions — /auth/me does). Drives all RBAC gating in the UI.
 */
export async function fetchMe(): Promise<AuthContextData | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null; // token invalid/expired
    const json = await res.json();
    const d = json?.data ?? json;
    const user: AuthUser = d?.user ?? d;
    const permissions: string[] = d?.permissions ?? [];
    const isAdmin: boolean = !!d?.isAdmin;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    storePerms(permissions, isAdmin);
    return { user, permissions, isAdmin };
  } catch {
    // Network/timeout: keep the cached session instead of logging out.
    const cached = getStoredPerms();
    return { user: getStoredUser(), permissions: cached.permissions, isAdmin: cached.isAdmin };
  }
}
