import axios, { type AxiosInstance } from "axios";

// Konfigurasi dasar untuk instance Axios yang membutuhkan autentikasi
const sanctumConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const baseApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

// Auth Service API
export const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  ...sanctumConfig,
  withCredentials: true,
});

// Room Service API
export const roomApi = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
  ...sanctumConfig,
});

// Booking Service API
export const bookingApi = axios.create({
  baseURL: "http://127.0.0.1:8002/api",
  ...sanctumConfig,
});

// Reporting Service API
export const reportingApi = axios.create({
  baseURL: "http://127.0.0.1:8003/api",
  ...sanctumConfig,
});

export function setAuthToken(token: string | null) {
  const header = token ? `Bearer ${token}` : "";
  roomApi.defaults.headers.common["Authorization"] = header;
  bookingApi.defaults.headers.common["Authorization"] = header;
  authApi.defaults.headers.common["Authorization"] = header;
  reportingApi.defaults.headers.common["Authorization"] = header;
}

// DIHAPUS: Interceptor untuk CSRF tidak diperlukan di sini.
// Pemanggilan CSRF cookie akan ditangani secara manual sebelum
// aksi yang membutuhkannya (misal: sebelum login).
/*
const setupCsrfInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(async (config) => {
    // INI PENDEKATAN YANG SALAH DAN TIDAK EFISIEN
    await axios.get("http://127.0.0.1:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });
    return config;
  });
};
[roomApi, authApi, bookingApi, reportingApi].forEach(setupCsrfInterceptor);
*/

// Global error handling untuk semua instance
const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    // HANYA redirect jika pengguna TIDAK sedang berada di halaman login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
};

// Terapkan interceptor untuk penanganan error ke semua instance
[roomApi, authApi, bookingApi, reportingApi].forEach((instance) => {
  instance.interceptors.response.use((response) => response, handleAuthError);
});

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}
