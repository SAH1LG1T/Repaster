"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/validators";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole, name?: string, org?: string) => void;
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted session asynchronously to prevent cascading renders
    try {
      const stored = localStorage.getItem("repasters_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => {
          setUser(parsed);
          setIsLoading(false);
        });
        return;
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
    queueMicrotask(() => {
      setIsLoading(false);
    });
  }, []);

  const login = (email: string, role: UserRole = "SEEKER", name = "Community Member", org?: string) => {
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role,
      organizationName: org || null,
    };

    setUser(newUser);
    try {
      localStorage.setItem("repasters_user", JSON.stringify(newUser));
      if (typeof document !== "undefined") {
        document.cookie = `repasters_user=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch (e) {
      console.error("Failed to persist user session", e);
    }
  };

  const logout = (redirectTo = "/") => {
    setUser(null);
    try {
      localStorage.removeItem("repasters_user");
      sessionStorage.clear();
      // Clear all authentication cookies
      if (typeof document !== "undefined") {
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }
    } catch (e) {
      console.error("Failed to clear auth storage during logout:", e);
    }

    // Force clean redirect to the homepage
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
