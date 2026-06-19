import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllDestinations } from "../services/destinationService";
import { type Destination } from "../types";
import DestinationCard from "./DestinationCard";
import LoadingSpinner from "./LoadingSpinner";

const DestinationGrid = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(inputValue), 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    fetchDestinations();
  }, [search]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await getAllDestinations({ search });
      setDestinations(res.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search destinations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-5 py-3.5 pl-12 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light placeholder-gray-300 focus:outline-none focus:border-[#C9922A] transition-colors duration-200"
            style={{ borderRadius: 0 }}
          />
          <svg
            className="absolute left-4 top-4 w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
            />
          </svg>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : destinations.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-gray-400 font-light"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.3rem",
              fontStyle: "italic",
            }}
          >
            No destinations found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <DestinationCard destination={dest} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationGrid;
