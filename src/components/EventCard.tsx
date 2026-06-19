import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type Event } from "../types";

interface Props {
  event: Event;
}

const EventCard: React.FC<Props> = ({ event }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
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

  const status = getStatusBadge();

  // ===== FIXED: Get the first available image =====
  const getDisplayImage = (): string => {
    if (event.images && event.images.length > 0) {
      return event.images[0];
    }
    if (event.coverImage) {
      return event.coverImage;
    }
    return "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=500";
  };

  return (
    <Link to={`/event/${event.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group bg-white overflow-hidden border border-gray-100 hover:border-[#C9922A]/30 hover:shadow-lg transition-all duration-500 cursor-pointer"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}
      >
        <div className="relative h-52 overflow-hidden">
          <img
            src={getDisplayImage()}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=500";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-[#0a1628]/10 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`text-[9px] tracking-[0.25em] uppercase font-light px-2.5 py-1 border ${status.className}`}
            >
              {status.text}
            </span>
          </div>

          {/* Category */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#0a1628]/80 text-[#C9922A] text-[9px] tracking-[0.25em] uppercase font-light px-2.5 py-1 backdrop-blur-sm">
              {event.category}
            </span>
          </div>

          {/* Price */}
          <div className="absolute top-4 right-4">
            <span className="bg-[#C9922A] text-white text-[10px] tracking-wider font-light px-2.5 py-1">
              {event.isFree ? "Free" : `$${event.price}`}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-light tracking-wide mb-1.5">
            <span>{formatDate(event.startDate)}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{formatDate(event.endDate)}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{event.location}</span>
          </div>

          <h3
            className="text-[#1a3a5c] font-light mb-2 group-hover:text-[#C9922A] transition-colors duration-300"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.2rem",
              fontStyle: "italic",
            }}
          >
            {event.name}
          </h3>

          <p className="text-gray-400 text-xs font-light line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>

          {event.organizer && (
            <p className="text-gray-300 text-[10px] font-light mb-3">
              Organizer: {event.organizer}
            </p>
          )}

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-4 h-px bg-[#C9922A]" />
            <svg
              className="w-3 h-3 text-[#C9922A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <span className="text-[#C9922A] text-[10px] tracking-[0.2em] uppercase font-light">
              View Event
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventCard;
