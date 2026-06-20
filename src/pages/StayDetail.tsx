import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";
import { initiatePayment } from "../services/paymentService";
import type { Stay } from "../services/stayService";

// ===== NEW: Review imports =====
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import StarRating from "../components/StarRating";
import { getReviewsForTarget } from "../services/reviewService";

const StayDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stay, setStay] = useState<Stay | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // ===== NEW: Review state =====
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchStay = async () => {
      try {
        const res = await api.get(`/stays/slug/${slug}`);
        setStay(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stay:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStay();
  }, [slug]);

  // ===== NEW: Fetch reviews when stay loads =====
  useEffect(() => {
    if (stay?._id) {
      fetchReviews();
    }
  }, [stay?._id]);

  // ===== NEW: Fetch reviews function =====
  const fetchReviews = async () => {
    if (!stay?._id) return;
    try {
      const res = await getReviewsForTarget(stay._id, "stay");
      const fetchedReviews = res.data || [];
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const total = fetchedReviews.reduce(
          (sum: number, r: any) => sum + r.rating,
          0,
        );
        const avg = total / fetchedReviews.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setReviewsCount(fetchedReviews.length);
      } else {
        setAvgRating(0);
        setReviewsCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const calcNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const diff =
      new Date(bookingData.checkOut).getTime() -
      new Date(bookingData.checkIn).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const totalPrice = () => {
    if (!stay) return 0;
    return calcNights() * stay.pricePerNight * bookingData.guests;
  };

  const handleBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError("Please select check-in and check-out dates.");
      return;
    }
    if (calcNights() < 1) {
      setBookingError("Check-out must be after check-in.");
      return;
    }
    if (!(window as any).payhere) {
      setBookingError(
        "Payment gateway not loaded. Please refresh and try again.",
      );
      return;
    }
    setBookingError("");
    setBookingLoading(true);
    try {
      const destId =
        typeof stay?.destinationId === "object"
          ? (stay.destinationId as any)._id
          : stay?.destinationId;

      const bookingRes = await api.post("/bookings", {
        destination: destId,
        stayId: stay?._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: totalPrice(),
        specialRequests: bookingData.specialRequests,
        paymentAmount: totalPrice(),
      });
      const bookingId = bookingRes.data.data._id;
      const paymentData = await initiatePayment(bookingId);
      const payhere = (window as any).payhere;
      payhere.onCompleted = () => navigate("/dashboard");
      payhere.onDismissed = () => {
        setBookingError("Payment was cancelled.");
        setBookingLoading(false);
      };
      payhere.onError = () => {
        setBookingError("Payment error occurred. Please try again.");
        setBookingLoading(false);
      };
      payhere.startPayment(paymentData);
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stay)
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p
          className="text-[#1a3a5c] font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          Stay not found.
        </p>
      </div>
    );

  const destName =
    typeof stay.destinationId === "object"
      ? (stay.destinationId as any).name
      : "";
  const destSlug =
    typeof stay.destinationId === "object"
      ? (stay.destinationId as any).slug
      : "";

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={stay.images[activeImage] || stay.images[0]}
            alt={stay.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />

        {/* Thumbnails */}
        {stay.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {stay.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-14 h-10 overflow-hidden transition-all duration-300 ${
                  i === activeImage
                    ? "ring-2 ring-[#C9922A] scale-105"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Hero Text */}
        <div className="absolute bottom-20 left-0 right-0 px-6 md:px-16 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {destName && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-px bg-[#C9922A]" />
                <a
                  href={`/destination/${destSlug}`}
                  className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light hover:opacity-70 transition-opacity"
                >
                  {destName}
                </a>
              </div>
            )}
            <h1
              className="text-white font-light leading-none mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontStyle: "italic",
              }}
            >
              {stay.name}
            </h1>
            <div className="flex items-center gap-2 text-white/60 text-sm font-light">
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
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                />
              </svg>
              {stay.location}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  About
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "2rem",
                  fontStyle: "italic",
                }}
                className="text-[#1a3a5c] font-light mb-4"
              >
                {stay.name}
              </h2>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                {stay.description}
              </p>
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {[
                { label: "Location", value: stay.location },
                { label: "Price / Night", value: `$${stay.pricePerNight}` },
                { label: "Near", value: destName || "—" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-gray-100 p-5"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9922A] font-light mb-1">
                    {item.label}
                  </p>
                  <p
                    className="text-[#1a3a5c] font-light"
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

            {/* Address & Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {stay.address && (
                <div
                  className="bg-white border border-gray-100 p-5 flex gap-3 items-start"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <svg
                    className="w-4 h-4 text-[#C9922A] mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9922A] font-light mb-1">
                      Address
                    </p>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      {stay.address}
                    </p>
                  </div>
                </div>
              )}
              {stay.contactPhone && (
                <div
                  className="bg-white border border-gray-100 p-5 flex gap-3 items-start"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <svg
                    className="w-4 h-4 text-[#C9922A] mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
                    />
                  </svg>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9922A] font-light mb-1">
                      Contact
                    </p>
                    <a
                      href={`tel:${stay.contactPhone}`}
                      className="text-gray-500 text-sm font-light hover:text-[#C9922A] transition-colors"
                    >
                      {stay.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Amenities */}
            {stay.amenities && stay.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Amenities
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stay.amenities.map((amenity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-3"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      <div className="w-1 h-1 rounded-full bg-[#C9922A] flex-shrink-0" />
                      <span className="text-[#1a3a5c] text-xs font-light">
                        {amenity}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gallery */}
            {stay.images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Gallery
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stay.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveImage(idx)}
                      className={`cursor-pointer overflow-hidden ${
                        idx === 0 ? "col-span-2 h-64" : "h-44"
                      } ${activeImage === idx ? "ring-2 ring-[#C9922A]" : ""}`}
                    >
                      <img
                        src={img}
                        alt={`${stay.name} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== NEW: Reviews Section ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Guest Reviews
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size={5} />
                  <span className="text-[#1a3a5c] text-sm font-light">
                    ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="mb-5 text-[#C9922A] text-[10px] tracking-[0.2em] uppercase font-light border border-[#C9922A]/30 px-4 py-2 hover:bg-[#C9922A]/5 transition-colors"
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              )}
              {showReviewForm && user && (
                <div className="mb-6">
                  <ReviewForm
                    targetId={stay._id}
                    targetType="stay"
                    onReviewAdded={() => {
                      fetchReviews();
                      setShowReviewForm(false);
                    }}
                  />
                </div>
              )}
              <ReviewList reviews={reviews} onReviewDeleted={fetchReviews} />
            </motion.div>

            {/* Back to Destination */}
            {destSlug && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <a
                  href={`/destination/${destSlug}`}
                  className="inline-flex items-center gap-2 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light border border-[#1a3a5c]/20 px-5 py-3 hover:border-[#C9922A] hover:text-[#C9922A] transition-colors duration-300"
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
                  Back to {destName}
                </a>
              </motion.div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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
                      Reserve
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
                    Book This Stay
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    From{" "}
                    <span
                      className="text-[#C9922A] text-lg font-light"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      ${stay.pricePerNight}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase ml-1">
                      / night
                    </span>
                  </p>
                </div>

                <div className="px-6 py-6 space-y-4">
                  {!user && (
                    <div className="bg-[#faf8f4] border border-[#C9922A]/20 px-4 py-3">
                      <p className="text-[11px] text-gray-500 font-light tracking-wide">
                        Please{" "}
                        <a
                          href="/login"
                          className="text-[#C9922A] hover:underline"
                        >
                          sign in
                        </a>{" "}
                        to make a reservation.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          checkIn: e.target.value,
                        })
                      }
                      disabled={!user}
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors disabled:opacity-40"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      min={
                        bookingData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          checkOut: e.target.value,
                        })
                      }
                      disabled={!user}
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors disabled:opacity-40"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Guests
                    </label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          guests: Number(e.target.value),
                        })
                      }
                      disabled={!user}
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors disabled:opacity-40"
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
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Special Requests
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          specialRequests: e.target.value,
                        })
                      }
                      rows={2}
                      disabled={!user}
                      placeholder="Any special requirements..."
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors resize-none disabled:opacity-40"
                      style={{ borderRadius: 0 }}
                    />
                  </div>

                  {/* Price Breakdown */}
                  {calcNights() > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-gray-100 pt-4 space-y-2"
                    >
                      <div className="flex justify-between text-xs font-light text-gray-400">
                        <span>
                          ${stay.pricePerNight} × {calcNights()} nights ×{" "}
                          {bookingData.guests} guest
                          {bookingData.guests > 1 ? "s" : ""}
                        </span>
                        <span>${totalPrice()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-light">
                        <span className="text-[#1a3a5c] tracking-wide uppercase text-[10px]">
                          Total
                        </span>
                        <span
                          className="text-[#C9922A]"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.1rem",
                          }}
                        >
                          ${totalPrice()}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {bookingError && (
                    <p className="text-red-400 text-xs font-light">
                      {bookingError}
                    </p>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || !user}
                    className="w-full py-3.5 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors duration-300 disabled:opacity-50"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    {bookingLoading ? "Processing..." : "Reserve Now"}
                  </button>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-2.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors duration-300"
                  >
                    View My Bookings
                  </button>

                  {destSlug && (
                    <a
                      href={`/destination/${destSlug}`}
                      className="block text-center w-full py-2.5 border border-[#C9922A]/30 text-[#C9922A] text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#C9922A]/5 transition-colors duration-300"
                    >
                      View Destination
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StayDetail;
