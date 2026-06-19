import React from "react";
import { motion } from "framer-motion";

const ItinerarySection = () => {
  const categories = [
    {
      key: "adventure",
      title: "Adventure",
      description: "Surfing, hiking & water sports",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
        </svg>
      ),
    },
    {
      key: "cultural",
      title: "Cultural",
      description: "Temples, festivals & history",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" />
        </svg>
      ),
    },
    {
      key: "nature",
      title: "Nature",
      description: "Wildlife, waterfalls & tea estates",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#C9922A] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C9922A]" />
              <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                Plan Your Trip
              </span>
            </div>

            <h2
              className="text-[#1a3a5c] font-light leading-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "3rem", fontStyle: "italic" }}
            >
              Dream it.<br />
              <span className="not-italic text-[#C9922A]">Plan it.</span><br />
              Live it.
            </h2>

            <p className="text-gray-500 text-sm font-light leading-relaxed mb-10 max-w-md">
              Each day on this island promises new experiences, discoveries, and memories that last a lifetime. Let us craft your perfect journey.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                className="px-7 py-3.5 bg-[#1a3a5c] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#C9922A] transition-colors duration-300"
                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
              >
                View All Itineraries
              </button>
              <button className="px-7 py-3.5 border border-[#1a3a5c]/30 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors duration-300">
                Find a Travel Agent
              </button>
            </div>

            <div className="mt-8">
              <button className="flex items-center gap-2 text-gray-400 text-xs font-light tracking-wide hover:text-[#C9922A] transition-colors duration-300 group">
                <svg className="w-4 h-4 group-hover:text-[#C9922A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0z" />
                </svg>
                Apply for Sri Lanka Visa
              </button>
            </div>
          </motion.div>

          {/* Right - Category Cards */}
          <div className="space-y-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, duration: 0.6 }}
                viewport={{ once: true }}
                className="group flex items-center gap-6 bg-[#faf8f4] border border-gray-100 p-5 cursor-pointer hover:border-[#C9922A]/40 hover:bg-white transition-all duration-300"
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-[#C9922A]/50 group-hover:text-[#C9922A] transition-colors duration-300">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#1a3a5c] text-sm font-light tracking-wide group-hover:text-[#C9922A] transition-colors duration-300"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem" }}>
                    {cat.title}
                  </h3>
                  <p className="text-gray-400 text-[11px] font-light tracking-wide mt-0.5">{cat.description}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-[#C9922A] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItinerarySection;