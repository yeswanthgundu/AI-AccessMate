import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessmate_token") || null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success) {
            setUser(res.user);
            setPreferences(res.preferences);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      localStorage.setItem("accessmate_token", res.token);
      setToken(res.token);
      setUser(res.user);
      setPreferences(res.preferences);
      return res;
    }
    throw new Error(res.error || "Login failed");
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success) {
      localStorage.setItem("accessmate_token", res.token);
      setToken(res.token);
      setUser(res.user);
      setPreferences(res.preferences);
      return res;
    }
    throw new Error(res.error || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("accessmate_token");
    setToken(null);
    setUser(null);
    setPreferences(null);
  };

  const updatePrefs = async (newPrefs) => {
    try {
      const res = await authService.updatePreferences(newPrefs);
      if (res.success) {
        setPreferences(res.preferences);
        return res.preferences;
      }
    } catch (err) {
      console.warn("Could not sync preferences with server:", err.message);
    }
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        preferences,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updatePrefs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
