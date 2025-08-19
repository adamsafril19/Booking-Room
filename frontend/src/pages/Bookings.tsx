import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "../api/api";
import { authApi } from "../api/api";
import { roomApi } from "../api/api";
import Card from "../components/Card";
import Button from "../components/Button";

interface Booking {
  id: number;
  room_id: number;
  room_name: string;
  user_id: number;
  user_name: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: "confirmed" | "pending" | "cancelled";
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, string>>({});

  useEffect(() => {
    Promise.all([fetchBookings(), fetchRooms(), fetchUserNames()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.get("/bookings");
      setBookings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomApi.get("/rooms");
      setRooms(response.data);
    } catch (err) {
      console.error("Failed to fetch rooms");
    }
  };

  const fetchUserNames = async () => {
    try {
      const res = await authApi.get<{ id: number; name: string }[]>("/users");
      const map: Record<number, string> = {};
      res.data.forEach((u) => {
        map[u.id] = u.name;
      });
      setUsersMap(map);
    } catch {
      console.error("Failed to fetch users");
    }
  };

  const getRoomName = (roomId: number) => {
    return rooms.find((room) => room.id === roomId)?.name || `Room #${roomId}`;
  };

  const getUserName = (id: number) => usersMap[id] || `User #${id}`;

  const handleDelete = async (id: number) => {
    const booking = bookings.find((b) => b.id === id);
    const roomName = booking ? getRoomName(booking.room_id) : "this booking";

    if (
      !confirm(
        `Are you sure you want to delete the booking for "${roomName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await bookingApi.delete(`/bookings/${id}`);
      setBookings(bookings.filter((booking) => booking.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return "No date/time";

    try {
      const date = new Date(dateTime);

      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid date";

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dateStr = date.toDateString();
      const todayStr = today.toDateString();
      const tomorrowStr = tomorrow.toDateString();

      let dayLabel = "";
      if (dateStr === todayStr) {
        dayLabel = "Today";
      } else if (dateStr === tomorrowStr) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }

      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayLabel}, ${timeStr}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl font-medium text-gray-700">
            Loading bookings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Bookings Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track room reservations
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link to="/">
                <Button
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back</span>
                </Button>
              </Link>
              <Link to="/bookings/new">
                <Button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New Booking</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden">
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>Room</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>User</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Schedule</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Purpose</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                            />
                          </svg>
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-green-50/50 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {getRoomName(booking.room_id)?.charAt(0) ||
                                    "R"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {getRoomName(booking.room_id)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {booking.room_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {getUserName(booking.user_id)
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {getUserName(booking.user_id)}
                              </div>
                              <div className="text-sm text-gray-500">
                                User #{booking.user_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3"
                                />
                              </svg>
                              {booking.start_time
                                ? formatDateTime(booking.start_time)
                                : "No start time"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3"
                                />
                              </svg>
                              {booking.end_time
                                ? formatDateTime(booking.end_time)
                                : "No end time"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-900 truncate">
                              {booking.purpose || "No purpose specified"}
                            </div>
                            {booking.purpose && booking.purpose.length > 50 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Click to see full purpose
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status || "unknown"
                            )}`}
                          >
                            {booking.status === "confirmed" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            {booking.status === "pending" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3"
                                />
                              </svg>
                            )}
                            {booking.status === "cancelled" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                            {booking.status
                              ? booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex space-x-2">
                            <Link to={`/bookings/${booking.id}/edit`}>
                              <Button
                                variant="secondary"
                                className="flex items-center space-x-1 text-xs px-3 py-2 hover:bg-green-50 hover:text-green-700 border-gray-200"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                <span>Edit</span>
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(booking.id)}
                              className="flex items-center space-x-1 text-xs px-3 py-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span>Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Get started by creating your first booking. Schedule meetings
                  and reserve rooms easily.
                </p>
                <Link to="/bookings/new">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Your First Booking
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Bookings;
