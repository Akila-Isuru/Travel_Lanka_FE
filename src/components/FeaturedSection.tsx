import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FeaturedSection = () => {
  const features = [
    {
      id: 1,
      title: "Ayurveda Wellness",
      description: "Traditional healing & spa",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"
          />
        </svg>
      ),
      link: "/wellness",
      accent: "#C9922A",
    },
    {
      id: 2,
      title: "Adventure Tours",
      description: "Hiking, surfing & more",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0 0 12 6.75z"
          />
        </svg>
      ),
      link: "/adventures",
      accent: "#1a3a5c",
    },
    {
      id: 3,
      title: "Cultural Tours",
      description: "Temples & heritage visits",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
          />
        </svg>
      ),
      link: "/culture",
      accent: "#C9922A",
    },
    {
      id: 4,
      title: "Beach Getaways",
      description: "Sunset & ocean escapes",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"
          />
        </svg>
      ),
      link: "/beaches",
      accent: "#1a3a5c",
    },
  ];

  return (
    <section className="py-24 bg-[#faf8f4] relative">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1a3a5c 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C9922A]" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              What We Offer
            </span>
            <div className="w-8 h-px bg-[#C9922A]" />
          </div>
          <h2
            className="text-[#1a3a5c] font-light leading-none"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "2.8rem",
              fontStyle: "italic",
            }}
          >
            Curated Experiences
          </h2>
          <p className="text-gray-400 text-sm font-light mt-3 max-w-md mx-auto leading-relaxed">
            Thoughtfully designed journeys through the heart of Sri Lanka
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={feature.link} className="block">
                <div
                  className="relative overflow-hidden bg-white border border-gray-100 p-7 transition-all duration-500 group-hover:border-[#C9922A]/30 group-hover:shadow-lg"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-4 h-4"
                    style={{
                      background: `linear-gradient(135deg, transparent 50%, ${feature.accent}40 50%)`,
                    }}
                  />

                  <div
                    className="w-11 h-11 flex items-center justify-center mb-5 transition-colors duration-300"
                    style={{
                      color: feature.accent,
                      backgroundColor: `${feature.accent}12`,
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3
                    className="text-[#1a3a5c] text-sm font-light tracking-wide mb-1.5 group-hover:text-[#C9922A] transition-colors duration-300"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "1.05rem",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-[11px] font-light tracking-wide leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom arrow indicator */}
                  <div className="mt-5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 justify-center mt-16">
          <div className="w-12 h-px bg-gray-200" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#C9922A]" />
          <div className="w-12 h-px bg-gray-200" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
