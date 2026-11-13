import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Auth is cookie-based (httpOnly), so the frontend can't read the token.
// We track the logged-in user by calling GET /auth/me on load and after login.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch (err) {
      // 401 means not logged in — not an error to surface
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (creds) => {
    await apiLogin(creds);
    await refresh();
  };

  const register = async (data) => {
    await apiSignup(data);
    await refresh();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore — clear local state regardless */
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
