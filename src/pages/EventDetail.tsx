import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import {
  getEventBySlug,
  bookEvent,
  cancelEventBooking,
} from "../services/eventService";
import type { Event } from "../types";
import api from "../api/axiosInspector";
import { initiateEventPayment } from "../services/eventService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=500";

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [tickets, setTickets] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // ===== Helper: Get event images =====
  const getEventImages = (): string[] => {
    if (!event) return [FALLBACK_IMAGE];
    if (event.images && event.images.length > 0) {
      return event.images;
    }
    if (event.coverImage) {
      return [event.coverImage];
    }
    return [FALLBACK_IMAGE];
  };

  // ===== Helper: Get display image for a specific index =====
  const getDisplayImage = (index: number = 0): string => {
    const images = getEventImages();
    return images[index] || FALLBACK_IMAGE;
  };

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await getEventBySlug(slug!);
      setEvent(res.data);
      // Check if user has already booked this event
      if (user) {
        const bookingsRes = await api.get("/events/my-bookings");
        const userBookings = bookingsRes.data.data || [];
        const existing = userBookings.find(
          (b: any) => b.event._id === res.data._id && b.status !== "cancelled",
        );
        if (existing) {
          setIsBooked(true);
          setBookingId(existing._id);
        }
      }
    } catch (err) {
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    if (!event) return null;
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (event.status === "cancelled") {
      return {
        text: "Cancelled",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
      };
    }
    if (start <= now && end >= now) {
      return {
        text: "Ongoing",
        className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }
    if (start > now) {
      return {
        text: "Upcoming",
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    }
    return {
      text: "Past",
      className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
  };

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (tickets < 1) {
      setBookingError("Please select at least 1 ticket.");
      return;
    }

    if (
      event &&
      event.maxCapacity > 0 &&
      tickets > event.maxCapacity - event.currentBookings
    ) {
      setBookingError(
        `Only ${event.maxCapacity - event.currentBookings} tickets available.`,
      );
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await bookEvent({
        eventId: event!._id,
        tickets,
        specialRequests: specialRequests || undefined,
      });

      const data = res.data;

      // ===== FIXED: Handle free events without payment =====
      if (data.totalPrice > 0 && data.status === "pending") {
        try {
          const paymentRes = await initiateEventPayment(data._id);
          const payhere = (window as any).payhere;
          if (payhere) {
            payhere.onCompleted = () => {
              navigate("/dashboard");
            };
            payhere.onDismissed = () => {
              setBookingError("Payment was cancelled.");
              setBookingLoading(false);
            };
            payhere.onError = () => {
              setBookingError("Payment error occurred.");
              setBookingLoading(false);
            };
            payhere.startPayment(paymentRes);
          } else {
            setBookingError("Payment gateway not loaded. Please try again.");
            setBookingLoading(false);
          }
        } catch (paymentErr: any) {
          setBookingError(
            paymentErr?.response?.data?.message || "Payment failed.",
          );
          setBookingLoading(false);
        }
      } else {
        // Free event or already confirmed
        setBookingSuccess(true);
        setIsBooked(true);
        setBookingId(data._id || data.data?._id);
        setBookingLoading(false);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setBookingError(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
      setBookingLoading(false);
    }
  };

  const initiatePaymentForEvent = async (bookingId: string) => {
    const res = await api.post("/payment/initiate-event", { bookingId });
    return res.data;
  };

  const handleCancelBooking = async () => {
    if (!bookingId || !confirm("Cancel this booking?")) return;
    try {
      await cancelEventBooking(bookingId);
      setIsBooked(false);
      setBookingId(null);
      await fetchEvent();
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event)
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p
          className="text-[#1a3a5c] font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          Event not found.
        </p>
      </div>
    );

  const status = getStatusBadge();
  const isPast = new Date(event.endDate) < new Date();
  const isFull =
    event.maxCapacity > 0 && event.currentBookings >= event.maxCapacity;

  const eventImages = getEventImages();
  const totalImages = eventImages.length;

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={getDisplayImage(activeImage)}
            alt={event.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover absolute inset-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />

        {/* Thumbnails - Only show if more than 1 image */}
        {totalImages > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {eventImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-14 h-10 overflow-hidden transition-all duration-300 ${
                  i === activeImage
                    ? "ring-2 ring-[#C9922A] scale-105"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
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
                {event.category}
              </span>
            </div>
            <h1
              className="text-white font-light leading-none mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                fontStyle: "italic",
              }}
            >
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm font-light">
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span>{event.location}</span>
              {status && (
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase border px-2.5 py-0.5 ${status.className}`}
                >
                  {status.text}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  About This Event
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
                {event.name}
              </h2>
              <p className="text-gray-500 text-sm font-light leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Event Details
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Start Date", value: formatDate(event.startDate) },
                  { label: "End Date", value: formatDate(event.endDate) },
                  { label: "Time", value: formatTime(event.startDate) },
                  { label: "Location", value: event.location },
                  {
                    label: "Price",
                    value: event.isFree ? "Free" : `$${event.price}`,
                  },
                  { label: "Currency", value: event.currency },
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
              </div>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Organizer
                </span>
              </div>
              <div
                className="bg-white border border-gray-100 p-6"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                <p className="text-[#1a3a5c] font-light text-lg">
                  {event.organizer}
                </p>
                <p className="text-gray-400 text-sm font-light">
                  {event.organizerEmail}
                </p>
                <p className="text-gray-400 text-sm font-light">
                  {event.organizerPhone}
                </p>
                {event.website && (
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C9922A] text-sm font-light hover:underline inline-block mt-2"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </motion.div>

            {/* Features */}
            {event.features && event.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Features
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.features.map((feature) => (
                    <span
                      key={feature}
                      className="bg-white border border-gray-100 px-4 py-2 text-sm text-gray-600 font-light"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== Gallery Section - Show all images ===== */}
            {totalImages > 1 && (
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {eventImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveImage(idx)}
                      className={`cursor-pointer overflow-hidden h-32 ${
                        activeImage === idx ? "ring-2 ring-[#C9922A]" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${event.name} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
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
                      Book Tickets
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
                    {event.isFree ? "Free Event" : `$${event.price}`}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {event.isFree ? "No payment required" : `per ticket`}
                  </p>
                </div>

                <div className="px-6 py-6 space-y-4">
                  {isBooked ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 text-center">
                        <p className="text-emerald-600 text-sm font-light">
                          You have booked this event!
                        </p>
                      </div>
                      <button
                        onClick={handleCancelBooking}
                        className="w-full py-2.5 border border-red-200 text-red-400 text-[11px] tracking-[0.2em] uppercase font-light hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ) : isPast || event.status === "cancelled" ? (
                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-center">
                      <p className="text-gray-400 text-sm font-light">
                        {event.status === "cancelled"
                          ? "This event has been cancelled."
                          : "This event has passed."}
                      </p>
                    </div>
                  ) : isFull ? (
                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                      <p className="text-amber-600 text-sm font-light">
                        This event is fully booked.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                          Number of Tickets
                        </label>
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => setTickets(Math.max(1, tickets - 1))}
                            className="px-4 py-2.5 text-gray-400 hover:text-[#1a3a5c] transition-colors"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-[#1a3a5c] font-light">
                            {tickets}
                          </span>
                          <button
                            onClick={() => {
                              const max =
                                event.maxCapacity > 0
                                  ? event.maxCapacity - event.currentBookings
                                  : 10;
                              setTickets(Math.min(max, tickets + 1));
                            }}
                            className="px-4 py-2.5 text-gray-400 hover:text-[#1a3a5c] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {event.maxCapacity > 0 && (
                          <p className="text-gray-400 text-[10px] mt-1 font-light">
                            {event.maxCapacity - event.currentBookings} tickets
                            remaining
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                          Special Requests (optional)
                        </label>
                        <textarea
                          rows={2}
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requirements or questions..."
                          className="w-full px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors resize-none"
                          style={{ borderRadius: 0 }}
                        />
                      </div>

                      {!event.isFree && (
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex justify-between text-sm font-light">
                            <span className="text-gray-400">Total</span>
                            <span
                              className="text-[#C9922A]"
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontSize: "1.2rem",
                              }}
                            >
                              ${(event.price * tickets).toFixed(2)}
                            </span>
                          </div>
                        </div>
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
                        {bookingLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : event.isFree ? (
                          "Book Free Ticket"
                        ) : (
                          "Book Now"
                        )}
                      </button>

                      {!user && (
                        <p className="text-gray-400 text-[10px] text-center font-light">
                          Please{" "}
                          <a
                            href="/login"
                            className="text-[#C9922A] hover:underline"
                          >
                            sign in
                          </a>{" "}
                          to book tickets.
                        </p>
                      )}
                    </>
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

export default EventDetail;
