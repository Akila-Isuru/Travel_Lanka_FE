import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DestinationCard from "../components/DestinationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllDestinations } from "../services/destinationService";
import { type Destination } from "../types";

const CATEGORIES = [
  "All",
  "Wildlife",
  "Heritage",
  "Coastal",
  "Cultural",
  "Wellness",
  "Adventure",
  "Spiritual",
];

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    fetchDestinations();
  }, [search, activeCategory]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();

    
      if (activeCategory !== "All") {
        params.category = activeCategory;
      }

      const res = await getAllDestinations(params);

     
      if (res && res.data) {
        setDestinations(
          Array.isArray(res.data) ? res.data : res.data.data || [],
        );
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-[#0a1628] pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,146,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9922A]/60" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              Explore Sri Lanka
            </span>
            <div className="w-8 h-px bg-[#C9922A]/60" />
          </div>
          <h1
            className="text-white font-light"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontStyle: "italic",
              lineHeight: 1,
            }}
          >
            Discover Every Corner
          </h1>
          <p className="text-white/40 text-sm font-light mt-4 max-w-md mx-auto leading-relaxed">
            From ancient temples to pristine coastlines — find your perfect Sri
            Lanka experience.
          </p>

          {/* Search */}
          <div className="mt-10 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search destinations, locations..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-6 py-4 pl-14 bg-white/5 border border-white/10 text-white text-sm font-light placeholder-white/25 focus:outline-none focus:border-[#C9922A]/60 transition-colors"
              style={{ borderRadius: 0 }}
            />
            <svg
              className="absolute left-5 top-4 w-5 h-5 text-white/30"
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
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-200 bg-white sticky top-[70px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-4 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                  activeCategory === cat
                    ? "border-[#C9922A] text-[#C9922A]"
                    : "border-transparent text-gray-400 hover:text-[#1a3a5c] hover:border-[#1a3a5c]/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSpinner />
        ) : destinations.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-gray-400 font-light"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem",
                fontStyle: "italic",
              }}
            >
              No destinations found.
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                {destinations.length} destination
                {destinations.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                  {activeCategory}
                </span>
              </div>
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest._id || i}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <DestinationCard destination={dest} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;
