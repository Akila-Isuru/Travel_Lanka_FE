import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getMyItineraries,
  deleteItinerary,
} from "../services/itineraryService";

const statusColors: Record<
  string,
  { text: string; border: string; bg: string; dot: string }
> = {
  draft: {
    text: "text-amber-600",
    border: "border-amber-400/30",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  booked: {
    text: "text-emerald-600",
    border: "border-emerald-400/30",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  cancelled: {
    text: "text-red-400",
    border: "border-red-300/30",
    bg: "bg-red-50",
    dot: "bg-red-400",
  },
};

const transportIcons: Record<string, string> = {
  car: "🚗",
  train: "🚂",
  bus: "🚌",
  flight: "✈️",
};

const MyItineraries = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "draft" | "booked" | "cancelled"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await getMyItineraries();
      setItineraries(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this itinerary? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((it) => it._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = itineraries.filter(
    (it) => activeFilter === "all" || it.status === activeFilter,
  );

  const stats = {
    total: itineraries.length,
    draft: itineraries.filter((i) => i.status === "draft").length,
    booked: itineraries.filter((i) => i.status === "booked").length,
    totalSpent: itineraries
      .filter((i) => i.status === "booked")
      .reduce((s, i) => s + i.totalPrice, 0),
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Header */}
      <div className="bg-[#0a1628] pt-28 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,146,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />
        {/* Decorative circles */}
        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#C9922A]/08 pointer-events-none" />
        <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#1a3a5c] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#C9922A]/60" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  My Travel Plans
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontStyle: "italic",
                }}
                className="text-white font-light"
              >
                My Itineraries
              </h1>
              <p className="text-white/40 text-sm font-light mt-1">
                Plan, explore, and manage your Sri Lanka journeys
              </p>
            </div>
            <button
              onClick={() => navigate("/destinations")}
              className="self-start sm:self-auto px-7 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors duration-300"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              + Plan New Trip
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {[
              { label: "Total Itineraries", value: stats.total },
              { label: "In Draft", value: stats.draft },
              { label: "Booked", value: stats.booked },
              {
                label: "Total Value",
                value: `$${stats.totalSpent.toLocaleString()}`,
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border border-white/10 px-4 py-3"
              >
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-light mb-1">
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.6rem",
                  }}
                  className="text-[#C9922A] font-light"
                >
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-[70px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar">
          {(["all", "draft", "booked", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-shrink-0 px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                activeFilter === tab
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              {tab}
              {tab !== "all" && (
                <span className="ml-1.5 text-[9px] opacity-60">
                  ({itineraries.filter((i) => i.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28"
          >
            {/* Empty state illustration */}
            <div className="w-20 h-20 mx-auto mb-6 border border-[#C9922A]/20 flex items-center justify-center relative">
              <div className="absolute inset-0 border border-[#C9922A]/10 rotate-45" />
              <svg
                className="w-8 h-8 text-[#C9922A]/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
            </div>
            <p
              className="text-gray-400 font-light mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.6rem",
                fontStyle: "italic",
              }}
            >
              {activeFilter === "all"
                ? "No itineraries yet."
                : `No ${activeFilter} itineraries.`}
            </p>
            <p className="text-gray-300 text-sm font-light mb-8">
              Start by adding destinations to a new itinerary.
            </p>
            <button
              onClick={() => navigate("/destinations")}
              className="px-8 py-3.5 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              Explore Destinations
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                {filtered.length} itiner
                {filtered.length !== 1 ? "aries" : "ary"}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                  {activeFilter}
                </span>
              </div>
            </div>

            {filtered.map((it, i) => {
              const sc = statusColors[it.status] || statusColors.draft;
              const isExpanded = expandedId === it._id;

              return (
                <motion.div
                  key={it._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-gray-100 overflow-hidden hover:border-[#C9922A]/20 transition-colors duration-300"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                  }}
                >
                  {/* Top bar with destination thumbnails */}
                  {it.destinations && it.destinations.length > 0 && (
                    <div className="flex h-1.5">
                      {it.destinations.map((_: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex-1"
                          style={{
                            backgroundColor:
                              idx % 3 === 0
                                ? "#C9922A"
                                : idx % 3 === 1
                                  ? "#1a3a5c"
                                  : "#0a1628",
                            opacity: 0.6 + idx * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left - Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`text-[9px] tracking-[0.2em] uppercase border px-2 py-0.5 font-light flex items-center gap-1.5 ${sc.text} ${sc.border} ${sc.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {it.status}
                          </span>
                          <span className="text-gray-300 text-[10px] font-light">
                            Updated {formatDate(it.updatedAt)}
                          </span>
                        </div>

                        <h2
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.4rem",
                            fontStyle: "italic",
                          }}
                          className="text-[#1a3a5c] font-light mb-3 truncate"
                        >
                          {it.name}
                        </h2>

                        {/* Destination preview chips */}
                        {it.destinations && it.destinations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {it.destinations
                              .slice(0, 3)
                              .map((dest: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 bg-[#faf8f4] border border-gray-100 px-3 py-1 text-[10px] text-[#1a3a5c] font-light tracking-wide"
                                >
                                  <span className="text-[#C9922A]">
                                    {transportIcons[dest.transportMode] || "🚗"}
                                  </span>
                                  {dest.destinationId?.name || "Destination"}
                                </span>
                              ))}
                            {it.destinations.length > 3 && (
                              <span className="inline-flex items-center bg-[#faf8f4] border border-gray-100 px-3 py-1 text-[10px] text-gray-400 font-light">
                                +{it.destinations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Destinations
                            </p>
                            <p
                              className="text-[#1a3a5c] font-light mt-0.5"
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontSize: "1.1rem",
                              }}
                            >
                              {it.destinations?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Total Nights
                            </p>
                            <p
                              className="text-[#1a3a5c] font-light mt-0.5"
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontSize: "1.1rem",
                              }}
                            >
                              {it.totalNights || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Total Value
                            </p>
                            <p
                              className="text-[#C9922A] font-light mt-0.5"
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontSize: "1.1rem",
                              }}
                            >
                              ${it.totalPrice?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right - Actions */}
                      <div className="flex sm:flex-col gap-2 items-start sm:items-end flex-shrink-0">
                        <Link
                          to={`/itinerary/${it._id}`}
                          className="px-5 py-2.5 bg-[#1a3a5c] text-white text-[10px] tracking-[0.2em] uppercase font-light hover:bg-[#C9922A] transition-colors duration-300"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                          }}
                        >
                          {it.status === "draft" ? "Edit Plan" : "View Plan"}
                        </Link>

                        {it.status === "draft" && (
                          <button
                            onClick={() => handleDelete(it._id)}
                            disabled={deletingId === it._id}
                            className="px-5 py-2.5 border border-red-200 text-red-400 text-[10px] tracking-[0.2em] uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {deletingId === it._id ? "..." : "Delete"}
                          </button>
                        )}

                        {/* Expand toggle */}
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : it._id)
                          }
                          className="px-5 py-2.5 border border-gray-100 text-gray-400 text-[10px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A]/30 hover:text-[#C9922A] transition-colors"
                        >
                          {isExpanded ? "Less ↑" : "Details ↓"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded destination list */}
                    <AnimatePresence>
                      {isExpanded &&
                        it.destinations &&
                        it.destinations.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9922A] font-light mb-3">
                                Journey Breakdown
                              </p>
                              <div className="space-y-2">
                                {it.destinations.map(
                                  (dest: any, idx: number) => {
                                    const nights = Math.max(
                                      0,
                                      Math.floor(
                                        (new Date(dest.checkOut).getTime() -
                                          new Date(dest.checkIn).getTime()) /
                                          86400000,
                                      ),
                                    );
                                    return (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-4 bg-[#faf8f4] border border-gray-100 px-4 py-3"
                                        style={{
                                          clipPath:
                                            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                        }}
                                      >
                                        <span className="text-lg flex-shrink-0">
                                          {transportIcons[dest.transportMode] ||
                                            "🚗"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[#1a3a5c] text-xs font-light truncate">
                                            {dest.destinationId?.name ||
                                              "Destination"}
                                          </p>
                                          <p className="text-gray-300 text-[10px]">
                                            {formatDate(dest.checkIn)} →{" "}
                                            {formatDate(dest.checkOut)}
                                          </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-[#C9922A] text-xs font-light">
                                            {nights} night
                                            {nights !== 1 ? "s" : ""}
                                          </p>
                                          <p className="text-gray-300 text-[10px]">
                                            {dest.guests} guest
                                            {dest.guests > 1 ? "s" : ""}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyItineraries;
