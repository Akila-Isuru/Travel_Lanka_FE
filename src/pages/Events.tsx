import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import EventCard from "../components/EventCard";
import { getAllEvents, getEventCategories } from "../services/eventService";
import type { Event, EventCategory } from "../types";

const EVENTS_PER_PAGE = 12;

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState<
    "upcoming" | "ongoing" | "past" | "all"
  >("upcoming");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [search, selectedCategory, dateFilter, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await getEventCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: EVENTS_PER_PAGE,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (dateFilter !== "all") params.status = dateFilter;

      const res = await getAllEvents(params);
      setEvents(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Section */}
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
              Events & Festivals
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
            Discover Events in Sri Lanka
          </h1>
          <p className="text-white/40 text-sm font-light mt-4 max-w-md mx-auto leading-relaxed">
            Cultural celebrations, music festivals, and unforgettable
            experiences across the island
          </p>

          {/* Search */}
          <div className="mt-10 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search events, locations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white sticky top-[70px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-0 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setDateFilter("upcoming")}
              className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                dateFilter === "upcoming"
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setDateFilter("ongoing")}
              className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                dateFilter === "ongoing"
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setDateFilter("past")}
              className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                dateFilter === "past"
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                dateFilter === "all"
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              All
            </button>

            <div className="w-px h-8 bg-gray-200 mx-2 self-center" />

            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                selectedCategory === "all"
                  ? "border-[#C9922A] text-[#C9922A]"
                  : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-light border-b-2 transition-all duration-300 ${
                  selectedCategory === cat.category
                    ? "border-[#C9922A] text-[#C9922A]"
                    : "border-transparent text-gray-400 hover:text-[#1a3a5c]"
                }`}
              >
                {cat.category}
                <span className="ml-1.5 text-[9px] opacity-60">
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-gray-400 font-light"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.5rem",
                fontStyle: "italic",
              }}
            >
              No events found.
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-400 text-xs tracking-widest uppercase font-light">
                {events.length} event{events.length !== 1 ? "s" : ""} found
              </p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                  {dateFilter}
                </span>
              </div>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event, i) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 text-gray-400 text-xs font-light disabled:opacity-40 hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 text-xs font-light transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#C9922A] text-white"
                          : "border border-gray-200 text-gray-400 hover:border-[#C9922A] hover:text-[#C9922A]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 text-gray-400 text-xs font-light disabled:opacity-40 hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Events;
