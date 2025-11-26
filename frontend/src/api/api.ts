import axios, { type AxiosInstance } from "axios";

// API Gateway Configuration
const API_GATEWAY_URL = "http://127.0.0.1:8000";
const API_VERSION = "v1";

// Konfigurasi dasar untuk semua API requests melalui API Gateway
const apiGatewayConfig = {
  withCredentials: true,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-Gateway": "true", // Header untuk identifikasi request dari frontend
  },
};

// Base API instance untuk health checks dan general endpoints
export const baseApi = axios.create({
  baseURL: API_GATEWAY_URL,
  ...apiGatewayConfig,
});

// Auth Service API - melalui API Gateway
export const authApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/api/${API_VERSION}/auth`,
  ...apiGatewayConfig,
});

// Room Service API - melalui API Gateway
export const roomApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/api/${API_VERSION}/rooms`,
  ...apiGatewayConfig,
});

// Booking Service API - melalui API Gateway
export const bookingApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/api/${API_VERSION}/bookings`,
  ...apiGatewayConfig,
}); // Reporting Service API - melalui API Gateway
export const reportingApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/api/${API_VERSION}/reports`,
  ...apiGatewayConfig,
});

// Notification Service API - melalui API Gateway
export const notificationApi = axios.create({
  baseURL: `${API_GATEWAY_URL}/api/${API_VERSION}/notifications`,
  ...apiGatewayConfig,
});

// Set JWT token untuk semua API instances
export function setAuthToken(token: string | null) {
  const header = token ? `Bearer ${token}` : "";

  // Set authorization header untuk semua API instances
  authApi.defaults.headers.common["Authorization"] = header;
  roomApi.defaults.headers.common["Authorization"] = header;
  bookingApi.defaults.headers.common["Authorization"] = header;
  reportingApi.defaults.headers.common["Authorization"] = header;
  notificationApi.defaults.headers.common["Authorization"] = header;
  baseApi.defaults.headers.common["Authorization"] = header;
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

// Response interceptor untuk error handling dan token refresh
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Clear stored token if unauthorized
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Only redirect if not already on login page
    if (window.location.pathname !== "/login") {
      console.warn("Unauthorized access - redirecting to login");
      window.location.href = "/login";
    }
  } else if (error.response?.status === 403) {
    console.error("Forbidden - insufficient permissions");
  } else if (error.response?.status >= 500) {
    console.error(
      "Server error:",
      error.response?.data?.message || "Internal server error"
    );
  } else if (error.code === "NETWORK_ERROR") {
    console.error("Network error - API Gateway might be down");
  }

  return Promise.reject(error);
};

// Request interceptor untuk menambah metadata request
const handleApiRequest = (config: any) => {
  // Add request timestamp for monitoring
  config.metadata = { startTime: Date.now() };

  // Add request ID for tracing (akan di-generate oleh API Gateway juga)
  config.headers["X-Request-Source"] = "frontend";

  return config;
};

// Response interceptor untuk logging dan monitoring
const handleApiResponse = (response: any) => {
  // Log response time untuk monitoring
  if (response.config.metadata?.startTime) {
    const duration = Date.now() - response.config.metadata.startTime;
    console.debug(`API Request to ${response.config.url} took ${duration}ms`);
  }

  return response;
};

// Apply interceptors untuk semua API instances
const allApiInstances = [
  authApi,
  roomApi,
  bookingApi,
  reportingApi,
  notificationApi,
  baseApi,
];

allApiInstances.forEach((instance) => {
  // Request interceptor
  instance.interceptors.request.use(handleApiRequest, (error) =>
    Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(handleApiResponse, handleApiError);
});

// Utility functions
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// API Gateway health check function
export async function checkApiGatewayHealth() {
  try {
    const response = await baseApi.get("/health");
    return {
      isHealthy: response.data.status === "healthy",
      services: response.data.services || {},
      timestamp: response.data.timestamp,
    };
  } catch (error) {
    console.error("API Gateway health check failed:", error);
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get API Gateway information
export async function getApiInfo() {
  try {
    const response = await baseApi.get("/");
    return response.data;
  } catch (error) {
    console.error("Failed to get API info:", error);
    throw error;
  }
}

// Export API Gateway configuration for external use
export const API_CONFIG = {
  GATEWAY_URL: API_GATEWAY_URL,
  API_VERSION,
  ENDPOINTS: {
    auth: `${API_GATEWAY_URL}/api/${API_VERSION}/auth`,
    rooms: `${API_GATEWAY_URL}/api/${API_VERSION}/rooms`,
    bookings: `${API_GATEWAY_URL}/api/${API_VERSION}/bookings`,
    reports: `${API_GATEWAY_URL}/api/${API_VERSION}/reports`,
    notifications: `${API_GATEWAY_URL}/api/${API_VERSION}/notifications`,
    health: `${API_GATEWAY_URL}/health`,
    docs: `${API_GATEWAY_URL}/api/docs`,
  },
};
