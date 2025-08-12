import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  authApi,
  baseApi,
  getCookie,
  roomApi,
  bookingApi,
  reportingApi,
} from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
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
  const [user, setUser]     = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]    = useState<string|null>(null);

  // 1) set/remove header Authorization
  const setAuthHeader = (token: string|null) => {
    const headerKey = "Authorization";
    const bearer   = token ? `Bearer ${token}` : null;
    [authApi, roomApi, bookingApi, reportingApi].forEach((api) => {
      if (bearer) {
        api.defaults.headers.common[headerKey] = bearer;
      } else {
        delete api.defaults.headers.common[headerKey];
      }
    });
  };

  // 2) fetch current user profile
  const fetchUser = async () => {
    try {
      const res = await authApi.get("/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 3) init: baca token & set header, lalu fetchUser
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setAuthHeader(stored);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // 4) login
  const login = async (email: string, password: string) => {
    await baseApi.get("/sanctum/csrf-cookie");
    const xsrf = getCookie("XSRF-TOKEN");
    if (!xsrf) throw new Error("Gagal baca XSRF-TOKEN");
    authApi.defaults.headers.common["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);

    const res = await authApi.post("/login", { email, password });
    const accessToken = res.data.access_token;
    localStorage.setItem("token", accessToken);

    setToken(accessToken);
    setAuthHeader(accessToken);
    await fetchUser();
  };

  // 5) register
  const register = async (name: string, email: string, password: string) => {
    await baseApi.get("/sanctum/csrf-cookie");
    await authApi.post("/register", { name, email, password });
    await fetchUser();
  };

  // 6) logout
  const logout = async () => {
    try {
      await authApi.post("/logout");
    } catch (e) {
      console.error("Logout gagal:", e);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setAuthHeader(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      token
    }}>
      {children}
    </AuthContext.Provider>
  );
};
