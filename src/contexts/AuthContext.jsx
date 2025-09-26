import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const AUTH_TOKEN_KEY = "pf_access_token";
  const REFRESH_TOKEN_KEY = "pf_refresh_token";

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("pf_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("pf_user", JSON.stringify(user));
      // Also set a cookie for additional persistence
      document.cookie = `pf_user=${JSON.stringify(user)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    } else {
      localStorage.removeItem("pf_user");
      // Clear cookie
      document.cookie = "pf_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, [user]);

  // SIGNUP FUNCTION
  const signup = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/signup", userData);
      return res.data;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // LOGIN FUNCTION
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      // Set cookies for additional persistence
      document.cookie = `${AUTH_TOKEN_KEY}=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}`;

      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // LOGOUT FUNCTION
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.warn("Logout request failed:", error.response?.data || error.message);
    } finally {
      // Clear all storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("pf_user");

      // Clear cookies
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = "pf_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("pf_user");
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          logout();
        }
      }
    };

    checkAuth();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      signup,
      isLoading,
      isAuthenticated: !!user,
      isReadOnly: user?.role?.toLowerCase() === "read_only"
    }),
    [user, login, logout, signup, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
