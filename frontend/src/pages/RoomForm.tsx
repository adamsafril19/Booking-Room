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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Room" : "Add New Room"}
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

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Room Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mt-4"
                >
                  Location
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
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Capacity
                </label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {commonFacilities.map((facility) => (
                    <label key={facility} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={(e) =>
                          handleFacilityChange(facility, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {facility}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/rooms")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Room"
                    : "Create Room"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RoomForm;
