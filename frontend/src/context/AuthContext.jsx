import React, { createContext, useContext, useEffect, useState } from 'react';
import { me, login as loginApi, register as registerApi, logout as logoutApi } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load via cookie (no localStorage token needed)
  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    const r = await loginApi(data);
    setUser(r.user);
    return r;
  };

  const register = async (data) => {
    const r = await registerApi(data);
    setUser(r.user);
    return r;
  };

  const logout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
