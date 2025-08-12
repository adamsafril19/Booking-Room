import React, { useState, useEffect, useMemo } from "react";
import { HomeIcon, CalendarCheck, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/Card";
import Button from "../components/Button";
import { bookingApi } from "../api/api";
import { roomApi } from "../api/api";
import { authApi } from "../api/api";

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
    const active = bookings.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return b.status !== "cancelled" && start <= now && now <= end;
    }).length;

    setStats({
      totalRooms: rooms.length,
      activeBookings: active,
      availableRooms: rooms.length - active,
    });
  }, [rooms, bookings]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-xl">
                R
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Room Booking System
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.roles?.[0]?.name?.toLowerCase() || "user"}
                  </p>
                </div>
                <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg ml-3">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="px-3 py-2 text-sm"
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
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}! Here's what's happening.
            </p>
          </div>

          {/* --- PERBAIKAN: Tata Letak Grid Utama --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* Kolom Kiri (Konten Utama) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-lg mr-4 text-indigo-600">
                      <HomeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-indigo-600">
                        {stats.totalRooms}
                      </div>
                      <div className="text-gray-600 text-sm">Total Rooms</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4 text-blue-600">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.activeBookings}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Active Bookings
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.availableRooms}
                      </div>
                      <div className="text-gray-600 text-sm">Available Now</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Upcoming Bookings */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upcoming Bookings
                </h2>
                <Card className="overflow-hidden">
                  <div className="min-w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Room
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Time
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Booked By
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-8 text-gray-500"
                            >
                              Loading bookings...
                            </td>
                          </tr>
                        ) : upcomingBookings.length > 0 ? (
                          upcomingBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {booking.room}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                {booking.time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                {booking.bookedBy}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-8 text-gray-500"
                            >
                              No upcoming bookings.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>

            {/* Kolom Kanan (Sidebar) */}
            <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <div className="space-y-4">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <Link to="/rooms" className="block p-6">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4 text-indigo-600">
                        <MeetingRoomIcon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Manage Rooms
                        </h3>
                        <p className="text-sm text-gray-600">
                          View, create, and manage rooms.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <Link to="/bookings" className="block p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4 text-blue-600">
                        <EventAvailableIcon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Manage Bookings
                        </h3>
                        <p className="text-sm text-gray-600">
                          View all reservations.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <Link to="/reports" className="block p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-lg mr-4 text-green-600">
                        <AnalyticsIcon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          View Reports
                        </h3>
                        <p className="text-sm text-gray-600">
                          Generate usage reports.
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
