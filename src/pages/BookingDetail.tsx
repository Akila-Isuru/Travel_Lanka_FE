import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";

interface BookingDetailType {
  _id: string;
  user: string;
  destination: {
    _id: string;
    name: string;
    slug: string;
    location: string;
    images: string[];
    pricePerNight: number;
    description?: string;
  } | null;
  stayId: {
    _id: string;
    name: string;
    slug: string;
    location: string;
    images: string[];
    pricePerNight: number;
    address?: string;
    amenities?: string[];
    contactPhone?: string;
  } | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  specialRequests?: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-500 border-amber-400/30 bg-amber-50",
  confirmed: "text-emerald-600 border-emerald-400/30 bg-emerald-50",
  cancelled: "text-red-400 border-red-300/30 bg-red-50",
};

const paymentStatusColors: Record<string, string> = {
  pending: "text-amber-500",
  paid: "text-emerald-600",
  failed: "text-red-400",
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBooking(); // Refresh booking data
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calcNights = () => {
    if (!booking) return 0;
    return Math.max(
      1,
      Math.floor(
        (new Date(booking.checkOut).getTime() -
          new Date(booking.checkIn).getTime()) /
          86400000,
      ),
    );
  };

  if (loading) return <LoadingSpinner />;

  if (!booking) {
    return (
      <div className="bg-[#faf8f4] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem",
                fontStyle: "italic",
              }}
              className="text-gray-400"
            >
              Booking not found
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nights = calcNights();

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Banner with destination image */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        {booking.destination?.images?.[0] && (
          <img
            src={booking.destination.images[0]}
            alt={booking.destination.name}
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-[#0a1628]/30" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C9922A]" />
              <span
                className={`text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 font-light ${statusColors[booking.status]}`}
              >
                {booking.status}
              </span>
              <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                Booking #{booking._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontStyle: "italic",
              }}
              className="text-white font-light leading-none mb-2"
            >
              {booking.destination?.name || "Trip Details"}
            </h1>
            {booking.stayId && (
              <div className="flex items-center gap-2 text-white/60">
                <svg
                  className="w-4 h-4"
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
                <span className="text-sm font-light">
                  + {booking.stayId.name}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Check-In",
                  value: formatDate(booking.checkIn),
                  icon: "M8.25 4.5l7.5 7.5-7.5 7.5",
                },
                {
                  label: "Check-Out",
                  value: formatDate(booking.checkOut),
                  icon: "M15.75 19.5L8.25 12l7.5-7.5",
                },
                {
                  label: "Duration",
                  value: `${nights} Night${nights > 1 ? "s" : ""}`,
                  icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  label: "Guests",
                  value: `${booking.guests} Guest${booking.guests > 1 ? "s" : ""}`,
                  icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
                },
                {
                  label: "Total Price",
                  value: `$${booking.totalPrice.toLocaleString()}`,
                  icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  label: "Payment",
                  value: booking.paymentStatus.toUpperCase(),
                  icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="bg-white border border-gray-100 p-5"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-3.5 h-3.5 text-[#C9922A]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={item.icon}
                      />
                    </svg>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light">
                      {item.label}
                    </p>
                  </div>
                  <p
                    className={`text-[#1a3a5c] font-light ${
                      item.label === "Payment"
                        ? paymentStatusColors[booking.paymentStatus] || ""
                        : ""
                    }`}
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.1rem",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 p-6"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-[#C9922A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9922A] font-light">
                    Special Requests
                  </span>
                </div>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  "{booking.specialRequests}"
                </p>
              </motion.div>
            )}

            {/* Destination Details */}
            {booking.destination && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Destination
                  </span>
                </div>
                <div
                  className="bg-white border border-gray-100 overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                  }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Destination Image */}
                    <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          booking.destination.images?.[0] ||
                          "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=400"
                        }
                        alt={booking.destination.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Destination Info */}
                    <div className="flex-1 p-6">
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "1.5rem",
                          fontStyle: "italic",
                        }}
                        className="text-[#1a3a5c] font-light mb-1"
                      >
                        {booking.destination.name}
                      </h3>
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
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        {booking.destination.location}
                      </p>
                      {booking.destination.description && (
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                          {booking.destination.description.slice(0, 200)}
                          {booking.destination.description.length > 200
                            ? "..."
                            : ""}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#C9922A] text-sm font-light">
                          ${booking.destination.pricePerNight} / night
                        </span>
                        <a
                          href={`/destination/${booking.destination.slug}`}
                          className="text-[10px] tracking-widest uppercase text-[#1a3a5c] hover:text-[#C9922A] transition-colors"
                        >
                          View Destination →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stay Details */}
            {booking.stayId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Accommodation
                  </span>
                </div>
                <div
                  className="bg-white border border-gray-100 overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                  }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Stay Image */}
                    <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          booking.stayId.images?.[0] ||
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                        }
                        alt={booking.stayId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Stay Info */}
                    <div className="flex-1 p-6">
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "1.5rem",
                          fontStyle: "italic",
                        }}
                        className="text-[#1a3a5c] font-light mb-1"
                      >
                        {booking.stayId.name}
                      </h3>
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
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                        {booking.stayId.location}
                      </p>
                      {booking.stayId.address && (
                        <p className="text-gray-400 text-xs font-light mb-1">
                          📍 {booking.stayId.address}
                        </p>
                      )}
                      {booking.stayId.contactPhone && (
                        <p className="text-gray-400 text-xs font-light mb-3">
                          📞 {booking.stayId.contactPhone}
                        </p>
                      )}
                      {booking.stayId.amenities &&
                        booking.stayId.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {booking.stayId.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-1 border border-gray-200 text-gray-500 font-light"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#C9922A] text-sm font-light">
                          ${booking.stayId.pricePerNight} / night
                        </span>
                        <a
                          href={`/stay/${booking.stayId.slug}`}
                          className="text-[10px] tracking-widest uppercase text-[#1a3a5c] hover:text-[#C9922A] transition-colors"
                        >
                          View Stay →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Price Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 p-6"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-[#C9922A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9922A] font-light">
                  Price Breakdown
                </span>
              </div>
              <div className="space-y-2">
                {booking.destination && (
                  <div className="flex justify-between text-xs text-gray-400 font-light">
                    <span>
                      {booking.destination.name} ($
                      {booking.destination.pricePerNight} × {nights} nights ×{" "}
                      {booking.guests} guests)
                    </span>
                    <span>
                      $
                      {booking.destination.pricePerNight *
                        nights *
                        booking.guests}
                    </span>
                  </div>
                )}
                {booking.stayId && (
                  <div className="flex justify-between text-xs text-gray-400 font-light">
                    <span>
                      {booking.stayId.name} (${booking.stayId.pricePerNight} ×{" "}
                      {nights} nights × {booking.guests} guests)
                    </span>
                    <span>
                      ${booking.stayId.pricePerNight * nights * booking.guests}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                  <span className="text-[#1a3a5c] font-light tracking-wide uppercase text-[10px]">
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.3rem",
                    }}
                    className="text-[#C9922A] font-light"
                  >
                    ${booking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Status Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
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
                      Booking Status
                    </span>
                  </div>
                  <p
                    className="text-white font-light"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.6rem",
                      fontStyle: "italic",
                    }}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </p>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-light">
                      Payment Status
                    </span>
                    <span
                      className={`font-light ${paymentStatusColors[booking.paymentStatus]}`}
                    >
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  {booking.paymentMethod && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-light">
                        Payment Method
                      </span>
                      <span className="text-[#1a3a5c] font-light">
                        {booking.paymentMethod}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-light">Booked On</span>
                    <span className="text-[#1a3a5c] font-light">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors duration-300"
                >
                  ← Back to Dashboard
                </button>

                {booking.destination && (
                  <a
                    href={`/destination/${booking.destination.slug}`}
                    className="block text-center w-full py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors duration-300"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    View Destination
                  </a>
                )}

                {booking.stayId && (
                  <a
                    href={`/stay/${booking.stayId.slug}`}
                    className="block text-center w-full py-3 border border-[#C9922A]/30 text-[#C9922A] text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#C9922A]/5 transition-colors duration-300"
                  >
                    View Accommodation
                  </a>
                )}

                {booking.status === "pending" && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-3 border border-red-200 text-red-400 text-[11px] tracking-[0.2em] uppercase font-light hover:bg-red-50 transition-colors duration-300 disabled:opacity-40"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetail;
