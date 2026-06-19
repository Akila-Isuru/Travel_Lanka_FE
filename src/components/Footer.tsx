import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const links = [
    { label: "Destinations", to: "/destinations" },
    { label: "Plan Your Trip", to: "/plan" },
    { label: "Events", to: "/events" },
    { label: "Contact Us", to: "/contact" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Use", to: "/terms" },
  ];

  const otherSites = [
    "Sri Lanka Tourism Development Authority",
    "Sri Lanka Tourism Convention Bureau",
    "Sri Lanka Institute of Tourism",
    "Department of Immigration",
    "Electronic Travel Authorization",
    "Ministry of Tourism",
  ];

  return (
    <footer className="bg-[#0a1628] relative overflow-hidden">
      {/* Top accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,146,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute right-[-80px] bottom-[-80px] w-[400px] h-[400px] rounded-full border border-[#C9922A]/08 pointer-events-none" />
      <div className="absolute left-[-60px] top-[-60px] w-[300px] h-[300px] rounded-full border border-[#1a3a5c] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[#C9922A]/60 flex items-center justify-center text-[#C9922A] text-xs">
                SL
              </div>
              <span
                className="text-white/80 tracking-[0.3em] uppercase text-sm font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Lanka<span className="text-[#C9922A]">Travel</span>
              </span>
            </div>
            <p className="text-white/30 text-xs font-light leading-relaxed max-w-xs">
              Discover the pearl of the Indian Ocean — ancient heritage,
              pristine coastlines, and timeless traditions.
            </p>
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center gap-2 text-white/40 text-xs font-light">
                <span className="text-[#C9922A]">Tourism Hotline:</span>
                <span>1912</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs font-light">
                <span className="text-[#C9922A]">Ambulance:</span>
                <span>1990</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-px bg-[#C9922A]/60" />
              <span className="text-[#C9922A] text-[9px] tracking-[0.35em] uppercase font-light">
                Navigation
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-white/40 text-xs font-light tracking-wide hover:text-[#C9922A] transition-colors duration-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Other Sites */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-px bg-[#C9922A]/60" />
              <span className="text-[#C9922A] text-[9px] tracking-[0.35em] uppercase font-light">
                Related Sites
              </span>
            </div>
            <div className="space-y-2">
              {otherSites.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="block text-white/30 text-[11px] font-light hover:text-[#C9922A] transition-colors duration-200"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/5" />
          <div className="w-1 h-1 rotate-45 bg-[#C9922A]/40" />
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-[10px] tracking-wide font-light">
            © 2026 Sri Lanka Tourism Promotion Bureau. All Rights Reserved.
          </p>
          <p className="text-white/15 text-[10px] tracking-wide font-light">
            Developed by LankaTravel ICT Department.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
