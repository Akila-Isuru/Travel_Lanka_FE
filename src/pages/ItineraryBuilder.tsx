import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

import {
  getItineraryById,
  updateItineraryDestination,
  removeFromItinerary,
  bookItinerary,
  initiateItineraryPayment,
} from "../services/itineraryService";
import { useAuth } from "../hooks/useAuth";
import ItineraryMap from "../components/ItineraryMap";

const transportOptions = [
  { value: "car", label: "Car", icon: "🚗" },
  { value: "train", label: "Train", icon: "🚂" },
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "flight", label: "Flight", icon: "✈️" },
];

const ItineraryBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (id) fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    try {
      const res = await getItineraryById(id!);
      setItinerary(res.data);
    } catch (err) {
      console.error(err);
      navigate("/my-itineraries");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (index: number, field: string, value: any) => {
    setUpdating(true);
    try {
      const updates = { [field]: value };
      await updateItineraryDestination(itinerary._id, index, updates);
      await fetchItinerary();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (index: number) => {
    if (!confirm("Remove this destination from the itinerary?")) return;
    setUpdating(true);
    try {
      await removeFromItinerary(itinerary._id, index);
      setEditingIdx(null);
      await fetchItinerary();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleBookAll = async () => {
    if (!confirm("Book all destinations? You will be redirected to payment."))
      return;
    setBookingLoading(true);
    try {
      const res = await bookItinerary(itinerary._id);
      const itineraryId = res.data.itinerary._id;
      const paymentData = await initiateItineraryPayment(itineraryId);

      const payhere = (window as any).payhere;
      if (!payhere) {
        alert("Payment gateway not loaded. Please refresh.");
        return;
      }

      payhere.onCompleted = (orderId: string) => {
        console.log("Payment completed for itinerary:", orderId);
        navigate("/dashboard");
      };
      payhere.onDismissed = () => {
        alert(
          "Payment cancelled. Your itinerary bookings are saved as pending.",
        );
        navigate("/my-itineraries");
      };
      payhere.onError = (error: any) => {
        console.error("Payment error:", error);
        alert("Payment error occurred. Please contact support.");
        setBookingLoading(false);
      };

      payhere.startPayment(paymentData);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const calcNights = (checkIn: string, checkOut: string) =>
    Math.max(
      0,
      Math.floor(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
      ),
    );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) return <LoadingSpinner />;
  if (!itinerary)
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p
          className="text-[#1a3a5c] font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          Itinerary not found.
        </p>
      </div>
    );

  const isDraft = itinerary.status === "draft";

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Header */}
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <button
                onClick={() => navigate("/my-itineraries")}
                className="flex items-center gap-2 text-white/40 text-[10px] tracking-[0.2em] uppercase font-light hover:text-[#C9922A] transition-colors mb-4"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
                My Itineraries
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-px bg-[#C9922A]/60" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  {isDraft ? "Planning Mode" : "Booked Itinerary"}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontStyle: "italic",
                }}
                className="text-white font-light"
              >
                {itinerary.name}
              </h1>
            </div>

            {/* Status badge */}
            <div
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 border ${
                isDraft
                  ? "border-amber-400/30 bg-amber-500/10"
                  : "border-emerald-400/30 bg-emerald-500/10"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isDraft ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
              />
              <span
                className={`text-[10px] tracking-widest uppercase font-light ${isDraft ? "text-amber-400" : "text-emerald-400"}`}
              >
                {itinerary.status}
              </span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg">
            {[
              { label: "Destinations", value: itinerary.destinations.length },
              { label: "Total Nights", value: itinerary.totalNights || 0 },
              {
                label: "Total Value",
                value: `$${itinerary.totalPrice?.toLocaleString() || 0}`,
              },
            ].map((s, i) => (
              <div key={s.label} className="border border-white/10 px-4 py-3">
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 font-light mb-1">
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.4rem",
                  }}
                  className="text-[#C9922A] font-light"
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left - Destination list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#C9922A]" />
              <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                Journey Stops
              </span>
            </div>

            {itinerary.destinations.length === 0 ? (
              <div
                className="bg-white border border-dashed border-gray-200 p-12 text-center"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                <p
                  className="text-gray-400 font-light mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.2rem",
                    fontStyle: "italic",
                  }}
                >
                  No destinations yet.
                </p>
                <p className="text-gray-300 text-xs font-light mb-5">
                  Add destinations from any destination page.
                </p>
                <button
                  onClick={() => navigate("/destinations")}
                  className="px-6 py-2.5 bg-[#C9922A] text-white text-[11px] tracking-widest uppercase font-light hover:bg-[#b07d20] transition-colors"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  Browse Destinations
                </button>
              </div>
            ) : (
              itinerary.destinations.map((item: any, idx: number) => {
                const dest = item.destinationId;
                const nights = calcNights(item.checkIn, item.checkOut);
                const destPrice =
                  nights * (dest?.pricePerNight || 0) * item.guests;
                const isEditing = editingIdx === idx;

                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white border border-gray-100 overflow-hidden hover:border-[#C9922A]/20 transition-colors duration-300"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    }}
                  >
                    {/* Step indicator top bar */}
                    <div
                      className="h-1"
                      style={{
                        backgroundColor: "#C9922A",
                        opacity: 0.15 + idx * 0.1,
                      }}
                    />

                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Step number */}
                        <div className="flex-shrink-0 w-8 h-8 border border-[#C9922A]/30 flex items-center justify-center">
                          <span
                            className="text-[#C9922A] font-light"
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1rem",
                            }}
                          >
                            {idx + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Destination image + name */}
                          <div className="flex gap-3 mb-4">
                            {dest?.images?.[0] && (
                              <img
                                src={dest.images[0]}
                                alt={dest.name}
                                className="w-16 h-12 object-cover flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <h3
                                style={{
                                  fontFamily:
                                    "'Cormorant Garamond', Georgia, serif",
                                  fontSize: "1.15rem",
                                  fontStyle: "italic",
                                }}
                                className="text-[#1a3a5c] font-light truncate"
                              >
                                {dest?.name || "Destination"}
                              </h3>
                              <p className="text-gray-400 text-xs font-light">
                                {dest?.location}
                              </p>
                            </div>
                          </div>

                          {/* Summary row */}
                          <div className="flex flex-wrap gap-4 mb-3">
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Check-in
                              </p>
                              <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                {formatDate(item.checkIn)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Check-out
                              </p>
                              <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                {formatDate(item.checkOut)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Nights
                              </p>
                              <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                {nights}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Guests
                              </p>
                              <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                {item.guests}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Transport
                              </p>
                              <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                {transportOptions.find(
                                  (t) => t.value === item.transportMode,
                                )?.icon || "🚗"}{" "}
                                {item.transportMode}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">
                                Subtotal
                              </p>
                              <p
                                className="text-[#C9922A] font-light mt-0.5"
                                style={{
                                  fontFamily:
                                    "'Cormorant Garamond', Georgia, serif",
                                  fontSize: "1rem",
                                }}
                              >
                                ${destPrice.toFixed(0)}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            {isDraft && (
                              <>
                                <button
                                  onClick={() =>
                                    setEditingIdx(isEditing ? null : idx)
                                  }
                                  className="px-4 py-1.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[10px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                                >
                                  {isEditing ? "Close ↑" : "Edit ↓"}
                                </button>
                                <button
                                  onClick={() => handleRemove(idx)}
                                  disabled={updating}
                                  className="px-4 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-widest uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-40"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                            {dest?.slug && (
                              <a
                                href={`/destination/${dest.slug}`}
                                className="text-gray-300 text-[10px] tracking-widest uppercase font-light hover:text-[#C9922A] transition-colors"
                              >
                                View →
                              </a>
                            )}
                          </div>

                          {/* Edit form - expandable */}
                          <AnimatePresence>
                            {isEditing && isDraft && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                                      Check-in Date
                                    </label>
                                    <input
                                      type="date"
                                      defaultValue={item.checkIn?.split("T")[0]}
                                      disabled={updating}
                                      onChange={(e) =>
                                        handleUpdate(
                                          idx,
                                          "checkIn",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] disabled:opacity-40"
                                      style={{ borderRadius: 0 }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                                      Check-out Date
                                    </label>
                                    <input
                                      type="date"
                                      defaultValue={
                                        item.checkOut?.split("T")[0]
                                      }
                                      disabled={updating}
                                      onChange={(e) =>
                                        handleUpdate(
                                          idx,
                                          "checkOut",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] disabled:opacity-40"
                                      style={{ borderRadius: 0 }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                                      Guests
                                    </label>
                                    <select
                                      defaultValue={item.guests}
                                      disabled={updating}
                                      onChange={(e) =>
                                        handleUpdate(
                                          idx,
                                          "guests",
                                          parseInt(e.target.value),
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] disabled:opacity-40"
                                      style={{ borderRadius: 0 }}
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                        <option key={n} value={n}>
                                          {n} Guest{n > 1 ? "s" : ""}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                                      Transport Mode
                                    </label>
                                    <select
                                      defaultValue={item.transportMode}
                                      disabled={updating}
                                      onChange={(e) =>
                                        handleUpdate(
                                          idx,
                                          "transportMode",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] disabled:opacity-40"
                                      style={{ borderRadius: 0 }}
                                    >
                                      {transportOptions.map((t) => (
                                        <option key={t.value} value={t.value}>
                                          {t.icon} {t.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                                      Special Requests
                                    </label>
                                    <input
                                      type="text"
                                      defaultValue={item.specialRequests}
                                      disabled={updating}
                                      placeholder="Any special requirements..."
                                      onBlur={(e) =>
                                        handleUpdate(
                                          idx,
                                          "specialRequests",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] disabled:opacity-40"
                                      style={{ borderRadius: 0 }}
                                    />
                                  </div>
                                  {updating && (
                                    <div className="col-span-2 flex items-center gap-2">
                                      <div className="w-3 h-3 border border-[#C9922A]/30 border-t-[#C9922A] rounded-full animate-spin" />
                                      <span className="text-[10px] text-gray-400 font-light">
                                        Saving...
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Add more destinations */}
            {isDraft && itinerary.destinations.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate("/destinations")}
                className="w-full py-4 border border-dashed border-[#C9922A]/30 text-[#C9922A] text-[11px] tracking-[0.25em] uppercase font-light hover:border-[#C9922A]/60 hover:bg-[#C9922A]/5 transition-all duration-300"
              >
                + Add Another Destination
              </motion.button>
            )}
          </div>

          {/* Right - Map + Booking Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map */}
            {itinerary.destinations.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Journey Map
                  </span>
                </div>
                <div
                  className="overflow-hidden border border-gray-100"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  <ItineraryMap
                    destinations={itinerary.destinations.map(
                      (d: any) => d.destinationId,
                    )}
                  />
                </div>
              </div>
            )}

            {/* Booking Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-100 overflow-hidden"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="bg-[#0a1628] px-6 py-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-5 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                    Summary
                  </span>
                </div>
                <p
                  className="text-white font-light"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.4rem",
                    fontStyle: "italic",
                  }}
                >
                  {isDraft ? "Ready to Book?" : "Booking Summary"}
                </p>
              </div>

              <div className="px-6 py-5 space-y-3">
                {/* Per-destination breakdown */}
                {itinerary.destinations.map((item: any, idx: number) => {
                  const dest = item.destinationId;
                  const nights = calcNights(item.checkIn, item.checkOut);
                  const price =
                    nights * (dest?.pricePerNight || 0) * item.guests;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[#1a3a5c] text-xs font-light truncate">
                          {dest?.name || "—"}
                        </p>
                        <p className="text-gray-300 text-[10px]">
                          {nights} nights × {item.guests} guest
                          {item.guests > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-[#1a3a5c] text-xs font-light flex-shrink-0 ml-2">
                        ${price.toFixed(0)}
                      </span>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light">
                    Grand Total
                  </span>
                  <span
                    className="text-[#C9922A]"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.4rem",
                    }}
                  >
                    ${itinerary.totalPrice?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Book button */}
                {isDraft ? (
                  <>
                    <button
                      onClick={handleBookAll}
                      disabled={
                        bookingLoading || itinerary.destinations.length === 0
                      }
                      className="w-full py-3.5 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors duration-300 disabled:opacity-50 mt-2"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                      }}
                    >
                      {bookingLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Book All & Pay"
                      )}
                    </button>
                    <p className="text-gray-300 text-[10px] text-center font-light">
                      Secure payment via PayHere
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 text-[11px] tracking-widest uppercase font-light">
                      All Destinations Booked
                    </span>
                  </div>
                )}

                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-2.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors duration-300"
                >
                  View My Bookings
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItineraryBuilder;
