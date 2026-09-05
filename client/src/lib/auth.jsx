import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './api.js';

// Role ranking for coarse UI gating (higher = more access).
export const ROLE_RANK = {
  employee: 0, hr_manager: 1, hr_payroll_user: 2, hr_payroll_manager: 3, admin: 4,
};
export const ROLE_LABEL = {
  employee: 'Employee', hr_manager: 'HR Manager', hr_payroll_user: 'Payroll User',
  hr_payroll_manager: 'Payroll Manager', admin: 'Admin',
};

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pp_user')); } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('pp_user', JSON.stringify(user));
    else localStorage.removeItem('pp_user');
  }, [user]);

  const login = async (email, password) => {
    const { token, user: u } = await apiRequest('post', '/auth/login', { email, password });
    localStorage.setItem('pp_token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    setUser(null);
  };

  // Does the current user's role meet a minimum rank?
  const can = (minRole) => !!user && ROLE_RANK[user.role] >= ROLE_RANK[minRole];

  return <AuthCtx.Provider value={{ user, login, logout, can }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
