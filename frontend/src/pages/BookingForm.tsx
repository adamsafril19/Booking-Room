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
        room_id: booking.room_id || 0,
        start_time: booking.start_time ? booking.start_time.slice(0, 16) : "",
        end_time: booking.end_time ? booking.end_time.slice(0, 16) : "",
        purpose: booking.purpose || "",
        status: booking.status || "pending",
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
                  {isEditing ? "Edit Booking" : "Create New Booking"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing
                    ? "Update booking details and schedule"
                    : "Schedule a new room reservation"}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/bookings")}
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
              <span>Back to Bookings</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
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

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-green-600"
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
                        Room Selection
                      </h3>

                      <div>
                        <label
                          htmlFor="room_id"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Choose Room <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
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
                            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                          >
                            <option value="">Select a room...</option>
                            {rooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                🏢 {room.name} (👥 {room.capacity} people)
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
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
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        {formData.room_id > 0 && (
                          <div className="mt-2 p-2 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
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
                              Room selected successfully
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
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
                        Schedule & Timing
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="start_time"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Start Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
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
                              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg
                                className="w-5 h-5 text-green-500"
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
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="end_time"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
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
                              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <svg
                                className="w-5 h-5 text-red-500"
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
                            </div>
                          </div>
                        </div>

                        {formData.start_time && formData.end_time && (
                          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800 flex items-center">
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
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Duration:{" "}
                              {Math.round(
                                (new Date(formData.end_time).getTime() -
                                  new Date(formData.start_time).getTime()) /
                                  (1000 * 60 * 60 * 10)
                              ) / 10}{" "}
                              hours
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-purple-600"
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
                        Purpose & Details
                      </h3>

                      <div>
                        <label
                          htmlFor="purpose"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Purpose <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="purpose"
                            name="purpose"
                            rows={6}
                            required
                            value={formData.purpose}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                purpose: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Describe the purpose of this booking...
Example: Team meeting, client presentation, training session, etc."
                          />
                          <div className="absolute top-3 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-purple-500"
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
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {formData.purpose.length}/500 characters
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-orange-600"
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
                        Booking Status
                      </h3>

                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Status
                        </label>
                        <div className="relative">
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
                            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                          >
                            <option value="pending">⏰ Pending Review</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-orange-500"
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
                          </div>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                          <p className="text-sm text-orange-800">
                            {formData.status === "pending" &&
                              "⏰ Booking will be reviewed for approval"}
                            {formData.status === "confirmed" &&
                              "✅ Booking is confirmed and active"}
                            {formData.status === "cancelled" &&
                              "❌ Booking has been cancelled"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate("/bookings")}
                      className="flex items-center justify-center space-x-2 px-6 py-3 border-gray-300 hover:bg-gray-50"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Cancel</span>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            {isEditing ? "Update Booking" : "Create Booking"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookingForm;
