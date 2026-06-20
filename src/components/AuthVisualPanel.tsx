import React, { useState, useEffect, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import sigiriyaLogin from "../assets/sigiriyaLogin.jpg";
import ellaLogin from "../assets/ellaLogin.jpg";
import beachLogin from "../assets/BeachLogin.jpg";

import img1 from "../assets/yalaLogin.jpg";
import img2 from "../assets/minnariyaLoign.jpg";
import img5 from "../assets/bentotaLogin.jpg";
import img7 from "../assets/galleLogin.jpg";
import img9 from "../assets/temple.jpg";
import img10 from "../assets/ADMASpeakLogin.jpg";

export interface AuthSlide {
  image: string;
  alt: string;
  quote: string;
  name: string;
  location: string;
  country: string;
  rating: number;
}

export const AUTH_SLIDES: AuthSlide[] = [
  {
    image: sigiriyaLogin,
    alt: "Sigiriya Rock Fortress at sunrise",
    quote:
      "Climbing Sigiriya at dawn was the highlight of our entire trip. LankaTravel planned every detail perfectly.",
    name: "Emma Whitfield",
    location: "London",
    country: "United Kingdom",
    rating: 5,
  },
  {
    image: ellaLogin,
    alt: "Nine Arch Bridge, Ella",
    quote:
      "The train ride through Ella was breathtaking. Booking through this app made everything effortless.",
    name: "Daniel Kruger",
    location: "Cape Town",
    country: "South Africa",
    rating: 5,
  },
  {
    image: beachLogin,
    alt: "Mirissa coastline at golden hour",
    quote:
      "From whale watching to beachfront stays, our Sri Lanka trip exceeded every expectation.",
    name: "Priya Nair",
    location: "Mumbai",
    country: "India",
    rating: 5,
  },
  // ===== NEW Reviews =====
  {
    image: img1,
    alt: "Wildlife safari in Yala National Park",
    quote:
      "The wildlife safari in Yala was incredible! We spotted leopards, elephants, and so many birds. A once-in-a-lifetime experience.",
    name: "Michael Chen",
    location: "Singapore",
    country: "Singapore",
    rating: 5,
  },
  {
    image: img2,
    alt: "Elephant gathering at Minneriya",
    quote:
      "Seeing over 200 elephants gather at Minneriya was magical. The guide was knowledgeable and made the experience unforgettable.",
    name: "Sarah Thompson",
    location: "Sydney",
    country: "Australia",
    rating: 5,
  },
  {
    image: img5,
    alt: "Golden beaches of Bentota",
    quote:
      "The beaches in Bentota are pure paradise. The accommodation was luxurious and the service was exceptional.",
    name: "James Wilson",
    location: "New York",
    country: "United States",
    rating: 5,
  },
  {
    image: img7,
    alt: "Galle Fort at sunset",
    quote:
      "Walking through the historic Galle Fort at sunset was like stepping back in time. The views of the ocean were breathtaking.",
    name: "Aisha Patel",
    location: "Dubai",
    country: "United Arab Emirates",
    rating: 5,
  },
  {
    image: img9,
    alt: "Temple of the Sacred Tooth Relic, Kandy",
    quote:
      "Visiting the Temple of the Tooth Relic was a deeply moving experience. The serenity and devotion I felt there will stay with me forever.",
    name: "Liam O'Brien",
    location: "Dublin",
    country: "Ireland",
    rating: 5,
  },
  // ===== NEW: Replaced img10 with Adam's Peak =====
  {
    image: img10,
    alt: "Adam's Peak sunrise pilgrimage",
    quote:
      "Climbing Adam's Peak before dawn to witness the sunrise was the most spiritual journey of my life. Sri Lanka is truly blessed.",
    name: "Yuki Tanaka",
    location: "Tokyo",
    country: "Japan",
    rating: 5,
  },
];

const SLIDE_DURATION = 5000;

const StarIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="#C9922A">
    <path d="M10 1.5l2.59 5.97 6.41.56-4.86 4.27 1.46 6.3L10 15.4l-5.6 3.2 1.46-6.3L1 8.03l6.41-.56L10 1.5z" />
  </svg>
);

const StarRating = ({
  rating,
  size = 3.5,
}: {
  rating: number;
  size?: number;
}) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`w-${size} h-${size}`} />
    ))}
  </div>
);

const TrustBadge = ({ light = false }: { light?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className="w-3 h-3" />
      ))}
    </div>
    <span
      className={`text-[11px] tracking-wide font-light ${
        light ? "text-white/80" : "text-white/60"
      }`}
    >
      4.9 &middot; Trusted by travellers from 40+ countries
    </span>
  </div>
);

export const GoogleIcon = ({
  className = "w-4 h-4",
}: {
  className?: string;
}) => (
  <svg className={className} viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

interface AuthVisualPanelProps {
  variant?: "desktop" | "mobile";
  eyebrow?: string;
  headline?: ReactNode;
  description?: string;
}

const AuthVisualPanel = ({
  variant = "desktop",
  eyebrow,
  headline,
  description,
}: AuthVisualPanelProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % AUTH_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const slide = AUTH_SLIDES[index];

  // ===== Mobile: compact hero strip =====
  if (variant === "mobile") {
    return (
      <div className="lg:hidden relative h-56 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Very light overlay - just enough for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 border border-[#C9922A] flex items-center justify-center text-[#C9922A] text-xs bg-black/30 backdrop-blur-sm">
              SL
            </div>
            <span
              className="tracking-[0.3em] uppercase text-sm font-light text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Lanka<span className="text-[#C9922A]">Travel</span>
            </span>
          </div>

          <TrustBadge light />
        </div>
      </div>
    );
  }

  // ===== Desktop: Full image with minimal overlay =====
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
      {/* ===== Full background image ===== */}
      <AnimatePresence mode="sync">
        <motion.img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* ===== Minimal overlay - just for text readability ===== */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Decorative subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top: logo + trust badge */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#C9922A]/60 flex items-center justify-center text-[#C9922A] text-xs bg-black/20 backdrop-blur-sm">
            SL
          </div>
          <span
            className="text-white/90 tracking-[0.3em] uppercase text-sm font-light"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Lanka<span className="text-[#C9922A]">Travel</span>
          </span>
        </div>
        <div className="mt-6">
          <TrustBadge light />
        </div>
      </div>

      {/* Middle: page-specific headline */}
      {(eyebrow || headline || description) && (
        <div className="relative z-10">
          {eyebrow && (
            <p className="text-[#C9922A] text-xs tracking-[0.35em] uppercase mb-4">
              {eyebrow}
            </p>
          )}
          {headline && (
            <h2
              className="text-white font-light leading-tight mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "3rem",
                fontStyle: "italic",
              }}
            >
              {headline}
            </h2>
          )}
          {description && (
            <p className="text-white/70 text-sm font-light leading-relaxed max-w-xs">
              {description}
            </p>
          )}
        </div>
      )}

      {/* ===== Bottom: Highlighted Testimonial ===== */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {/* ===== Testimonial Card with Glassmorphism ===== */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-sm p-6">
              {/* ===== Rating Stars ===== */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" />
                ))}
              </div>

              <p
                className="text-white font-light leading-relaxed mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.3rem",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{slide.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#C9922A] text-xs tracking-[0.2em] uppercase font-light">
                    {slide.name}
                  </p>
                  <p className="text-white/50 text-[11px] font-light mt-0.5">
                    {slide.location}, {slide.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-3 h-3" />
                    ))}
                  </div>
                  <span className="text-white/40 text-[10px] font-light">
                    Verified Booking
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-7">
          {AUTH_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="h-[2px] transition-all duration-300"
              style={{
                width: i === index ? "28px" : "12px",
                backgroundColor:
                  i === index ? "#C9922A" : "rgba(255,255,255,0.25)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-4 text-white/20 text-[10px] tracking-widest font-light">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(AUTH_SLIDES.length).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
};

export default AuthVisualPanel;
