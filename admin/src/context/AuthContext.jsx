import React, { createContext, useContext, useEffect, useState } from 'react';
import { request } from '../services/api';

const AuthContext = createContext(null);

const ALLOWED_ADMIN_ROLES = ['admin', 'pharmacist_reviewer', 'super_admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app mount via HttpOnly cookie
  useEffect(() => {
    request('/auth/me')
      .then((u) => {
        if (u && ALLOWED_ADMIN_ROLES.includes(u.role)) {
          setUser(u);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const userPayload = res.user;
    if (!userPayload || !ALLOWED_ADMIN_ROLES.includes(userPayload.role)) {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // ignore logout errors on failed check
      }
      throw new Error('Access denied: Your account role does not have admin portal privileges.');
    }

    setUser(userPayload);
    return userPayload;
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
  };

  const role = user?.role || '';
  const canReviewPrescriptions = ['pharmacist_reviewer', 'super_admin', 'admin'].includes(role);
  const isSuperAdmin = role === 'super_admin' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        role,
        canReviewPrescriptions,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
