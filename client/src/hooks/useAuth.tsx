import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser, getStoredUser, getToken, login as doLogin, logout as doLogout, fetchMe,
} from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken());

  // Revalidate a stored session on load so an expired token doesn't linger.
  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      const me = await fetchMe();
      if (cancelled) return;
      if (me) setUser(me);
      else {
        doLogout();
        setUser(null);
      }
      setIsLoading(false);
    }
    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const u = await doLogin(email, password);
    setUser(u);
    return u;
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
