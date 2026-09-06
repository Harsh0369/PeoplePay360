import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser, getStoredUser, getStoredPerms, getToken,
  login as doLogin, logout as doLogout, fetchMe,
} from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  permissions: string[];
  isAdmin: boolean;
  /** The single business super admin — can manage admin roles and promote/demote admins. */
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** RBAC check: admin passes everything; otherwise the permission must be granted. */
  can: (...perms: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [permissions, setPermissions] = useState<string[]>(() => getStoredPerms().permissions);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getStoredPerms().isAdmin);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => getStoredPerms().isSuperAdmin);
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken());

  // Revalidate the stored session (and refresh permissions) on load.
  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      const ctx = await fetchMe();
      if (cancelled) return;
      if (ctx?.user) {
        setUser(ctx.user);
        setPermissions(ctx.permissions);
        setIsAdmin(ctx.isAdmin);
        setIsSuperAdmin(ctx.isSuperAdmin);
      } else {
        doLogout();
        setUser(null);
      }
      setIsLoading(false);
    }
    verify();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string) => {
    await doLogin(email, password);
    const ctx = await fetchMe(); // enrich with permissions
    if (ctx?.user) {
      setUser(ctx.user);
      setPermissions(ctx.permissions);
      setIsAdmin(ctx.isAdmin);
      setIsSuperAdmin(ctx.isSuperAdmin);
    }
  };

  const logout = () => {
    doLogout();
    setUser(null);
    setPermissions([]);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const can = (...perms: string[]) =>
    isAdmin || perms.length === 0 || perms.some((p) => permissions.includes(p));

  return (
    <AuthContext.Provider
      value={{ user, permissions, isAdmin, isSuperAdmin, isAuthenticated: !!user, isLoading, login, logout, can }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
