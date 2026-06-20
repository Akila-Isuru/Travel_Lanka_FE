import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";
import { createStay, updateStay, deleteStay } from "../services/stayService";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ===== NEW: Event imports =====
import {
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventBookingsAdmin,
  updateEventBookingStatusAdmin,
} from "../services/eventService";
import type { Event, EventBooking } from "../types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapClickHandler({
  setCoordinates,
}: {
  setCoordinates: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setCoordinates([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

interface Booking {
  _id: string;
  user: { name: string; email: string };
  destination: { name: string; location: string; images: string[] };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

interface Destination {
  _id: string;
  name: string;
  slug: string;
  location: string;
  category: string;
  pricePerNight: number;
  images: string[];
  description: string;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
}

interface Review {
  _id: string;
  user: { _id: string; name: string; email: string };
  destination: { _id: string; name: string; slug: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-500 border-amber-400/30 bg-amber-50",
  confirmed: "text-emerald-600 border-emerald-400/30 bg-emerald-50",
  cancelled: "text-red-400 border-red-300/30 bg-red-50",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ===== UPDATE: Add "events" to tabs =====
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "bookings"
    | "destinations"
    | "users"
    | "reviews"
    | "stays"
    | "events"
  >("overview");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== NEW: Events state =====
  const [events, setEvents] = useState<Event[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [eventFilter, setEventFilter] = useState<
    "all" | "upcoming" | "ongoing" | "past" | "draft" | "cancelled"
  >("all");

  // ===== NEW: Event form state =====
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormLoading, setEventFormLoading] = useState(false);
  const [eventDeletingId, setEventDeletingId] = useState<string | null>(null);
  const eventFileRef = useRef<HTMLInputElement>(null);

  const [eventForm, setEventForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "cultural" as Event["category"],
    subCategory: "",
    startDate: "",
    endDate: "",
    location: "",
    address: "",
    organizer: "",
    organizerEmail: "",
    organizerPhone: "",
    website: "",
    price: "",
    currency: "USD" as "USD" | "LKR",
    isFree: true,
    maxCapacity: "",
    features: "",
    destinationIds: "",
    agentIds: "",
    status: "draft" as Event["status"],
    isPublished: false,
  });
  const [eventImages, setEventImages] = useState<File[]>([]);

  // Existing state
  const [showDestForm, setShowDestForm] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [destForm, setDestForm] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    category: "",
    pricePerNight: "",
  });
  const [destImages, setDestImages] = useState<File[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const stayFileRef = useRef<HTMLInputElement>(null);

  const [showStayForm, setShowStayForm] = useState(false);
  const [editingStay, setEditingStay] = useState<any>(null);
  const [stayForm, setStayForm] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    destinationId: "",
    pricePerNight: "",
    address: "",
    contactPhone: "",
    amenities: "",
  });
  const [stayImages, setStayImages] = useState<File[]>([]);
  const [stayLoading, setStayLoading] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  // ===== UPDATED: fetchAll with events =====
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, dRes, uRes, rRes, sRes, evRes, evbRes] = await Promise.all([
        api.get("/bookings/admin/all"),
        api.get("/destinations"),
        api.get("/admin/users"),
        api.get("/admin/reviews"),
        api.get("/stays/admin/all"),
        getAllEventsAdmin(),
        getAllEventBookingsAdmin(),
      ]);
      setBookings(bRes.data.data || []);
      setDestinations(dRes.data.data || []);
      setUsers(uRes.data.data || []);
      setReviews(rRes.data.data || []);
      setStays(sRes.data.data || []);
      setEvents(evRes.data.data || []);
      setEventBookings(evbRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== NEW: Event handlers =====
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      name: "",
      slug: "",
      description: "",
      category: "cultural",
      subCategory: "",
      startDate: "",
      endDate: "",
      location: "",
      address: "",
      organizer: "",
      organizerEmail: "",
      organizerPhone: "",
      website: "",
      price: "",
      currency: "USD",
      isFree: true,
      maxCapacity: "",
      features: "",
      destinationIds: "",
      agentIds: "",
      status: "draft",
      isPublished: false,
    });
    setEventImages([]);
    setShowEventForm(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      slug: event.slug,
      description: event.description,
      category: event.category,
      subCategory: event.subCategory || "",
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      location: event.location,
      address: event.address || "",
      organizer: event.organizer,
      organizerEmail: event.organizerEmail,
      organizerPhone: event.organizerPhone,
      website: event.website || "",
      price: String(event.price),
      currency: event.currency,
      isFree: event.isFree,
      maxCapacity: String(event.maxCapacity),
      features: event.features.join(", "),
      destinationIds: Array.isArray(event.destinationIds)
        ? event.destinationIds.map((d: any) => d._id || d).join(",")
        : "",
      agentIds: Array.isArray(event.agentIds)
        ? event.agentIds.map((a: any) => a._id || a).join(",")
        : "",
      status: event.status,
      isPublished: event.isPublished,
    });
    setEventImages([]);
    setShowEventForm(true);
  };

  const handleEventSubmit = async () => {
    const required = [
      "name",
      "slug",
      "description",
      "startDate",
      "endDate",
      "location",
      "organizer",
      "organizerEmail",
      "organizerPhone",
    ];
    const missing = required.filter((f) => !(eventForm as any)[f]);
    if (missing.length > 0) {
      alert(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setEventFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(eventForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          fd.append(k, String(v));
        }
      });
      eventImages.forEach((f) => fd.append("images", f));

      if (editingEvent) {
        const res = await updateEvent(editingEvent._id, fd);
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEvent._id ? res.data : e)),
        );
      } else {
        const res = await createEvent(fd);
        setEvents((prev) => [res.data, ...prev]);
      }
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Operation failed.");
    } finally {
      setEventFormLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setEventDeletingId(id);
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setEventDeletingId(null);
    }
  };

  const handleEventBookingStatusUpdate = async (id: string, status: string) => {
    setStatusUpdating(id);
    try {
      await updateEventBookingStatusAdmin(id, status);
      setEventBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: status as any } : b)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  };

  // ===== Filtered events =====
  const filteredEvents = events.filter((e) => {
    if (eventFilter === "all") return true;
    return e.status === eventFilter;
  });

  // Existing handlers
  const openAddDest = () => {
    setEditingDest(null);
    setDestForm({
      name: "",
      slug: "",
      description: "",
      location: "",
      category: "",
      pricePerNight: "",
    });
    setDestImages([]);
    setCoordinates(null);
    setShowDestForm(true);
  };

  const openEditDest = (dest: Destination) => {
    setEditingDest(dest);
    setDestForm({
      name: dest.name,
      slug: dest.slug,
      description: dest.description,
      location: dest.location,
      category: dest.category,
      pricePerNight: String(dest.pricePerNight),
    });
    setDestImages([]);
    if (dest.coordinates?.coordinates) {
      setCoordinates(dest.coordinates.coordinates);
    } else {
      setCoordinates(null);
    }
    setShowDestForm(true);
  };

  const handleDestSubmit = async () => {
    if (
      !destForm.name ||
      !destForm.slug ||
      !destForm.location ||
      !destForm.category ||
      !destForm.pricePerNight
    ) {
      alert("Please fill all required fields.");
      return;
    }
    if (!coordinates) {
      alert("Please select location on map.");
      return;
    }
    setDestLoading(true);
    try {
      const fd = new FormData();
      Object.entries(destForm).forEach(([k, v]) => fd.append(k, v));
      destImages.forEach((f) => fd.append("images", f));
      fd.append("coordinates", JSON.stringify({ type: "Point", coordinates }));

      if (editingDest) {
        const res = await api.put(`/destinations/${editingDest._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setDestinations((prev) =>
          prev.map((d) => (d._id === editingDest._id ? res.data.data : d)),
        );
      } else {
        const res = await api.post("/destinations/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setDestinations((prev) => [...prev, res.data.data]);
      }
      setShowDestForm(false);
      setCoordinates(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Operation failed.");
    } finally {
      setDestLoading(false);
    }
  };

  const handleDeleteDest = async (id: string) => {
    if (!confirm("Delete this destination? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/destinations/${id}`);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setStatusUpdating(id);
    try {
      await api.put(`/bookings/admin/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: status as any } : b)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleRoleUpdate = async (userId: string, roles: string[]) => {
    setRoleUpdating(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { roles });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, roles } : u)),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?._id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (
      !confirm("Delete this user? All their bookings and reviews will remain.")
    )
      return;
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingId(reviewId);
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddStay = () => {
    setEditingStay(null);
    setStayForm({
      name: "",
      slug: "",
      description: "",
      location: "",
      destinationId: "",
      pricePerNight: "",
      address: "",
      contactPhone: "",
      amenities: "",
    });
    setStayImages([]);
    setShowStayForm(true);
  };

  const openEditStay = (stay: any) => {
    setEditingStay(stay);
    setStayForm({
      name: stay.name,
      slug: stay.slug,
      description: stay.description,
      location: stay.location,
      destinationId: stay.destinationId?._id || stay.destinationId,
      pricePerNight: String(stay.pricePerNight),
      address: stay.address,
      contactPhone: stay.contactPhone || "",
      amenities: Array.isArray(stay.amenities) ? stay.amenities.join(", ") : "",
    });
    setStayImages([]);
    setShowStayForm(true);
  };

  const handleStaySubmit = async () => {
    if (
      !stayForm.name ||
      !stayForm.slug ||
      !stayForm.destinationId ||
      !stayForm.pricePerNight
    ) {
      alert("Please fill required fields (name, slug, destination, price).");
      return;
    }
    setStayLoading(true);
    try {
      const fd = new FormData();
      Object.entries(stayForm).forEach(([k, v]) => fd.append(k, v));
      stayImages.forEach((f) => fd.append("images", f));

      if (editingStay) {
        const res = await updateStay(editingStay._id, fd);
        setStays((prev) =>
          prev.map((s) => (s._id === editingStay._id ? res.data : s)),
        );
      } else {
        const res = await createStay(fd);
        setStays((prev) => [...prev, res.data]);
      }
      setShowStayForm(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Stay operation failed.");
    } finally {
      setStayLoading(false);
    }
  };

  const handleDeleteStay = async (id: string) => {
    if (!confirm("Delete this stay?")) return;
    setDeletingId(id);
    try {
      await deleteStay(id);
      setStays((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ===== UPDATED: stats with events =====
  const stats = {
    totalBookings: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    revenue: bookings
      .filter((b) => b.status === "confirmed")
      .reduce((s, b) => s + b.totalPrice, 0),
    destinations: destinations.length,
    users: users.length,
    reviews: reviews.length,
    stays: stays.length,
    events: events.length,
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-px bg-[#C9922A]/60" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Admin Panel
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
                Control Centre
              </h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border border-[#C9922A]/30">
              <div className="w-2 h-2 rounded-full bg-[#C9922A] animate-pulse" />
              <span className="text-[#C9922A] text-[10px] tracking-widest uppercase font-light">
                Administrator
              </span>
            </div>
          </div>

          {/* ===== UPDATED: stats grid with Events ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { label: "Total Bookings", value: stats.totalBookings },
              { label: "Confirmed", value: stats.confirmed },
              { label: "Pending", value: stats.pending },
              { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
              { label: "Destinations", value: stats.destinations },
              { label: "Users", value: stats.users },
              { label: "Reviews", value: stats.reviews },
              { label: "Stays", value: stats.stays },
              { label: "Events", value: stats.events },
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

      {/* ===== UPDATED: Tabs with Events ===== */}
      <div className="border-b border-gray-200 bg-white sticky top-[70px] z-20 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
          {(
            [
              "overview",
              "bookings",
              "destinations",
              "stays",
              "events",
              "users",
              "reviews",
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* OVERVIEW - unchanged */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div
                    className="bg-white border border-gray-100 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: "italic",
                        }}
                        className="text-[#1a3a5c] text-lg font-light"
                      >
                        Recent Bookings
                      </h3>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className="text-[#C9922A] text-[10px] tracking-widest uppercase font-light hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((b) => (
                        <div
                          key={b._id}
                          className="flex items-center gap-3 py-2 border-b border-gray-50"
                        >
                          <img
                            src={b.destination?.images?.[0] || ""}
                            alt=""
                            className="w-10 h-10 object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1a3a5c] text-xs font-light truncate">
                              {b.destination?.name}
                            </p>
                            <p className="text-gray-300 text-[10px]">
                              {b.user?.name}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-light flex-shrink-0 ${statusColors[b.status]}`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="bg-white border border-gray-100 p-6"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                      }}
                      className="text-[#1a3a5c] text-lg font-light mb-4"
                    >
                      Quick Actions
                    </h3>
                    <button
                      onClick={openAddDest}
                      className="w-full mb-3 py-2 bg-[#C9922A] text-white text-[11px] tracking-widest uppercase font-light"
                    >
                      Add Destination
                    </button>
                    <button
                      onClick={openAddStay}
                      className="w-full mb-3 py-2 bg-[#1a3a5c] text-white text-[11px] tracking-widest uppercase font-light"
                    >
                      Add Stay
                    </button>
                    <button
                      onClick={openAddEvent}
                      className="w-full mb-3 py-2 bg-[#0a1628] text-white text-[11px] tracking-widest uppercase font-light border border-[#C9922A]/30"
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="w-full py-2 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-widest uppercase font-light"
                    >
                      Manage Users
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS - unchanged */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p
                    className="text-gray-400 text-center py-16 font-light"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.3rem",
                      fontStyle: "italic",
                    }}
                  >
                    No bookings yet.
                  </p>
                ) : (
                  bookings.map((b, i) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white border border-gray-100 overflow-hidden"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      }}
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
                          <img
                            src={b.destination?.images?.[0] || ""}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="flex-1">
                            <p
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontSize: "1.1rem",
                                fontStyle: "italic",
                              }}
                              className="text-[#1a3a5c] font-light mb-0.5"
                            >
                              {b.destination?.name}
                            </p>
                            <p className="text-gray-400 text-xs font-light mb-2">
                              {b.user?.name} · {b.user?.email}
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <p className="text-[9px] tracking-widest uppercase text-gray-300">
                                  Check-In
                                </p>
                                <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                  {formatDate(b.checkIn)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] tracking-widest uppercase text-gray-300">
                                  Check-Out
                                </p>
                                <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                  {formatDate(b.checkOut)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] tracking-widest uppercase text-gray-300">
                                  Guests
                                </p>
                                <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                  {b.guests}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] tracking-widest uppercase text-gray-300">
                                  Total
                                </p>
                                <p className="text-[#1a3a5c] text-xs font-light mt-0.5">
                                  ${b.totalPrice}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <span
                              className={`text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 font-light ${statusColors[b.status]}`}
                            >
                              {b.status}
                            </span>
                            {b.status !== "cancelled" && (
                              <select
                                value={b.status}
                                disabled={statusUpdating === b._id}
                                onChange={(e) =>
                                  handleStatusUpdate(b._id, e.target.value)
                                }
                                className="text-[10px] tracking-widest uppercase border border-gray-200 px-2 py-1.5 text-gray-500 focus:outline-none focus:border-[#C9922A] bg-white"
                                style={{ borderRadius: 0 }}
                              >
                                <option value="pending">Set Pending</option>
                                <option value="confirmed">Confirm</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* DESTINATIONS - unchanged */}
            {activeTab === "destinations" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                    {destinations.length} destinations
                  </p>
                  <button
                    onClick={openAddDest}
                    className="px-6 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    + Add Destination
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((dest, i) => (
                    <motion.div
                      key={dest._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 overflow-hidden group hover:border-[#C9922A]/20 transition-colors"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      }}
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={dest.images?.[0] || ""}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#0a1628]/80 px-2 py-1">
                          <span className="text-[#C9922A] text-[9px] tracking-widest uppercase font-light">
                            {dest.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.1rem",
                            fontStyle: "italic",
                          }}
                          className="text-[#1a3a5c] font-light mb-0.5"
                        >
                          {dest.name}
                        </h3>
                        <p className="text-gray-400 text-xs font-light mb-3">
                          {dest.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1rem",
                            }}
                            className="text-[#C9922A] font-light"
                          >
                            ${dest.pricePerNight}/night
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditDest(dest)}
                              className="px-3 py-1.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[10px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDest(dest._id)}
                              disabled={deletingId === dest._id}
                              className="px-3 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-widest uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === dest._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* STAYS MANAGEMENT - unchanged */}
            {activeTab === "stays" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                    {stays.length} stays
                  </p>
                  <button
                    onClick={openAddStay}
                    className="px-6 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    + Add Stay
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stays.map((stay, i) => (
                    <motion.div
                      key={stay._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 overflow-hidden group hover:border-[#C9922A]/20 transition-colors"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      }}
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={stay.images?.[0] || ""}
                          alt={stay.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#0a1628]/80 px-2 py-1">
                          <span className="text-[#C9922A] text-[9px] tracking-widest uppercase font-light">
                            Stay
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.1rem",
                            fontStyle: "italic",
                          }}
                          className="text-[#1a3a5c] font-light mb-0.5"
                        >
                          {stay.name}
                        </h3>
                        <p className="text-gray-400 text-xs font-light">
                          {stay.location}
                        </p>
                        <p className="text-gray-400 text-xs font-light mb-3">
                          For:{" "}
                          <span className="text-[#1a3a5c]">
                            {stay.destinationId?.name || "—"}
                          </span>
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1rem",
                            }}
                            className="text-[#C9922A] font-light"
                          >
                            ${stay.pricePerNight}/night
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditStay(stay)}
                              className="px-3 py-1.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[10px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStay(stay._id)}
                              disabled={deletingId === stay._id}
                              className="px-3 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-widest uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === stay._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== UPDATED: EVENTS MANAGEMENT with Payment Status ===== */}
            {activeTab === "events" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                      {filteredEvents.length} events
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(
                        [
                          "all",
                          "upcoming",
                          "ongoing",
                          "past",
                          "draft",
                          "cancelled",
                        ] as const
                      ).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setEventFilter(filter)}
                          className={`px-3 py-1 text-[10px] tracking-widest uppercase font-light border transition-colors ${
                            eventFilter === filter
                              ? "bg-[#C9922A] text-white border-[#C9922A]"
                              : "border-gray-200 text-gray-400 hover:border-[#C9922A] hover:text-[#C9922A]"
                          }`}
                        >
                          {filter}
                          <span className="ml-1 opacity-60">
                            (
                            {
                              events.filter(
                                (e) => filter === "all" || e.status === filter,
                              ).length
                            }
                            )
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={openAddEvent}
                    className="px-6 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    + Add Event
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <p
                      className="text-gray-400 text-center py-12 font-light"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                      }}
                    >
                      No events found.
                    </p>
                  ) : (
                    filteredEvents.map((event, i) => {
                      const isPast = new Date(event.endDate) < new Date();
                      const isOngoing =
                        new Date(event.startDate) <= new Date() &&
                        new Date(event.endDate) >= new Date();
                      const statusColor =
                        event.status === "cancelled"
                          ? "text-red-400 border-red-300/30 bg-red-50"
                          : event.status === "draft"
                            ? "text-gray-400 border-gray-300/30 bg-gray-50"
                            : isPast
                              ? "text-gray-400 border-gray-300/30 bg-gray-50"
                              : isOngoing
                                ? "text-emerald-600 border-emerald-400/30 bg-emerald-50"
                                : "text-amber-600 border-amber-400/30 bg-amber-50";

                      return (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="bg-white border border-gray-100 overflow-hidden hover:border-[#C9922A]/20 transition-colors"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                          }}
                        >
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
                              <img
                                src={
                                  event.coverImage ||
                                  event.images?.[0] ||
                                  "/event-placeholder.jpg"
                                }
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3
                                      style={{
                                        fontFamily:
                                          "'Cormorant Garamond', Georgia, serif",
                                        fontSize: "1.1rem",
                                        fontStyle: "italic",
                                      }}
                                      className="text-[#1a3a5c] font-light"
                                    >
                                      {event.name}
                                    </h3>
                                    <span
                                      className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-light ${statusColor}`}
                                    >
                                      {event.status}
                                    </span>
                                    {!event.isPublished && (
                                      <span className="text-[9px] tracking-widest uppercase border border-gray-300 px-2 py-0.5 font-light text-gray-400">
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-light">
                                    <span>
                                      {formatDate(event.startDate)} →{" "}
                                      {formatDate(event.endDate)}
                                    </span>
                                    <span className="w-px h-3 bg-gray-200" />
                                    <span>{event.location}</span>
                                    <span className="w-px h-3 bg-gray-200" />
                                    <span className="text-[#C9922A]">
                                      {event.isFree
                                        ? "Free"
                                        : `$${event.price}`}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-[#faf8f4] border border-gray-100 text-[9px] text-gray-500 font-light">
                                      {event.category}
                                    </span>
                                    {event.maxCapacity > 0 && (
                                      <span className="px-2 py-0.5 bg-[#faf8f4] border border-gray-100 text-[9px] text-gray-500 font-light">
                                        {event.currentBookings}/
                                        {event.maxCapacity} booked
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-[#faf8f4] border border-gray-100 text-[9px] text-gray-500 font-light">
                                      {event.organizer}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => openEditEvent(event)}
                                    className="px-3 py-1.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[10px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event._id)}
                                    disabled={eventDeletingId === event._id}
                                    className="px-3 py-1.5 border border-red-200 text-red-400 text-[10px] tracking-widest uppercase font-light hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    {eventDeletingId === event._id
                                      ? "..."
                                      : "Delete"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate(`/event/${event.slug}`)
                                    }
                                    className="px-3 py-1.5 border border-gray-200 text-gray-400 text-[10px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* ===== UPDATED: Event Bookings Table with Payment Status ===== */}
                {eventBookings.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-6 h-px bg-[#C9922A]" />
                      <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                        Event Bookings
                      </span>
                      <span className="text-gray-400 text-[10px] font-light ml-auto">
                        Total: {eventBookings.length} bookings
                      </span>
                    </div>
                    <div className="bg-white border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-[#0a1628] text-white/60 text-[10px] tracking-widest uppercase font-light">
                            <tr>
                              <th className="px-4 py-3">Event</th>
                              <th className="px-4 py-3">User</th>
                              <th className="px-4 py-3">Tickets</th>
                              <th className="px-4 py-3">Total</th>
                              <th className="px-4 py-3">Payment</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {eventBookings.map((b) => {
                              const event =
                                typeof b.event === "object" ? b.event : null;
                              const user =
                                typeof b.user === "object" ? b.user : null;
                              const sc =
                                statusColors[b.status] || statusColors.pending;

                              // ===== Payment status colors =====
                              const paymentStatusColor =
                                b.paymentStatus === "paid"
                                  ? "text-emerald-600 bg-emerald-50 border-emerald-400/30"
                                  : b.paymentStatus === "failed"
                                    ? "text-red-400 bg-red-50 border-red-300/30"
                                    : "text-amber-500 bg-amber-50 border-amber-400/30";

                              return (
                                <tr
                                  key={b._id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-[#1a3a5c] text-xs font-light">
                                    {event?.name || "—"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 text-xs font-light">
                                    {user?.name || "—"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 text-xs font-light">
                                    {b.tickets}
                                  </td>
                                  <td className="px-4 py-3 text-[#C9922A] text-xs font-light">
                                    ${b.totalPrice}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-light ${paymentStatusColor}`}
                                    >
                                      {b.paymentStatus || "pending"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-light ${sc}`}
                                    >
                                      {b.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={b.status}
                                      disabled={statusUpdating === b._id}
                                      onChange={(e) =>
                                        handleEventBookingStatusUpdate(
                                          b._id,
                                          e.target.value,
                                        )
                                      }
                                      className="text-[10px] tracking-widest uppercase border border-gray-200 px-2 py-1 text-gray-500 focus:outline-none focus:border-[#C9922A] bg-white"
                                      style={{ borderRadius: 0 }}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirm</option>
                                      <option value="cancelled">Cancel</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USERS MANAGEMENT - unchanged */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div
                  className="bg-white border border-gray-100 overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0a1628] text-white/60 text-[10px] tracking-widest uppercase font-light">
                        <tr>
                          <th className="px-5 py-3">Name</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Roles</th>
                          <th className="px-5 py-3">Joined</th>
                          <th className="px-5 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-5 py-3 text-[#1a3a5c] text-sm font-light">
                              {u.name}
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs font-light">
                              {u.email}
                            </td>
                            <td className="px-5 py-3">
                              <select
                                value={u.roles[0] || "USER"}
                                onChange={(e) =>
                                  handleRoleUpdate(u._id, [e.target.value])
                                }
                                disabled={
                                  roleUpdating === u._id || u._id === user?._id
                                }
                                className="text-[10px] tracking-widest uppercase border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-[#C9922A]"
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              {roleUpdating === u._id && (
                                <span className="ml-2 text-[10px] text-gray-400">
                                  Updating...
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-xs font-light">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={
                                  deletingId === u._id || u._id === user?._id
                                }
                                className="text-red-400 text-[10px] tracking-widest uppercase font-light hover:text-red-600 disabled:opacity-40"
                              >
                                {deletingId === u._id ? "..." : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS MANAGEMENT - unchanged */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p
                    className="text-gray-400 text-center py-16 font-light"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.3rem",
                      fontStyle: "italic",
                    }}
                  >
                    No reviews yet.
                  </p>
                ) : (
                  reviews.map((review, i) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white border border-gray-100 p-5"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className="text-[#1a3a5c] text-sm font-light"
                              style={{
                                fontFamily:
                                  "'Cormorant Garamond', Georgia, serif",
                                fontStyle: "italic",
                              }}
                            >
                              {review.user?.name || "Deleted User"}
                            </span>
                            <StarRating rating={review.rating} size={4} />
                          </div>
                          <p className="text-gray-500 text-xs font-light mb-1">
                            Destination:{" "}
                            <span className="text-[#C9922A]">
                              {review.destination?.name}
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs font-light">
                            {review.comment}
                          </p>
                          <p className="text-gray-300 text-[10px] mt-2">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingId === review._id}
                          className="text-red-400 text-[10px] tracking-widest uppercase font-light hover:text-red-600 disabled:opacity-40 self-start"
                        >
                          {deletingId === review._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Destination Form Modal - unchanged */}
      <AnimatePresence>
        {showDestForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a1628]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowDestForm(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#faf8f4] w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="bg-[#0a1628] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-px bg-[#C9922A]" />
                      <span className="text-[#C9922A] text-[9px] tracking-[0.3em] uppercase font-light">
                        {editingDest ? "Edit" : "New"} Destination
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "1.3rem",
                        fontStyle: "italic",
                      }}
                      className="text-white font-light"
                    >
                      {editingDest ? editingDest.name : "Add Destination"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDestForm(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                {["name", "slug", "location", "category", "pricePerNight"].map(
                  (f) => (
                    <div key={f}>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                        {f}
                      </label>
                      <input
                        type={f === "pricePerNight" ? "number" : "text"}
                        placeholder={`e.g. ${f}`}
                        value={(destForm as any)[f]}
                        onChange={(e) =>
                          setDestForm({ ...destForm, [f]: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                        style={{ borderRadius: 0 }}
                      />
                    </div>
                  ),
                )}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={destForm.description}
                    onChange={(e) =>
                      setDestForm({ ...destForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] resize-none"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Images (up to 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileRef}
                    onChange={(e) =>
                      setDestImages(Array.from(e.target.files || []))
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-gray-300 text-gray-400 text-[11px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A]"
                  >
                    {destImages.length > 0
                      ? `${destImages.length} file(s) selected`
                      : "Click to upload images"}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Location on Map (click to set)
                  </label>
                  <div style={{ height: "250px", width: "100%" }}>
                    <MapContainer
                      center={
                        coordinates
                          ? [coordinates[1], coordinates[0]]
                          : [7.8731, 80.7718]
                      }
                      zoom={7}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <MapClickHandler setCoordinates={setCoordinates} />
                      {coordinates && (
                        <Marker
                          position={[coordinates[1], coordinates[0]]}
                        ></Marker>
                      )}
                    </MapContainer>
                  </div>
                  {coordinates && (
                    <p className="text-gray-400 text-[10px] mt-1">
                      Lat: {coordinates[1].toFixed(6)}, Lng:{" "}
                      {coordinates[0].toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDestForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-400 text-[11px] tracking-[0.2em] uppercase font-light"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDestSubmit}
                    disabled={destLoading}
                    className="flex-1 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] disabled:opacity-50"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    {destLoading
                      ? "Saving..."
                      : editingDest
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stay Form Modal - unchanged */}
      <AnimatePresence>
        {showStayForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a1628]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowStayForm(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#faf8f4] w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="bg-[#0a1628] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-px bg-[#C9922A]" />
                      <span className="text-[#C9922A] text-[9px] tracking-[0.3em] uppercase font-light">
                        {editingStay ? "Edit" : "New"} Stay
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "1.3rem",
                        fontStyle: "italic",
                      }}
                      className="text-white font-light"
                    >
                      {editingStay ? editingStay.name : "Add Stay"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStayForm(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                {[
                  "name",
                  "slug",
                  "location",
                  "address",
                  "contactPhone",
                  "pricePerNight",
                ].map((f) => (
                  <div key={f}>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      {f}
                    </label>
                    <input
                      type={f === "pricePerNight" ? "number" : "text"}
                      placeholder={`e.g. ${f}`}
                      value={(stayForm as any)[f]}
                      onChange={(e) =>
                        setStayForm({ ...stayForm, [f]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Destination
                  </label>
                  <select
                    value={stayForm.destinationId}
                    onChange={(e) =>
                      setStayForm({
                        ...stayForm,
                        destinationId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                    style={{ borderRadius: 0 }}
                  >
                    <option value="">Select destination...</option>
                    {destinations.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={stayForm.description}
                    onChange={(e) =>
                      setStayForm({ ...stayForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] resize-none"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Amenities (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pool, WiFi, Breakfast"
                    value={stayForm.amenities}
                    onChange={(e) =>
                      setStayForm({ ...stayForm, amenities: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Images (up to 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={stayFileRef}
                    onChange={(e) =>
                      setStayImages(Array.from(e.target.files || []))
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() => stayFileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-gray-300 text-gray-400 text-[11px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A]"
                  >
                    {stayImages.length > 0
                      ? `${stayImages.length} file(s) selected`
                      : "Click to upload images"}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowStayForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-400 text-[11px] tracking-[0.2em] uppercase font-light"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStaySubmit}
                    disabled={stayLoading}
                    className="flex-1 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] disabled:opacity-50"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    {stayLoading
                      ? "Saving..."
                      : editingStay
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== NEW: Event Form Modal ===== */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a1628]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowEventForm(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#faf8f4] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="bg-[#0a1628] px-6 py-5 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-px bg-[#C9922A]" />
                      <span className="text-[#C9922A] text-[9px] tracking-[0.3em] uppercase font-light">
                        {editingEvent ? "Edit" : "New"} Event
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "1.3rem",
                        fontStyle: "italic",
                      }}
                      className="text-white font-light"
                    >
                      {editingEvent ? editingEvent.name : "Add Event"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "name",
                      label: "Event Name",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "slug",
                      label: "Slug",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "category",
                      label: "Category",
                      type: "select",
                      options: [
                        "cultural",
                        "music",
                        "arts",
                        "food",
                        "nature",
                        "wellness",
                        "seasonal",
                        "sports",
                        "religious",
                        "other",
                      ],
                    },
                    { key: "subCategory", label: "Sub Category", type: "text" },
                    {
                      key: "startDate",
                      label: "Start Date",
                      type: "date",
                      required: true,
                    },
                    {
                      key: "endDate",
                      label: "End Date",
                      type: "date",
                      required: true,
                    },
                    {
                      key: "location",
                      label: "Location",
                      type: "text",
                      required: true,
                    },
                    { key: "address", label: "Address", type: "text" },
                    {
                      key: "organizer",
                      label: "Organizer",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "organizerEmail",
                      label: "Organizer Email",
                      type: "email",
                      required: true,
                    },
                    {
                      key: "organizerPhone",
                      label: "Organizer Phone",
                      type: "text",
                      required: true,
                    },
                    { key: "website", label: "Website", type: "url" },
                    { key: "price", label: "Price (USD)", type: "number" },
                    {
                      key: "maxCapacity",
                      label: "Max Capacity",
                      type: "number",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={
                            (eventForm as any)[field.key] || field.options?.[0]
                          }
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              [field.key]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                          style={{ borderRadius: 0 }}
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={(eventForm as any)[field.key] || ""}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              [field.key]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                          style={{ borderRadius: 0 }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the event..."
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] resize-none"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wheelchair Access, Parking, Food Available"
                    value={eventForm.features}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, features: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Related Destinations (IDs)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 65f1a2b3..., 65f1a2b4..."
                      value={eventForm.destinationIds}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          destinationIds: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Related Agents (IDs)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 65f1a2b3..., 65f1a2b4..."
                      value={eventForm.agentIds}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, agentIds: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Status
                    </label>
                    <select
                      value={eventForm.status}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          status: e.target.value as Event["status"],
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                      style={{ borderRadius: 0 }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="past">Past</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                      Options
                    </label>
                    <div className="flex flex-col gap-1 pt-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600 font-light">
                        <input
                          type="checkbox"
                          checked={eventForm.isFree}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              isFree: e.target.checked,
                            })
                          }
                          className="accent-[#C9922A]"
                        />
                        Free Event
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600 font-light">
                        <input
                          type="checkbox"
                          checked={eventForm.isPublished}
                          onChange={(e) =>
                            setEventForm({
                              ...eventForm,
                              isPublished: e.target.checked,
                            })
                          }
                          className="accent-[#C9922A]"
                        />
                        Published
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                    Event Images (up to 10)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={eventFileRef}
                    onChange={(e) =>
                      setEventImages(Array.from(e.target.files || []))
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() => eventFileRef.current?.click()}
                    className="w-full py-3 border border-dashed border-gray-300 text-gray-400 text-[11px] tracking-widest uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                  >
                    {eventImages.length > 0
                      ? `${eventImages.length} file(s) selected`
                      : "Click to upload images"}
                  </button>
                  {editingEvent &&
                    editingEvent.images &&
                    editingEvent.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingEvent.images.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16">
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                const newImages =
                                  editingEvent.images?.filter(
                                    (_, i) => i !== idx,
                                  ) || [];
                                setEditingEvent({
                                  ...editingEvent,
                                  images: newImages,
                                });
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center hover:bg-red-600"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowEventForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-400 text-[11px] tracking-[0.2em] uppercase font-light hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEventSubmit}
                    disabled={eventFormLoading}
                    className="flex-1 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] disabled:opacity-50 transition-colors"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    {eventFormLoading
                      ? "Saving..."
                      : editingEvent
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
