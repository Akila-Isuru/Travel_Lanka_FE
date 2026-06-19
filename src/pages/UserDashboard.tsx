import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";

interface Booking {
  _id: string;
  destination: {
    _id: string;
    name: string;
    slug: string;
    location: string;
    images: string[];
    pricePerNight: number;
  } | null;
  stayId: {
    _id: string;
    name: string;
    slug: string;
    location: string;
    images: string[];
    pricePerNight: number;
  } | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  specialRequests?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-500 border-amber-400/30 bg-amber-50",
  confirmed: "text-emerald-600 border-emerald-400/30 bg-emerald-50",
  cancelled: "text-red-400 border-red-300/30 bg-red-50",
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter(
    (b) => activeTab === "all" || b.status === activeTab,
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const nights = (b: Booking) =>
    Math.max(
      1,
      Math.floor(
        (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
          86400000,
      ),
    );

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    spent: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + b.totalPrice, 0),
  };

  // ✅ Helper: Get main display name
  const getMainName = (b: Booking) => {
    if (b.destination) return b.destination.name;
    if (b.stayId) return b.stayId.name;
    return "Booking";
  };

  // ✅ Helper: Get main location
  const getMainLocation = (b: Booking) => {
    if (b.destination) return b.destination.location;
    if (b.stayId) return b.stayId.location;
    return "";
  };

  // ✅ Helper: Get main image
  const getMainImage = (b: Booking) => {
    if (b.destination && b.destination.images?.length)
      return b.destination.images[0];
    if (b.stayId && b.stayId.images?.length) return b.stayId.images[0];
    return "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=400";
  };

  // ✅ Helper: Get stay image for secondary display
  const getStayImage = (b: Booking) => {
    if (b.stayId && b.stayId.images?.length) return b.stayId.images[0];
    return null;
  };

  // ✅ Helper: Check if booking has both destination and stay
  const hasBothItems = (b: Booking) => {
    return b.destination && b.stayId;
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Header */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#C9922A]/60" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  My Account
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
                Welcome, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-white/40 text-sm font-light mt-1">
                {user?.email}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#C9922A]" />
              <span className="text-white/50 text-[10px] tracking-widest uppercase font-light">
                {user?.roles?.[0] || "Traveller"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { label: "Total Trips", value: stats.total },
              { label: "Confirmed", value: stats.confirmed },
              { label: "Pending", value: stats.pending },
              {
                label: "Total Spent",
                value: `$${stats.spent.toLocaleString()}`,
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-white/10 px-5 py-4"
              >
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-light mb-1">
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.8rem",
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {(["all", "pending", "confirmed", "cancelled"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                  activeTab === tab
                    ? "border-[#C9922A] text-[#C9922A]"
                    : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
                }`}
              >
                {tab}
                {tab !== "all" && (
                  <span className="ml-1.5 text-[9px] opacity-60">
                    ({bookings.filter((b) => b.status === tab).length})
                  </span>
                )}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem",
                fontStyle: "italic",
              }}
              className="text-gray-400"
            >
              No {activeTab === "all" ? "" : activeTab} bookings found.
            </p>
            <button
              onClick={() => navigate("/destinations")}
              className="mt-6 px-8 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white border border-gray-100 overflow-hidden group hover:border-[#C9922A]/20 transition-colors duration-300"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* ✅ Images Section - Shows both destination and stay images */}
                  <div className="sm:w-48 flex-shrink-0 flex flex-col sm:flex-row">
                    {/* Main image (destination or stay) */}
                    <div className="h-36 sm:h-full flex-1 overflow-hidden">
                      <img
                        src={getMainImage(booking)}
                        alt={getMainName(booking)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* ✅ Stay badge image (only if stay exists AND destination exists) */}
                    {hasBothItems(booking) && getStayImage(booking) && (
                      <div className="hidden sm:block sm:w-16 sm:h-full overflow-hidden border-l border-white/10">
                        <img
                          src={getStayImage(booking)!}
                          alt={booking.stayId!.name}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          {/* ✅ Main name (destination) */}
                          <h3
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1.2rem",
                              fontStyle: "italic",
                            }}
                            className="text-[#1a3a5c] font-light"
                          >
                            {getMainName(booking)}
                          </h3>

                          {/* ✅ Stay name badge (only if stay exists AND destination exists) */}
                          {hasBothItems(booking) && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <svg
                                className="w-3 h-3 text-[#C9922A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
                                />
                              </svg>
                              <span className="text-xs text-[#C9922A] font-light">
                                + {booking.stayId!.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <span
                          className={`flex-shrink-0 text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 font-light ${statusColors[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* ✅ Location */}
                      <p className="text-gray-400 text-xs font-light mb-3">
                        <svg
                          className="w-3 h-3 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                          />
                        </svg>
                        {getMainLocation(booking)}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                            Check-In
                          </p>
                          <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                            {formatDate(booking.checkIn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                            Check-Out
                          </p>
                          <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                            Duration
                          </p>
                          <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                            {nights(booking)} night
                            {nights(booking) > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* ✅ Price breakdown (only if both items exist) */}
                      {hasBothItems(booking) && (
                        <div className="mt-2 pt-2 border-t border-gray-50 flex gap-3 text-[10px] text-gray-400 font-light">
                          <span>
                            {booking.destination!.name}: $
                            {booking.destination!.pricePerNight}/night
                          </span>
                          <span>
                            {booking.stayId!.name}: $
                            {booking.stayId!.pricePerNight}/night
                          </span>
                        </div>
                      )}

                      {booking.specialRequests && (
                        <p className="text-gray-300 text-xs font-light mt-3 italic">
                          "{booking.specialRequests}"
                        </p>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-end gap-3 sm:min-w-[120px]">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-gray-300 font-light">
                          {booking.guests} Guest{booking.guests > 1 ? "s" : ""}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.4rem",
                          }}
                          className="text-[#C9922A] font-light"
                        >
                          ${booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* ✅ UPDATED: View button - now goes to Booking Detail page */}
                        <button
                          onClick={() => navigate(`/booking/${booking._id}`)}
                          className="px-4 py-1.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[10px] tracking-[0.15em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                        >
                          View Details
                        </button>

                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="px-4 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-[0.15em] uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {cancellingId === booking._id ? "..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
