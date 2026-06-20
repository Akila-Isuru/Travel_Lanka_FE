import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { type Destination } from "../types";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";
import { initiatePayment } from "../services/paymentService";
import DestinationMap from "../components/DestinationMap";
import AddToItineraryButton from "../components/AddToItineraryButton";
import StaySelector from "../components/StaySelector";
import type { Stay } from "../services/stayService";

type DestinationWithCoords = Destination & {
  coordinates?: {
    coordinates: [number, number];
  };
};

const DestinationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState<DestinationWithCoords | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [nearbyDestinations, setNearbyDestinations] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [travelTimes, setTravelTimes] = useState<Record<string, string>>({});
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (destination?.coordinates?.coordinates) {
      fetchNearby();
    }
  }, [destination?._id]);

  const fetchNearby = async () => {
    if (!destination?.coordinates?.coordinates) return;
    const [lng, lat] = destination.coordinates.coordinates;
    setLoadingNearby(true);
    try {
      const res = await api.get(
        `/destinations/nearby?lng=${lng}&lat=${lat}&radius=30`,
      );
      const filtered = res.data.data.filter(
        (d: any) => d._id !== destination._id,
      );
      setNearbyDestinations(filtered);

      const times: Record<string, string> = {};
      await Promise.all(
        filtered.map(async (dest: any) => {
          if (!dest?.coordinates?.coordinates) return;
          const [destLng, destLat] = dest.coordinates.coordinates;
          try {
            const response = await api.get("/travel/travel-time", {
              params: {
                startLng: lng,
                startLat: lat,
                endLng: destLng,
                endLat: destLat,
              },
            });
            const durationSec = response.data.duration;
            if (durationSec) {
              const hours = Math.floor(durationSec / 3600);
              const minutes = Math.floor((durationSec % 3600) / 60);
              times[dest._id] =
                hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
            }
          } catch (err) {
            console.error("Travel time fetch failed for", dest.name, err);
          }
        }),
      );
      setTravelTimes({ ...times });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const res = await api.get(`/destinations/slug/${slug}`);
        const dest = res.data.data;
        setDestination(dest);
        if (dest.ratingsAverage) {
          setAvgRating(dest.ratingsAverage);
          setReviewsCount(dest.ratingsQuantity || 0);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [slug]);

  useEffect(() => {
    if (destination?._id) {
      fetchReviews();
    }
  }, [destination]);

  const fetchReviews = async () => {
    if (!destination?._id) return;
    try {
      const res = await api.get(`/reviews/destination/${destination._id}`);
      const fetchedReviews = res.data.data || [];
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
        setAvgRating(destination?.ratingsAverage || 0);
        setReviewsCount(destination?.ratingsQuantity || 0);
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
    if (!destination) return 0;
    const destTotal =
      calcNights() * destination.pricePerNight * bookingData.guests;
    const stayTotal = selectedStay
      ? calcNights() * selectedStay.pricePerNight * bookingData.guests
      : 0;
    return destTotal + stayTotal;
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
      const bookingRes = await api.post("/bookings", {
        destination: destination?._id,
        stayId: selectedStay?._id || null,
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
      payhere.onCompleted = function (orderId: string) {
        navigate("/dashboard");
      };
      payhere.onDismissed = function () {
        setBookingError("Payment was cancelled.");
        setBookingLoading(false);
      };
      payhere.onError = function (error: string) {
        setBookingError("Payment error occurred. Please try again.");
        setBookingLoading(false);
      };
      payhere.startPayment(paymentData);
    } catch (err: any) {
      console.error(err);
      setBookingError(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!destination)
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p
          className="text-[#1a3a5c] font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          Destination not found.
        </p>
      </div>
    );

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero section */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={destination.images[activeImage] || destination.images[0]}
            alt={destination.name}
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

        {destination.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {destination.images.map((img, i) => (
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

        <div className="absolute bottom-20 left-0 right-0 px-6 md:px-16 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#C9922A]" />
              <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                {destination.category}
              </span>
            </div>
            <h1
              className="text-white font-light leading-none mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontStyle: "italic",
              }}
            >
              {destination.name}
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
              {destination.location}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
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
                Discover {destination.name}
              </h2>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                {destination.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {[
                { label: "Location", value: destination.location },
                { label: "Category", value: destination.category },
                {
                  label: "Price / Night",
                  value: `$${destination.pricePerNight}`,
                },
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
                    className="text-[#1a3a5c] text-sm font-light"
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

            {destination.images.length > 1 && (
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
                  {destination.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveImage(idx)}
                      className={`cursor-pointer overflow-hidden ${idx === 0 ? "col-span-2 h-64" : "h-44"} ${activeImage === idx ? "ring-2 ring-[#C9922A]" : ""}`}
                    >
                      <img
                        src={img}
                        alt={`${destination.name} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
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
                    Traveler Reviews
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
                    targetId={destination._id}
                    targetType="destination"
                    onReviewAdded={() => {
                      fetchReviews();
                      setShowReviewForm(false);
                    }}
                  />
                </div>
              )}
              <ReviewList reviews={reviews} onReviewDeleted={fetchReviews} />
            </motion.div>
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
                    Book Your Stay
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    From{" "}
                    <span
                      className="text-[#C9922A] text-lg font-light"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      ${destination.pricePerNight}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase ml-1">
                      / night
                    </span>
                  </p>
                </div>
                <div className="px-6 py-6 space-y-4">
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
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors"
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
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors"
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
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors"
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
                      placeholder="Any special requirements..."
                      className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors resize-none"
                      style={{ borderRadius: 0 }}
                    />
                  </div>

                  {/* StaySelector - below Special Requests */}
                  <StaySelector
                    destinationId={destination._id}
                    onStaySelect={setSelectedStay}
                    selectedStayId={selectedStay?._id || null}
                  />

                  {calcNights() > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-gray-100 pt-4 space-y-2"
                    >
                      <div className="flex justify-between text-xs font-light text-gray-400">
                        <span>
                          ${destination.pricePerNight} × {calcNights()} nights ×{" "}
                          {bookingData.guests} guest
                          {bookingData.guests > 1 ? "s" : ""}
                        </span>
                        <span>
                          $
                          {calcNights() *
                            destination.pricePerNight *
                            bookingData.guests}
                        </span>
                      </div>
                      {selectedStay && (
                        <div className="flex justify-between text-xs font-light text-gray-400">
                          <span>
                            {selectedStay.name} × {calcNights()} nights ×{" "}
                            {bookingData.guests} guest
                            {bookingData.guests > 1 ? "s" : ""}
                          </span>
                          <span>
                            $
                            {calcNights() *
                              selectedStay.pricePerNight *
                              bookingData.guests}
                          </span>
                        </div>
                      )}
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
                    disabled={bookingLoading}
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
                  {/* ✅ Add to Itinerary Button */}
                  <AddToItineraryButton
                    destinationId={destination._id}
                    destinationName={destination.name}
                    defaultCheckIn={bookingData.checkIn}
                    defaultCheckOut={bookingData.checkOut}
                    defaultGuests={bookingData.guests}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {destination?.coordinates?.coordinates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C9922A]" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              Explore Nearby
            </span>
          </div>
          <DestinationMap
            currentDest={destination}
            nearbyDests={nearbyDestinations}
          />
        </motion.div>
      )}

      {/* Nearby Destinations Cards */}
      {nearbyDestinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pb-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C9922A]" />
              <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                You Might Also Like
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {nearbyDestinations.map((dest) => (
                <div
                  key={dest._id}
                  className="bg-white border border-gray-100 p-4 group hover:border-[#C9922A]/30 transition-all"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <img
                    src={dest.images?.[0] || ""}
                    alt={dest.name}
                    className="w-full h-32 object-cover mb-3"
                  />
                  <h4 className="text-[#1a3a5c] font-light text-md">
                    {dest.name}
                  </h4>
                  <p className="text-gray-400 text-xs">{dest.location}</p>
                  <div className="flex items-center gap-3 mt-2 mb-2">
                    {dest.distance && (
                      <span className="flex items-center gap-1 text-gray-400 text-[11px]">
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
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
                          />
                        </svg>
                        {dest.distance.toFixed(1)} km
                      </span>
                    )}
                    {travelTimes[dest._id] ? (
                      <span className="flex items-center gap-1 text-[#C9922A] text-[11px]">
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
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                          />
                        </svg>
                        {travelTimes[dest._id]} by car
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[11px]">
                        Calculating...
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#C9922A] text-sm">
                      ${dest.pricePerNight}/night
                    </span>
                    <a
                      href={`/destination/${dest.slug}`}
                      className="text-[10px] tracking-widest uppercase text-[#1a3a5c] hover:text-[#C9922A]"
                    >
                      Explore
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default DestinationDetail;
