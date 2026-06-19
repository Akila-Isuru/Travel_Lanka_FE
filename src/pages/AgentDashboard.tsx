// frontend/src/pages/AgentDashboard.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import {
  getMyAgentBookings,
  cancelAgentBooking,
} from "../services/agentService";
import type { AgentBooking } from "../types";

const statusColors: Record<
  string,
  { text: string; border: string; bg: string; dot: string }
> = {
  pending: {
    text: "text-amber-600",
    border: "border-amber-400/30",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  confirmed: {
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

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyAgentBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch agent bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this agent booking?")) return;
    setCancellingId(id);
    try {
      await cancelAgentBooking(id);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled" as const } : b,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const calcDays = (start: string, end: string) =>
    Math.max(
      1,
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
      ),
    );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0a1628] pt-28 pb-14 relative overflow-hidden">
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-px bg-[#C9922A]/60" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              Agent Bookings
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontStyle: "italic",
            }}
            className="text-white font-light"
          >
            My Local Agents
          </h1>
          <p className="text-white/40 text-sm font-light mt-1">
            Manage your bookings with local guides and travel agents
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 border border-[#C9922A]/20 flex items-center justify-center relative">
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
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <p
              className="text-gray-400 font-light"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.6rem",
                fontStyle: "italic",
              }}
            >
              No agent bookings yet.
            </p>
            <p className="text-gray-300 text-sm font-light mt-2 mb-8">
              Book a local agent from any destination page.
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
                {bookings.length} agent booking
                {bookings.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                  All Bookings
                </span>
              </div>
            </div>

            {bookings.map((booking, i) => {
              const sc = statusColors[booking.status] || statusColors.pending;
              const agent =
                typeof booking.agent === "object" ? booking.agent : null;
              const destination =
                typeof booking.destination === "object"
                  ? booking.destination
                  : null;
              const days = calcDays(booking.startDate, booking.endDate);

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-gray-100 overflow-hidden hover:border-[#C9922A]/20 transition-colors duration-300"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                  }}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Agent photo */}
                      <div className="sm:w-20 h-20 sm:h-20 flex-shrink-0 overflow-hidden">
                        <img
                          src={
                            agent?.photo ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(agent?.name || "Agent") +
                              "&background=C9922A&color=fff&size=128"
                          }
                          alt={agent?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span
                            className={`text-[9px] tracking-[0.2em] uppercase border px-2 py-0.5 font-light flex items-center gap-1.5 ${sc.text} ${sc.border} ${sc.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {booking.status}
                          </span>
                          <span className="text-gray-300 text-[10px] font-light">
                            Ref: #{booking._id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.2rem",
                            fontStyle: "italic",
                          }}
                          className="text-[#1a3a5c] font-light"
                        >
                          {agent?.name || "Agent"}
                        </h3>

                        <p className="text-gray-400 text-xs font-light">
                          {destination?.name || "Destination"} ·{" "}
                          {destination?.location || ""}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-3 text-xs">
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Start
                            </p>
                            <p className="text-[#1a3a5c] font-light">
                              {formatDate(booking.startDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              End
                            </p>
                            <p className="text-[#1a3a5c] font-light">
                              {formatDate(booking.endDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Days
                            </p>
                            <p className="text-[#1a3a5c] font-light">{days}</p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                              Fee
                            </p>
                            <p className="text-[#C9922A] font-light">
                              ${booking.agentFee}
                            </p>
                          </div>
                          {booking.userPhone && (
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Your Phone
                              </p>
                              <p className="text-[#1a3a5c] font-light">
                                {booking.userPhone}
                              </p>
                            </div>
                          )}
                        </div>

                        {booking.specialRequests && (
                          <p className="text-gray-400 text-xs font-light mt-2 italic">
                            " {booking.specialRequests} "
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="px-5 py-2 border border-red-200 text-red-400 text-[10px] tracking-[0.2em] uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {cancellingId === booking._id ? "..." : "Cancel"}
                          </button>
                        )}
                        {agent?.whatsappNumber && (
                          <a
                            href={`https://wa.me/${agent.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2 bg-[#25D366] text-white text-[10px] tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity text-center"
                            style={{
                              clipPath:
                                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                            }}
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
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

export default AgentDashboard;
