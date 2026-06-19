import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ import Link
import { getStaysByDestination } from "../services/stayService";
import type { Stay } from "../services/stayService";

interface Props {
  destinationId: string;
  onStaySelect: (stay: Stay | null) => void;
  selectedStayId: string | null;
}

const StaySelector: React.FC<Props> = ({
  destinationId,
  onStaySelect,
  selectedStayId,
}) => {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(selectedStayId);

  useEffect(() => {
    if (destinationId) {
      setLoading(true);
      getStaysByDestination(destinationId)
        .then((res) => setStays(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [destinationId]);

  const handleSelect = (stayId: string) => {
    const stay = stays.find((s) => s._id === stayId) || null;
    setSelected(stayId);
    onStaySelect(stay);
  };

  const handleRemove = () => {
    setSelected(null);
    onStaySelect(null);
  };

  if (loading)
    return <div className="text-xs text-gray-400">Loading stays...</div>;
  if (stays.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
        Add Accommodation (optional)
      </label>
      <div className="space-y-2">
        {stays.map((stay) => (
          <div
            key={stay._id}
            className={`flex items-center justify-between p-2 border cursor-pointer transition-all ${
              selected === stay._id
                ? "border-[#C9922A] bg-[#C9922A]/5"
                : "border-gray-100 hover:border-gray-300"
            }`}
            onClick={() => handleSelect(stay._id)}
          >
            <div className="flex items-center gap-2">
              <img
                src={stay.images[0]}
                alt={stay.name}
                className="w-10 h-10 object-cover"
              />
              <div>
                <p className="text-xs font-medium">{stay.name}</p>
                <p className="text-[10px] text-gray-400">
                  ${stay.pricePerNight}/night
                </p>
              </div>
            </div>

            {/* Right side: Select/Remove + View Details link */}
            <div className="flex items-center gap-2">
              {selected === stay._id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="text-red-400 text-xs hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(stay._id);
                  }}
                  className="text-[#C9922A] text-xs hover:underline"
                >
                  Select
                </button>
              )}

              {/* ✅ View details link – opens full stay page */}
              <Link
                to={`/stay/${stay.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-[#C9922A] transition-colors"
                title="View full details"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaySelector;
