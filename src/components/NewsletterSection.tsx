import React, { useState } from "react";
import { motion } from "framer-motion";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="py-24 bg-[#0a1628] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,146,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#C9922A]/10 pointer-events-none" />
      <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#C9922A]/08 pointer-events-none" />
      <div className="absolute left-[-100px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#1a3a5c] pointer-events-none" />

      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9922A]/40 to-transparent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C9922A]/60" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              Stay Updated
            </span>
            <div className="w-8 h-px bg-[#C9922A]/60" />
          </div>

          <h2
            className="text-white font-light leading-tight mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "2.8rem",
              fontStyle: "italic",
            }}
          >
            Travel Inspiration,
            <br />
            <span className="text-[#C9922A]">Delivered to You</span>
          </h2>

          <p className="text-white/40 text-sm font-light leading-relaxed mb-10 max-w-sm mx-auto">
            Destination guides, exclusive offers, and seasonal highlights —
            curated for the discerning traveller.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 border border-[#C9922A] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#C9922A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white/60 text-sm font-light">
                You're on the list. Welcome aboard.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 text-white text-sm font-light placeholder-white/25 focus:outline-none focus:border-[#C9922A]/60 transition-colors duration-200"
                style={{ borderRadius: 0 }}
              />
              <button
                type="submit"
                className="px-7 py-3.5 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors duration-300 flex-shrink-0"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-white/20 text-[10px] tracking-wide font-light mt-5 uppercase">
            No spam. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
