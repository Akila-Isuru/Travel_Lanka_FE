// frontend/src/components/AgentCard.tsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Agent } from "../types";

interface Props {
  agent: Agent;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

const AgentCard: React.FC<Props> = ({
  agent,
  isSelected = false,
  onSelect,
  onRemove,
  compact = false,
}) => {
  const displayPhoto =
    agent.photo ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(agent.name) +
      "&background=C9922A&color=fff&size=128";

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-300 ${
          isSelected
            ? "border-[#C9922A] bg-[#C9922A]/5"
            : "border-gray-100 hover:border-gray-300"
        }`}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
        onClick={onSelect}
      >
        <img
          src={displayPhoto}
          alt={agent.name}
          className="w-10 h-10 object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[#1a3a5c] text-sm font-light truncate">
            {agent.name}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>⭐ {agent.rating.toFixed(1)}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>${agent.pricePerDay}/day</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{agent.languages?.slice(0, 2).join(", ")}</span>
          </div>
        </div>
        {isSelected ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="text-red-400 text-[10px] tracking-widest uppercase font-light hover:text-red-600 transition-colors flex-shrink-0"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className="text-[#C9922A] text-[10px] tracking-widest uppercase font-light hover:underline flex-shrink-0"
          >
            Select
          </button>
        )}
      </motion.div>
    );
  }

  // Full card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 overflow-hidden group hover:border-[#C9922A]/30 transition-all duration-300"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-44 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={displayPhoto}
            alt={agent.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="text-[#1a3a5c] font-light"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.2rem",
                  fontStyle: "italic",
                }}
              >
                {agent.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span>
                  ⭐ {agent.rating.toFixed(1)} ({agent.reviewCount} reviews)
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span>{agent.yearsExperience} years exp.</span>
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-[#C9922A] font-light"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.2rem",
                }}
              >
                ${agent.pricePerDay}
                <span className="text-gray-400 text-xs font-light">/day</span>
              </p>
            </div>
          </div>

          <p className="text-gray-400 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
            {agent.bio}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {agent.specialties?.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-[#faf8f4] border border-gray-100 text-[9px] text-gray-500 font-light tracking-wide"
              >
                {s}
              </span>
            ))}
            {agent.specialties?.length > 3 && (
              <span className="px-2 py-0.5 text-[9px] text-gray-400 font-light">
                +{agent.specialties.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
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
                  d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"
                />
              </svg>
              {agent.languages?.join(", ") || "English"}
            </div>
            <Link
              to={`/agent/${agent.slug}`}
              className="text-[#C9922A] text-[10px] tracking-widest uppercase font-light hover:underline"
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;
