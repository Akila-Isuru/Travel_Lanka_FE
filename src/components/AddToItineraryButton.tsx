import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";
import {
  createItinerary,
  addToItinerary,
  getMyItineraries,
} from "../services/itineraryService";

interface Props {
  destinationId: string;
  destinationName: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  onAdded?: () => void;
}

const AddToItineraryButton: React.FC<Props> = ({
  destinationId,
  destinationName,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 1,
  onAdded,
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [newItineraryName, setNewItineraryName] = useState(
    `Trip to ${destinationName}`,
  );
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>("new");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const loadItineraries = async () => {
    try {
      const res = await getMyItineraries();
      setItineraries(res.data.filter((i: any) => i.status === "draft"));
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    setShowModal(true);
    loadItineraries();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const destData = {
        destinationId,
        checkIn: defaultCheckIn || new Date().toISOString().split("T")[0],
        checkOut:
          defaultCheckOut ||
          new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guests: defaultGuests,
        transportMode: "car" as const,
      };
      if (selectedItineraryId === "new") {
        await createItinerary(newItineraryName, destData);
        setMessage("New itinerary created and destination added!");
      } else {
        await addToItinerary(selectedItineraryId, destData);
        setMessage("Destination added to itinerary!");
      }
      setTimeout(() => {
        setShowModal(false);
        if (onAdded) onAdded();
      }, 1500);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Error adding to itinerary");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={openModal}
        className="w-full mt-3 py-2 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
      >
        + Add to Itinerary
      </button>

      {mounted &&
        showModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div
              className="bg-white max-w-md w-full p-6 rounded shadow-xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <h3 className="text-xl font-light mb-4">Add to Itinerary</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium">
                  Choose itinerary
                </label>
                <select
                  value={selectedItineraryId}
                  onChange={(e) => setSelectedItineraryId(e.target.value)}
                  className="w-full border p-2 mt-1"
                >
                  <option value="new">+ Create new itinerary</option>
                  {itineraries.map((it) => (
                    <option key={it._id} value={it._id}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedItineraryId === "new" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium">
                    Itinerary Name
                  </label>
                  <input
                    type="text"
                    value={newItineraryName}
                    onChange={(e) => setNewItineraryName(e.target.value)}
                    className="w-full border p-2 mt-1"
                  />
                </div>
              )}
              {message && (
                <div className="text-sm text-center my-2 text-green-600">
                  {message}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#C9922A] text-white disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AddToItineraryButton;
