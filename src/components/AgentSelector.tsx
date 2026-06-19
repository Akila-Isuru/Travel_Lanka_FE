import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentCard from "./AgentCard";
import api from "../api/axiosInspector";

interface Agent {
  _id: string;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  specialties: string[];
  languages: string[];
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
}

interface Props {
  destinationId: string;
  checkIn: string;
  checkOut: string;
  onAgentSelect: (agent: Agent | null) => void;
  selectedAgentId: string | null;
}

const AgentSelector: React.FC<Props> = ({
  destinationId,
  checkIn,
  checkOut,
  onAgentSelect,
  selectedAgentId,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recommended, setRecommended] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Fetch agents when dates are selected
  useEffect(() => {
    if (destinationId && checkIn && checkOut) {
      fetchAgents();
      fetchRecommended();
    } else if (destinationId && !checkIn && !checkOut) {
      fetchAgents();
    }
  }, [destinationId, checkIn, checkOut]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      let url = `/agents/destination/${destinationId}`;
      if (checkIn && checkOut) {
        url += `?startDate=${checkIn}&endDate=${checkOut}`;
      }
      const res = await api.get(url);
      setAgents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    if (!checkIn || !checkOut) return;
    try {
      const res = await api.get(
        `/agents/recommended/${destinationId}?startDate=${checkIn}&endDate=${checkOut}`,
      );
      setRecommended(res.data.data || null);
    } catch (err) {
      console.error("Failed to fetch recommended agent:", err);
    }
  };

  const handleSelect = (agent: Agent) => {
    if (selectedAgent?._id === agent._id) {
      // Deselect
      setSelectedAgent(null);
      onAgentSelect(null);
    } else {
      setSelectedAgent(agent);
      onAgentSelect(agent);
    }
  };

  const handleRemove = () => {
    setSelectedAgent(null);
    onAgentSelect(null);
  };

  if (loading) {
    return (
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[#C9922A]/30 border-t-[#C9922A] rounded-full animate-spin" />
          <span className="text-[10px] text-gray-400 font-light tracking-wide">
            Finding available guides...
          </span>
        </div>
      </div>
    );
  }

  if (agents.length === 0) return null;

  const calcDays = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
      ),
    );
  };

  const days = calcDays();

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light">
            Add a Local Guide (optional)
          </label>
          {checkIn && checkOut && (
            <p className="text-[10px] text-gray-300 font-light mt-0.5">
              {agents.length} guide{agents.length !== 1 ? "s" : ""} available
              for your dates
            </p>
          )}
        </div>
        {selectedAgent && (
          <button
            onClick={handleRemove}
            className="text-red-400 text-[10px] tracking-widest uppercase font-light hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Selected agent summary */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 bg-[#C9922A]/5 border border-[#C9922A]/20 px-3 py-2.5"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedAgent.photo ? (
                <img
                  src={selectedAgent.photo}
                  alt={selectedAgent.name}
                  className="w-7 h-7 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 bg-[#1a3a5c] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">
                    {selectedAgent.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-[#1a3a5c] text-xs font-light">
                  {selectedAgent.name}
                </p>
                <p className="text-[10px] text-[#C9922A] font-light">
                  ${selectedAgent.pricePerDay}/day
                  {days > 0 && ` · $${selectedAgent.pricePerDay * days} total`}
                </p>
              </div>
            </div>
            <span className="text-[9px] tracking-widest uppercase text-[#C9922A] font-light border border-[#C9922A]/30 px-2 py-0.5">
              ✓ Added
            </span>
          </div>
        </motion.div>
      )}

      {/* Recommended agent (when dates are picked) */}
      {recommended && !selectedAgent && checkIn && checkOut && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-[#C9922A]" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C9922A] font-light">
              Recommended for your trip
            </span>
          </div>
          <AgentCard
            agent={recommended}
            isSelected={selectedAgent?._id === recommended._id}
            onSelect={handleSelect}
            showSelectButton={true}
            index={0}
          />
        </motion.div>
      )}

      {/* Show all agents toggle */}
      {!showAll && !selectedAgent && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 border border-dashed border-gray-200 text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light hover:border-[#C9922A]/30 hover:text-[#C9922A] transition-colors"
        >
          Browse All {agents.length} Guide{agents.length !== 1 ? "s" : ""}
        </button>
      )}

      {/* All agents list */}
      <AnimatePresence>
        {showAll && !selectedAgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2">
              {agents.map((agent, idx) => (
                <AgentCard
                  key={agent._id}
                  agent={agent}
                  isSelected={selectedAgent?._id === agent._id}
                  onSelect={handleSelect}
                  showSelectButton={true}
                  index={idx}
                />
              ))}
            </div>
            <button
              onClick={() => setShowAll(false)}
              className="w-full mt-2 py-1.5 text-[10px] tracking-widest uppercase text-gray-300 font-light hover:text-[#C9922A] transition-colors"
            >
              Show Less ↑
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentSelector;
