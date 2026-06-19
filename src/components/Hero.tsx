import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "hidden" }}
      >
        <iframe
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "56.25vw",
            minHeight: "100vh",
            minWidth: "177.78vh",
            border: "none",
            pointerEvents: "none",
          }}
          src="https://www.youtube.com/embed/TlypXY8OOIQ?autoplay=1&mute=1&loop=1&playlist=TlypXY8OOIQ&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1"
          title="Sri Lanka Tourism Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0a1628]/30 to-[#0a1628]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/50 via-transparent to-transparent" />

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9922A] to-transparent" />

      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-px bg-[#C9922A]" />
          <span
            className="text-[#C9922A] text-xs tracking-[0.35em] uppercase font-light"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Pearl of the Indian Ocean
          </span>
          <div className="w-8 h-px bg-[#C9922A]" />
        </div>

        <h1
          className="text-[3.2rem] md:text-[5.5rem] font-normal text-white leading-none mb-3 tracking-tight"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
          }}
        >
          An Island Escape
        </h1>
        <p
          className="text-[2rem] md:text-[3.2rem] font-light text-[#C9922A] leading-none mb-8 tracking-widest uppercase"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            letterSpacing: "0.25em",
          }}
        >
          Awaits You
        </p>

        <p className="text-sm md:text-base max-w-xl mx-auto mb-10 text-white/70 font-light tracking-wide leading-relaxed">
          Ancient heritage, untouched beaches, and timeless traditions — all in
          one breathtaking destination.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/destinations"
            className="group relative overflow-hidden px-9 py-3.5 bg-[#C9922A] text-white text-xs tracking-[0.2em] uppercase font-light transition-all duration-500 hover:bg-[#b07d20]"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            Explore Destinations
          </Link>
          <button
            onClick={() =>
              window.open(
                "https://www.youtube.com/watch?v=TlypXY8OOIQ",
                "_blank",
              )
            }
            className="group flex items-center gap-3 px-9 py-3.5 border border-white/30 text-white text-xs tracking-[0.2em] uppercase font-light transition-all duration-300 hover:border-[#C9922A] hover:text-[#C9922A]"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Video
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0a1628]/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 grid grid-cols-3 divide-x divide-white/10">
          {[
            { num: "330+", label: "Destinations" },
            { num: "2,000+", label: "Km of Coastline" },
            { num: "8", label: "UNESCO Sites" },
          ].map((item) => (
            <div key={item.label} className="text-center px-4">
              <p
                className="text-[#C9922A] text-lg font-light"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {item.num}
              </p>
              <p className="text-white/50 text-[10px] tracking-widest uppercase mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
