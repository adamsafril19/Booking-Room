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
    if (!confirm("Are you sure you want to delete this booking?")) {
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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Bookings Management
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/">
                <Button variant="secondary">← Back</Button>
              </Link>
              <Link to="/bookings/new">
                <Button>Create New Booking</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getRoomName(booking.room_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getUserName(booking.user_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(booking.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(booking.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/bookings/${booking.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                          </Link>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(booking.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No bookings found. Create your first booking!
                </p>
                <Link to="/bookings/new">
                  <Button>Create New Booking</Button>
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
