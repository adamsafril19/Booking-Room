import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookingApi } from "../api/api";
import { roomApi } from "../api/api";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

interface Room {
  id: number;
  name: string;
  capacity: number;
  status: string;
}

interface BookingFormData {
  room_id: number;
  start_time: string;
  end_time: string;
  purpose: string;
  status: "pending" | "confirmed" | "cancelled";
}

const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<BookingFormData>({
    room_id: 0,
    start_time: "",
    end_time: "",
    purpose: "",
    status: "pending",
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    fetchRooms();
    if (isEditing) {
      fetchBooking();
    }
  }, [id]);

  const fetchRooms = async () => {
    try {
      const response = await roomApi.get("/rooms");
      setRooms(response.data);
    } catch (err: any) {
      setError("Failed to fetch rooms");
    }
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.get(`/bookings/${id}`);
      const booking = response.data;
      setFormData({
        room_id: booking.room_id,
        start_time: booking.start_time.slice(0, 16),
        end_time: booking.end_time.slice(0, 16),
        purpose: booking.purpose,
        status: booking.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Id": user!.id,
        },
      };

      if (isEditing) {
        await bookingApi.put(`/bookings/${id}`, formData, config);
      } else {
        await bookingApi.post(`/bookings`, formData, config);
      }
      navigate("/bookings");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError("Room is not available for the selected time period");
      } else {
        setError(err.response?.data?.message || "Failed to save booking");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Booking" : "Create New Booking"}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Room Selector */}
              <div>
                <label
                  htmlFor="room_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Room
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  required
                  value={formData.room_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      room_id: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Time
                </label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_time: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {/* Purpose */}
              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700"
                >
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  required
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the purpose of this booking..."
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as
                        | "pending"
                        | "confirmed"
                        | "cancelled",
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/bookings")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Booking"
                    : "Create Booking"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;
