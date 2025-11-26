import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { bookingApi } from "../api/api";
import { roomApi } from "../api/api";
import { authApi } from "../api/api";
import {
  FaChartLine,
  FaClock,
  FaUsers,
  FaCalendarDay,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimes,
  FaEye,
  FaPlus,
  FaArrowRight,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";

// --- PERBAIKAN: Komponen Ikon SVG untuk tampilan yang lebih baik ---
const MeetingRoomIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);
const EventAvailableIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const AnalyticsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    />
  </svg>
);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeBookings: 0,
    availableRooms: 0,
    totalBookingsToday: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    utilizationRate: 0,
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) peta cepat user_id -> user_name
  const userMap = useMemo(
    () =>
      users.reduce<Record<number, string>>((map, u) => {
        map[u.id] = u.name;
        return map;
      }, {}),
    [users]
  );

  // 2) Ambil semua data (rooms, bookings, users) sekaligus
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rRes, bRes, uRes] = await Promise.all([
          roomApi.get("/rooms"),
          bookingApi.get("/bookings"),
          authApi.get("/users"),
        ]);
        setRooms(rRes.data);
        setBookings(bRes.data);
        setUsers(uRes.data);
      } catch (err) {
        console.error("Fetch dashboard data failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 3) Hitung statistik rooms & activeBookings ketika rooms/bookings berubah
  useEffect(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const active = bookings.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return b.status !== "cancelled" && start <= now && now <= end;
    }).length;

    const todayBookings = bookings.filter((b) => {
      const start = new Date(b.start_time);
      return start >= today && start < tomorrow;
    }).length;

    const pending = bookings.filter((b) => b.status === "pending").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    const totalBookingHours = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((total, b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

    const maxPossibleHours = rooms.length * 24 * 30; // Assume 30 days
    const utilization =
      maxPossibleHours > 0 ? (totalBookingHours / maxPossibleHours) * 100 : 0;

    setStats({
      totalRooms: rooms.length,
      activeBookings: active,
      availableRooms: rooms.length - active,
      totalBookingsToday: todayBookings,
      pendingBookings: pending,
      cancelledBookings: cancelled,
      totalUsers: users.length,
      utilizationRate: Math.round(utilization),
    });
  }, [rooms, bookings, users]);

  // 4) Bangun daftar upcomingBooking ketika bookings, rooms, atau userMap berubah
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => b.status !== "cancelled" && new Date(b.start_time) > now)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      .slice(0, 3)
      .map((b) => {
        const room = rooms.find((r) => r.id === b.room_id);
        return {
          id: b.id,
          room: room?.name ?? `Unknown (ID:${b.room_id})`,
          time:
            `${new Date(b.start_time).toLocaleString()} – ` +
            new Date(b.end_time).toLocaleTimeString(),
          bookedBy: userMap[b.user_id] ?? `User #${b.user_id}`,
          status: b.status,
        };
      });
  }, [bookings, rooms, userMap]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mr-4 text-white font-bold text-2xl shadow-lg">
                <FaBuilding />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Room Booking System
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Comprehensive Management Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-right hidden sm:block mr-4">
                  <p className="text-lg font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-blue-100 text-sm capitalize">
                    {user?.roles?.[0]?.name?.toLowerCase() || "user"}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 transition-all duration-300 px-4 py-2"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back, {user?.name}! Here's what's happening today.
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-3xl font-bold">{stats.totalRooms}</div>
                    <div className="text-blue-100 text-sm font-medium">
                      Total Rooms
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaBuilding className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-3xl font-bold">
                      {stats.activeBookings}
                    </div>
                    <div className="text-green-100 text-sm font-medium">
                      Active Now
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaCheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-3xl font-bold">
                      {stats.totalBookingsToday}
                    </div>
                    <div className="text-purple-100 text-sm font-medium">
                      Today's Bookings
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaCalendarDay className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-3xl font-bold">
                      {stats.utilizationRate}%
                    </div>
                    <div className="text-indigo-100 text-sm font-medium">
                      Utilization Rate
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaChartLine className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white/70 backdrop-blur-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaHourglassHalf className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.pendingBookings}
                  </div>
                  <div className="text-gray-600 text-sm">Pending</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/70 backdrop-blur-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaTimes className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.cancelledBookings}
                  </div>
                  <div className="text-gray-600 text-sm">Cancelled</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/70 backdrop-blur-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaUsers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.totalUsers}
                  </div>
                  <div className="text-gray-600 text-sm">Total Users</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/70 backdrop-blur-md border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.availableRooms}
                  </div>
                  <div className="text-gray-600 text-sm">Available</div>
                </div>
              </div>
            </Card>
          </div>

          {/* --- PERBAIKAN: Tata Letak Grid Utama --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* Kolom Kiri (Konten Utama) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Bookings */}
              <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                        <FaCalendarAlt className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Upcoming Bookings
                        </h2>
                        <p className="text-gray-300 mt-1">
                          Next scheduled reservations
                        </p>
                      </div>
                    </div>
                    <Link to="/bookings">
                      <Button className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                        <FaEye className="mr-2" />
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-8">
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Schedule
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Booked By
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                                <span className="text-gray-500">
                                  Loading bookings...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : upcomingBookings.length > 0 ? (
                          upcomingBookings.map((booking, index) => (
                            <tr
                              key={booking.id}
                              className={`hover:bg-gray-50 transition-colors duration-200 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-25"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <FaBuilding className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    {booking.room}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center text-gray-700">
                                  <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm">
                                    {booking.time}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-indigo-600 font-semibold text-xs">
                                      {booking.bookedBy.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-gray-700">
                                    {booking.bookedBy}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status === "confirmed" && (
                                    <FaCheckCircle className="mr-1 h-3 w-3" />
                                  )}
                                  {booking.status === "pending" && (
                                    <FaHourglassHalf className="mr-1 h-3 w-3" />
                                  )}
                                  {booking.status === "cancelled" && (
                                    <FaTimes className="mr-1 h-3 w-3" />
                                  )}
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <div className="flex flex-col items-center">
                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                  <FaCalendarAlt className="h-8 w-8 text-gray-400" />
                                </div>
                                <span className="text-gray-500 text-lg">
                                  No upcoming bookings
                                </span>
                                <p className="text-gray-400 text-sm mt-1">
                                  All rooms are available for booking
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>

            {/* Kolom Kanan (Enhanced Sidebar) */}
            <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
              {/* Quick Actions Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Quick Actions
                </h2>
                <p className="text-gray-600">Fast access to main features</p>
              </div>

              <div className="space-y-6">
                {/* Manage Rooms */}
                <Card className="bg-white/80 backdrop-blur-md shadow-lg border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 group">
                  <Link to="/rooms" className="block">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <MeetingRoomIcon />
                          </div>
                          <span className="text-white font-semibold">
                            Manage Rooms
                          </span>
                        </div>
                        <FaArrowRight className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Create, edit, and manage room configurations. View room
                        details and availability.
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        <FaPlus className="mr-2 h-4 w-4" />
                        Add new rooms
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Manage Bookings */}
                <Card className="bg-white/80 backdrop-blur-md shadow-lg border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 group">
                  <Link to="/bookings" className="block">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <EventAvailableIcon />
                          </div>
                          <span className="text-white font-semibold">
                            Manage Bookings
                          </span>
                        </div>
                        <FaArrowRight className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        View all reservations, approve pending requests, and
                        manage booking schedules.
                      </p>
                      <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                        <FaEye className="mr-2 h-4 w-4" />
                        View all bookings
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* View Reports */}
                <Card className="bg-white/80 backdrop-blur-md shadow-lg border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 group">
                  <Link to="/reports" className="block">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <AnalyticsIcon />
                          </div>
                          <span className="text-white font-semibold">
                            View Reports
                          </span>
                        </div>
                        <FaArrowRight className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Generate comprehensive usage reports and analytics for
                        better insights.
                      </p>
                      <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                        <FaChartLine className="mr-2 h-4 w-4" />
                        Generate analytics
                      </div>
                    </div>
                  </Link>
                </Card>
              </div>

              {/* System Status */}
              <Card className="bg-white/80 backdrop-blur-md shadow-lg border-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FaCheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        Room Service
                      </span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 text-sm font-medium">
                          Online
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        Booking Service
                      </span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 text-sm font-medium">
                          Online
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        Report Service
                      </span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600 text-sm font-medium">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
