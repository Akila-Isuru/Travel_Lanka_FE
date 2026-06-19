import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { planTripWithAI } from "../services/aiService";
import { createItinerary } from "../services/itineraryService";
import type { ItineraryDestinationInput } from "../services/itineraryService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const interestsOptions = [
  "Beach",
  "Culture",
  "Nature",
  "Adventure",
  "Wildlife",
  "Historical",
  "Wellness",
  "Food",
];

const AITripPlannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState("3 days");
  const [interests, setInterests] = useState<string[]>(["Culture"]);
  const [budget, setBudget] = useState(500);
  const [startLocation, setStartLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      
      const aiPlan = await planTripWithAI({
        duration,
        interests,
        budget,
        startLocation,
      });

      const startDate = new Date();
      const destinations: ItineraryDestinationInput[] = aiPlan.days.map(
        (day, idx) => {
          const checkIn = new Date(startDate);
          checkIn.setDate(startDate.getDate() + idx);
          const checkOut = new Date(checkIn);
          checkOut.setDate(checkIn.getDate() + 1);
          return {
            destinationId: "", // AI doesn't return ID, we'll use a placeholder – we need to match with real DB later or just store name
            checkIn: checkIn.toISOString().split("T")[0],
            checkOut: checkOut.toISOString().split("T")[0],
            guests: 1,
            transportMode: "car",
            specialRequests: day.description,
          };
        },
      );


      alert(
        `AI suggested:\n${aiPlan.itineraryName}\n\n` +
          aiPlan.days
            .map(
              (d) => `${d.dayNumber}. ${d.destinationName}: ${d.description}`,
            )
            .join("\n"),
      );
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to generate trip plan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0a1628] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[9px] tracking-[0.3em] uppercase font-light">
                  AI Trip Planner
                </span>
              </div>
              <p className="text-white font-light text-xl">
                Plan with Gemini AI
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
            >
              <option>1 day</option>
              <option>2 days</option>
              <option>3 days</option>
              <option>4 days</option>
              <option>5 days</option>
              <option>6 days</option>
              <option>7 days</option>
              <option>10 days</option>
              <option>14 days</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interestsOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInterest(opt)}
                  className={`px-3 py-1.5 text-[11px] uppercase font-light transition-colors ${
                    interests.includes(opt)
                      ? "bg-[#C9922A] text-white"
                      : "border border-gray-200 text-gray-500 hover:border-[#C9922A] hover:text-[#C9922A]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
              Budget (USD)
            </label>
            <input
              type="number"
              min={50}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
              Start Location (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Colombo, Kandy, or leave empty"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-light">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors disabled:opacity-50"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            {loading ? "Planning..." : "Generate Trip Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITripPlannerModal;
