const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'pp360_token';
const USER_KEY = 'pp360_user';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  /** Populated role document from the backend (has `name`, permissions, etc.). */
  role?: any;
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

/** Display name for the user's role, e.g. "Admin". */
export const roleLabel = (user: AuthUser | null): string => {
  const r: any = user?.role;
  if (!r) return 'User';
  return typeof r === 'string' ? r : r.name || 'User';
};

/**
 * Adds the Bearer token to request headers. Every apiService call uses this so
 * JWT-protected routes (contracts, attendance, time-off, payroll-config,
 * departments, job-positions, working-schedules, roles) stop returning 401.
 */
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
  if (!res.ok) {
    throw new Error(json?.message || json?.error || 'Invalid email or password');
  }

  // Backend wraps responses as { success, message, data }, but tolerate a flat shape.
  const payload = json?.data ?? json;
  const token: string | undefined = payload?.token;
  const user: AuthUser | undefined = payload?.user;

  if (!token || !user) throw new Error('Login response did not include a token');

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Validates the stored token against the backend; returns null if invalid/expired. */
export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const user = json?.data?.user ?? json?.data ?? json?.user ?? null;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    // Network/timeout: keep the cached session rather than logging the user out.
    return getStoredUser();
  }
}
