import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../api/axiosInspector";
import { useAuth } from "../hooks/useAuth";

const SPECIALTY_ICONS: Record<string, string> = {
  Wildlife: "🐘",
  Cultural: "🏛️",
  Adventure: "🧗",
  Beach: "🏖️",
  Spiritual: "🕌",
  Nature: "🌿",
  Food: "🍛",
  Photography: "📸",
  History: "🏺",
  Wellness: "🧘",
};

const AgentProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`/agents/slug/${slug}`);
        setAgent(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!agent)
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p
          className="text-[#1a3a5c] font-light"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          Guide not found.
        </p>
      </div>
    );

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0a1628] pt-28 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,146,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />
        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#C9922A]/08 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 text-[10px] tracking-[0.2em] uppercase font-light hover:text-[#C9922A] transition-colors mb-6"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              {agent.photo ? (
                <img
                  src={agent.photo}
                  alt={agent.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 object-cover"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                />
              ) : (
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 bg-[#1a3a5c] flex items-center justify-center"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  <span
                    className="text-white text-4xl font-light"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {agent.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-px bg-[#C9922A]/60" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Local Travel Guide
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontStyle: "italic",
                }}
                className="text-white font-light mb-3"
              >
                {agent.name}
              </h1>

              <div className="flex flex-wrap gap-4">
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#C9922A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="text-[#C9922A] text-sm font-light">
                    {agent.rating > 0 ? agent.rating.toFixed(1) : "New Guide"}
                  </span>
                  {agent.reviewCount > 0 && (
                    <span className="text-white/30 text-xs">
                      ({agent.reviewCount} reviews)
                    </span>
                  )}
                </div>

                <div className="border-l border-white/10 pl-4">
                  <span className="text-white/50 text-xs font-light">
                    {agent.yearsExperience} year{agent.yearsExperience !== 1 ? "s" : ""} experience
                  </span>
                </div>

                <div className="border-l border-white/10 pl-4">
                  <span
                    className="text-[#C9922A] font-light"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem" }}
                  >
                    ${agent.pricePerDay}
                  </span>
                  <span className="text-white/30 text-xs ml-1">/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-10">
            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">About</span>
              </div>
              <p className="text-gray-500 text-sm font-light leading-relaxed">{agent.bio}</p>
            </motion.div>

            {/* Specialties */}
            {agent.specialties.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">Specialties</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {agent.specialties.map((spec: string, idx: number) => (
                    <motion.div
                      key={spec}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-3"
                      style={{
                        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      <span className="text-lg">{SPECIALTY_ICONS[spec] || "✦"}</span>
                      <span className="text-[#1a3a5c] text-xs font-light">{spec}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Languages */}
            {agent.languages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="bg-white border border-gray-100 px-4 py-2 text-[#1a3a5c] text-xs font-light"
                      style={{
                        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Destinations covered */}
            {agent.destinations?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Destinations Covered
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.destinations.map((dest: any) => (
                    <a
                      key={dest._id}
                      href={`/destination/${dest.slug}`}
                      className="group flex items-center justify-between bg-white border border-gray-100 px-4 py-3 hover:border-[#C9922A]/30 transition-colors"
                      style={{
                        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      <div>
                        <p
                          className="text-[#1a3a5c] text-xs font-light group-hover:text-[#C9922A] transition-colors"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}
                        >
                          {dest.name}
                        </p>
                        <p className="text-gray-300 text-[10px]">{dest.location}</p>
                      </div>
                      <svg className="w-3 h-3 text-gray-300 group-hover:text-[#C9922A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right - Booking CTA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-100 overflow-hidden sticky top-24"
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              <div className="bg-[#0a1628] px-6 py-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-5 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                    Book This Guide
                  </span>
                </div>
                <p
                  className="text-white font-light"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.4rem", fontStyle: "italic" }}
                >
                  {agent.name}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  From{" "}
                  <span
                    className="text-[#C9922A] text-lg font-light"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    ${agent.pricePerDay}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase ml-1">/ day</span>
                </p>
              </div>

              <div className="px-6 py-5 space-y-3">
                <p className="text-gray-400 text-xs font-light leading-relaxed">
                  Select a destination and your travel dates to book{" "}
                  <span className="text-[#1a3a5c]">{agent.name}</span> as your guide. They'll be added to your booking.
                </p>

                {agent.destinations?.length > 0 && (
                  <a
                    href={`/destination/${agent.destinations[0].slug}`}
                    className="block w-full py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light text-center hover:bg-[#b07d20] transition-colors"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    Book via Destination
                  </a>
                )}

                <button
                  onClick={() => navigate("/destinations")}
                  className="w-full py-2.5 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
                >
                  Browse Destinations
                </button>

                {/* Stats */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                  {[
                    { label: "Experience", value: `${agent.yearsExperience}yr` },
                    { label: "Rating", value: agent.rating > 0 ? `${agent.rating}/5` : "New" },
                    { label: "Languages", value: agent.languages.length },
                    { label: "Destinations", value: agent.destinations?.length || 0 },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 font-light">{s.label}</p>
                      <p
                        className="text-[#1a3a5c] font-light mt-0.5"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem" }}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AgentProfile;