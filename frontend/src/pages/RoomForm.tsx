import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roomApi } from "../api/api";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

interface RoomFormData {
  name: string;
  capacity: number;
  facilities: string[];
  status: "available" | "occupied" | "maintenance";
  location: string;
}

const RoomForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    capacity: 1,
    facilities: [],
    status: "available",
    location: "lantai 1",
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await roomApi.get(`/rooms/${id}`);
      const data = response.data;

      // ← UBAH BAGIAN INI:
      // Dari data.facilities yang array of objek…
      const facilityNames = data.facilities.map((f: any) => f.facility_name);

      // Lalu set formData dengan facilities: string[]
      setFormData({
        name: data.name,
        capacity: data.capacity,
        // jika ada location & status
        location: (data as any).location,
        status: data.status,
        facilities: facilityNames,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch room");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        await roomApi.put(`/rooms/${id}`, formData);
      } else {
        await roomApi.post("/rooms", formData);
      }
      navigate("/rooms");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facility],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        facilities: prev.facilities.filter((f) => f !== facility),
      }));
    }
  };

  const commonFacilities = [
    "Projector",
    "Whiteboard",
    "Audio System",
    "Video Conference",
    "Air Conditioning",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isEditing ? "Edit Room" : "Add New Room"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing
                    ? "Update room information and settings"
                    : "Create a new room with facilities and details"}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/rooms")}
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
              <span>Back to Rooms</span>
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
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Basic Information
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Room Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter room name (e.g., Conference Room A)"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="location"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Location <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="location"
                            name="location"
                            type="text"
                            required
                            value={(formData as any).location || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                // @ts-ignore
                                location: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter location (e.g., 2nd Floor, Building A)"
                          />
                        </div>
                      </div>
                    </div>

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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Capacity & Status
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="capacity"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Capacity <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id="capacity"
                              name="capacity"
                              type="number"
                              min="1"
                              max="1000"
                              required
                              value={formData.capacity}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  capacity: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="0"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500 text-sm">
                                people
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                status: e.target.value as any,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="available">✅ Available</option>
                            <option value="occupied">🔴 Occupied</option>
                            <option value="maintenance">🔧 Maintenance</option>
                          </select>
                        </div>
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        Available Facilities
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        {commonFacilities.map((facility) => {
                          const isChecked =
                            formData.facilities.includes(facility);
                          const facilityIcons: { [key: string]: string } = {
                            Projector: "📽️",
                            Whiteboard: "📋",
                            "Audio System": "🔊",
                            "Video Conference": "📹",
                            "Air Conditioning": "❄️",
                          };

                          return (
                            <label
                              key={facility}
                              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                isChecked
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  handleFacilityChange(
                                    facility,
                                    e.target.checked
                                  )
                                }
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                              />
                              <span className="ml-3 text-lg">
                                {facilityIcons[facility]}
                              </span>
                              <span
                                className={`ml-2 text-sm font-medium ${
                                  isChecked ? "text-blue-900" : "text-gray-700"
                                }`}
                              >
                                {facility}
                              </span>
                              {isChecked && (
                                <svg
                                  className="ml-auto w-5 h-5 text-blue-500"
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
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
                          Selected: {formData.facilities.length} facilities
                        </p>
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
                      onClick={() => navigate("/rooms")}
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
                      className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold"
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
                            {isEditing ? "Update Room" : "Create Room"}
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

export default RoomForm;
