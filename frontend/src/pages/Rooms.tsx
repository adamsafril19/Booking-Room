import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { roomApi } from "../api/api";
import Card from "../components/Card";
import Button from "../components/Button";

interface Facility {
  id: number;
  facility_name: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
  facilities: Facility[];
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomApi.get("/rooms");
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setRoomToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setRoomToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (roomToDelete === null) return;

    try {
      await roomApi.delete(`/rooms/${roomToDelete}`);
      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      closeDeleteModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete room");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Room Management
            </h1>
            <div className="flex space-x-4">
              <Link to="/">
                <Button variant="secondary">← Back</Button>
              </Link>
              <Link to="/rooms/new">
                <Button>Add Room</Button>
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
                      Room Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Facilities
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {room.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.capacity} people
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.facilities.map((f) => f.facility_name).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/rooms/${room.id}/edit`}>
                            <Button variant="secondary">Edit</Button>
                          </Link>
                          <Button
                            variant="danger"
                            onClick={() => openDeleteModal(room.id)}
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

            {rooms.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No rooms found. Create your first room!
                </p>
                <Link to="/rooms/new">
                  <Button>Add Room</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this room? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
