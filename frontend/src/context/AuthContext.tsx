import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authClient } from "../api/client";
import { setAuthToken } from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ id: number; name: string }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Fetch current user profile menggunakan API Gateway
  const fetchUser = async () => {
    try {
      const userData = await authClient.getCurrentUser();
      setUser(userData.user || userData); // Handle different response formats
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize: check stored token and fetch user
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);

      // If we have stored user data, use it temporarily while fetching fresh data
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
        }
      }

      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Login function menggunakan API Gateway
  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.login(email, password);

      // Handle different response formats
      const tokenValue = response.token || response.access_token;
      const userData = response.user || response.data?.user;

      if (!tokenValue) {
        throw new Error("No token received from server");
      }

      setToken(tokenValue);
      setAuthToken(tokenValue);

      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }

      localStorage.setItem("token", tokenValue);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Register function menggunakan API Gateway
  const register = async (name: string, email: string, password: string) => {
    try {
      await authClient.register(name, email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Logout function menggunakan API Gateway
  const logout = async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
