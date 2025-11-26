// API Client untuk Room Booking System menggunakan API Gateway
import {
  authApi,
  roomApi,
  bookingApi,
  reportingApi,
  notificationApi,
  setAuthToken,
} from "./api";

// ===============================
// AUTH API METHODS
// ===============================
export const authClient = {
  async login(email: string, password: string) {
    const response = await authApi.post("/login", {
      email,
      password,
    });

    // Set token jika login berhasil
    if (response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async register(name: string, email: string, password: string) {
    const response = await authApi.post("/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    try {
      await authApi.post("/logout");
    } finally {
      // Clear token regardless of response
      setAuthToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  async getCurrentUser() {
    const response = await authApi.get("/me");
    return response.data;
  },

  async updateProfile(userData: any) {
    const response = await authApi.put("/profile", userData);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await authApi.post("/change-password", {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await authApi.post("/forgot-password", {
      email,
    });
    return response.data;
  },

  async resetPassword(token: string, email: string, password: string) {
    const response = await authApi.post("/reset-password", {
      token,
      email,
      password,
      password_confirmation: password,
    });
    return response.data;
  },
};

// ===============================
// ROOM API METHODS
// ===============================
export const roomClient = {
  async getAllRooms(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await roomApi.get("/", { params });
    return response.data;
  },

  async getRoomById(id: number) {
    const response = await roomApi.get(`/${id}`);
    return response.data;
  },

  async createRoom(roomData: any) {
    const response = await roomApi.post("/", roomData);
    return response.data;
  },

  async updateRoom(id: number, roomData: any) {
    const response = await roomApi.put(`/${id}`, roomData);
    return response.data;
  },

  async deleteRoom(id: number) {
    const response = await roomApi.delete(`/${id}`);
    return response.data;
  },

  async checkAvailability(id: number, startDate: string, endDate: string) {
    const response = await roomApi.get(`/${id}/availability`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async searchRooms(searchParams: any) {
    const response = await roomApi.get("/search", {
      params: searchParams,
    });
    return response.data;
  },
};

// ===============================
// BOOKING API METHODS
// ===============================
export const bookingClient = {
  async getUserBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const response = await bookingApi.get("/", { params });
    return response.data;
  },

  async getBookingById(id: number) {
    const response = await bookingApi.get(`/${id}`);
    return response.data;
  },

  async createBooking(bookingData: any) {
    const response = await bookingApi.post("/", bookingData);
    return response.data;
  },

  async updateBooking(id: number, bookingData: any) {
    const response = await bookingApi.put(`/${id}`, bookingData);
    return response.data;
  },

  async cancelBooking(id: number) {
    const response = await bookingApi.delete(`/${id}`);
    return response.data;
  },

  async confirmBooking(id: number) {
    const response = await bookingApi.post(`/${id}/confirm`);
    return response.data;
  },

  async getBookingCalendar(roomId: number) {
    const response = await bookingApi.get(`/calendar/${roomId}`);
    return response.data;
  },

  async getTodaySchedule() {
    const response = await bookingApi.get("/schedule/today");
    return response.data;
  },

  async getWeekSchedule() {
    const response = await bookingApi.get("/schedule/week");
    return response.data;
  },

  async getMonthSchedule() {
    const response = await bookingApi.get("/schedule/month");
    return response.data;
  },
};

// ===============================
// REPORTING API METHODS
// ===============================
export const reportClient = {
  async getUsageReport(
    from: string,
    to: string,
    format: "json" | "pdf" | "csv" = "json"
  ) {
    const response = await reportingApi.get("/usage", {
      params: { from, to, format },
    });
    return response.data;
  },

  async getBookingReport(
    from: string,
    to: string,
    format: "json" | "pdf" | "csv" = "json"
  ) {
    const response = await reportingApi.get("/bookings", {
      params: { from, to, format },
    });
    return response.data;
  },

  async getRoomUtilizationReport(
    from?: string,
    to?: string,
    format: "json" | "pdf" | "csv" = "json"
  ) {
    const response = await reportingApi.get("/rooms", {
      params: { from, to, format },
    });
    return response.data;
  },

  async getUserActivityReport(
    from?: string,
    to?: string,
    format: "json" | "pdf" | "csv" = "json"
  ) {
    const response = await reportingApi.get("/users", {
      params: { from, to, format },
    });
    return response.data;
  },

  async getDashboardStats() {
    const response = await reportingApi.get("/dashboard");
    return response.data;
  },

  async getAnalytics(
    metric?: string,
    period: "day" | "week" | "month" | "year" = "month"
  ) {
    const response = await reportingApi.get("/analytics", {
      params: { metric, period },
    });
    return response.data;
  },
};

// ===============================
// NOTIFICATION API METHODS
// ===============================
export const notificationClient = {
  async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
  }) {
    const response = await notificationApi.get("/", { params });
    return response.data;
  },

  async getNotificationById(id: number) {
    const response = await notificationApi.get(`/${id}`);
    return response.data;
  },

  async markAsRead(id: number) {
    const response = await notificationApi.put(`/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await notificationApi.put("/mark-all-read");
    return response.data;
  },

  async deleteNotification(id: number) {
    const response = await notificationApi.delete(`/${id}`);
    return response.data;
  },

  async getNotificationPreferences() {
    const response = await notificationApi.get("/preferences");
    return response.data;
  },

  async updateNotificationPreferences(preferences: any) {
    const response = await notificationApi.put("/preferences", preferences);
    return response.data;
  },

  async sendNotification(notificationData: any) {
    const response = await notificationApi.post("/", notificationData);
    return response.data;
  },
};

// ===============================
// COMBINED CLIENT EXPORT
// ===============================
export const apiClient = {
  auth: authClient,
  rooms: roomClient,
  bookings: bookingClient,
  reports: reportClient,
  notifications: notificationClient,
};

export default apiClient;
