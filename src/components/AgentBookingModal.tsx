// frontend/src/components/AgentBookingModal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { bookAgent } from "../services/agentService";
import type { Agent } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  destinationId: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  onSuccess?: () => void;
}

const AgentBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  agent,
  destinationId,
  destinationName,
  checkIn,
  checkOut,
  guests,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen && user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [isOpen, user, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number (e.g., 94771234567)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await bookAgent({
        agentId: agent._id,
        destinationId,
        startDate: checkIn,
        endDate: checkOut,
        guests,
        userPhone: phone,
        specialRequests: specialRequests || undefined,
      });

      const data = res.data;
      setWhatsappUrl(data.whatsappUrl);
      setBookingRef(data.data.agentBooking._id);
      setLoading(false);

      // Open WhatsApp in new tab
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }

      if (onSuccess) onSuccess();

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setWhatsappUrl(null);
        setBookingRef(null);
      }, 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to book agent. Please try again.",
      );
      setLoading(false);
    }
  };

  if (!isOpen || !agent) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-[#0a1628]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="bg-[#faf8f4] w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0a1628] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[9px] tracking-[0.3em] uppercase font-light">
                  Book Local Agent
                </span>
              </div>
              <p
                className="text-white font-light"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.3rem",
                  fontStyle: "italic",
                }}
              >
                {agent.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
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

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {whatsappUrl ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 border border-emerald-400/30 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <p className="text-[#1a3a5c] font-light text-sm">
                Booking confirmed!
              </p>
              <p className="text-gray-400 text-xs font-light mt-1">
                WhatsApp opened with agent. Ref: #
                {bookingRef?.slice(-6).toUpperCase()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#faf8f4] border border-gray-100 p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-light">Agent</span>
                  <span className="text-[#1a3a5c] font-light">
                    {agent.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-light">Destination</span>
                  <span className="text-[#1a3a5c] font-light">
                    {destinationName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-light">Dates</span>
                  <span className="text-[#1a3a5c] font-light">
                    {new Date(checkIn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    -{" "}
                    {new Date(checkOut).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-light">Guests</span>
                  <span className="text-[#1a3a5c] font-light">{guests}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-400 font-light">Fee</span>
                  <span className="text-[#C9922A] font-light">
                    ${agent.pricePerDay} ×{" "}
                    {Math.ceil(
                      (new Date(checkOut).getTime() -
                        new Date(checkIn).getTime()) /
                        86400000,
                    )}{" "}
                    days
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 94771234567"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A]"
                  style={{ borderRadius: 0 }}
                />
                <p className="text-gray-300 text-[10px] mt-1 font-light">
                  Include country code without + or spaces. The agent will
                  contact you via WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-1.5">
                  Special Requests (optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or questions for the agent..."
                  className="w-full px-4 py-2.5 border border-gray-200 bg-white text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] resize-none"
                  style={{ borderRadius: 0 }}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-light">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 text-gray-400 text-[11px] tracking-[0.2em] uppercase font-light hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors disabled:opacity-50"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : (
                    "Book & WhatsApp"
                  )}
                </button>
              </div>

              <p className="text-gray-300 text-[10px] text-center font-light">
                You'll be redirected to WhatsApp to chat with the agent.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AgentBookingModal;
