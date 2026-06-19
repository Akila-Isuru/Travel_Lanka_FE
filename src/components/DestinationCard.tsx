import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type Destination } from "../types";

interface Props {
  destination: Destination;
}

const DestinationCard: React.FC<Props> = ({ destination }) => {
  return (
    <Link to={`/destination/${destination.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group bg-white overflow-hidden border border-gray-100 hover:border-[#C9922A]/30 hover:shadow-lg transition-all duration-500 cursor-pointer"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={
              destination.images[0] ||
              "https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=500"
            }
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-[#0a1628]/10 to-transparent" />

          {/* Category Tag */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#0a1628]/80 text-[#C9922A] text-[9px] tracking-[0.25em] uppercase font-light px-2.5 py-1 backdrop-blur-sm">
              {destination.category}
            </span>
          </div>

          {/* Price */}
          <div className="absolute top-4 right-4">
            <span className="bg-[#C9922A] text-white text-[10px] tracking-wider font-light px-2.5 py-1">
              ${destination.pricePerNight}
              <span className="opacity-70">/night</span>
            </span>
          </div>

          {/* Location */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/80 text-xs font-light">
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
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            className="text-[#1a3a5c] font-light mb-2 group-hover:text-[#C9922A] transition-colors duration-300"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.2rem",
              fontStyle: "italic",
            }}
          >
            {destination.name}
          </h3>
          <p className="text-gray-400 text-xs font-light line-clamp-2 leading-relaxed mb-4">
            {destination.description}
          </p>
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
              Explore
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default DestinationCard;
