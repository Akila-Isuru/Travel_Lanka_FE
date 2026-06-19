import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axiosInspector";

// Sri Lanka's main cities / tourist spots
const SRI_LANKA_CITIES = [
  { name: "Colombo", region: "Western Province" },
  { name: "Kandy", region: "Central Province" },
  { name: "Galle", region: "Southern Province" },
  { name: "Ella", region: "Uva Province" },
  { name: "Mirissa", region: "Southern Province" },
  { name: "Sigiriya", region: "Central Province" },
  { name: "Nuwara Eliya", region: "Central Province" },
  { name: "Trincomalee", region: "Eastern Province" },
  { name: "Jaffna", region: "Northern Province" },
  { name: "Bentota", region: "Western Province" },
  { name: "Arugam Bay", region: "Eastern Province" },
  { name: "Hikkaduwa", region: "Southern Province" },
];

const weatherIcons: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Haze: "🌫️",
  Fog: "🌫️",
};

const weatherBg: Record<string, string> = {
  Clear: "from-amber-500/10 to-orange-400/5",
  Clouds: "from-slate-400/10 to-gray-300/5",
  Rain: "from-blue-500/10 to-cyan-400/5",
  Drizzle: "from-blue-400/10 to-cyan-300/5",
  Thunderstorm: "from-purple-600/10 to-indigo-500/5",
  Mist: "from-gray-400/10 to-slate-300/5",
  Haze: "from-yellow-400/10 to-amber-300/5",
};

interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  main: string;
  icon: string;
  visibility: number;
  pressure: number;
}

const WeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState("Colombo");
  const [customCity, setCustomCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allWeather, setAllWeather] = useState<WeatherData[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // Fetch single city weather
  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/weather?city=${encodeURIComponent(city)}`);
      setWeather(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch weather data");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather for all cities
  const fetchAllWeather = async () => {
    setLoadingAll(true);
    try {
      const results = await Promise.allSettled(
        SRI_LANKA_CITIES.slice(0, 6).map((c) =>
          api.get(`/weather?city=${encodeURIComponent(c.name)}`),
        ),
      );
      const data = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value.data);
      setAllWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
    fetchAllWeather();
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCustomCity("");
    fetchWeather(city);
  };

  const handleCustomSearch = () => {
    if (customCity.trim()) {
      fetchWeather(customCity.trim());
    }
  };

  const bgClass =
    weather?.main && weatherBg[weather.main]
      ? weatherBg[weather.main]
      : "from-blue-400/10 to-cyan-300/5";

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
      <Navbar />

      {/* Hero Header */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#C9922A]/60" />
            <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
              Travel Intelligence
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontStyle: "italic",
            }}
            className="text-white font-light mb-2"
          >
            Sri Lanka Weather
          </h1>
          <p className="text-white/40 text-sm font-light">
            Live weather conditions across the island — plan your journey with
            confidence
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left - Search & City selector */}
          <div className="lg:col-span-1 space-y-6">
            {/* Custom search */}
            <div
              className="bg-white border border-gray-100 p-5"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Search City
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter any city..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()}
                  className="flex-1 px-3 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors"
                  style={{ borderRadius: 0 }}
                />
                <button
                  onClick={handleCustomSearch}
                  className="px-4 py-2.5 bg-[#C9922A] text-white text-xs hover:bg-[#b07d20] transition-colors flex-shrink-0"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick city selector */}
            <div
              className="bg-white border border-gray-100 p-5"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#C9922A]" />
                <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                  Popular Destinations
                </span>
              </div>
              <div className="space-y-1">
                {SRI_LANKA_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${
                      selectedCity === city.name && !customCity
                        ? "bg-[#C9922A]/10 border-l-2 border-[#C9922A]"
                        : "hover:bg-[#faf8f4] border-l-2 border-transparent"
                    }`}
                  >
                    <span
                      className={`text-sm font-light ${
                        selectedCity === city.name && !customCity
                          ? "text-[#C9922A]"
                          : "text-[#1a3a5c]"
                      }`}
                    >
                      {city.name}
                    </span>
                    <span className="text-gray-300 text-[10px] font-light">
                      {city.region}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Weather display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main weather card */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-gray-100 p-12 flex items-center justify-center"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 border border-[#C9922A]/20 rotate-45" />
                      <div
                        className="absolute inset-1 border border-[#C9922A]/40 rotate-12 animate-spin"
                        style={{ animationDuration: "2s" }}
                      />
                    </div>
                    <p className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light animate-pulse">
                      Fetching weather...
                    </p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-red-100 p-8 text-center"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  <p className="text-red-400 text-sm font-light">{error}</p>
                  <p className="text-gray-300 text-xs mt-1 font-light">
                    Make sure the city name is correct and the weather backend
                    is running.
                  </p>
                </motion.div>
              ) : weather ? (
                <motion.div
                  key={weather.city}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className={`bg-gradient-to-br ${bgClass} bg-white border border-gray-100 overflow-hidden`}
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  {/* Card header */}
                  <div className="bg-[#0a1628] px-8 py-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-5 h-px bg-[#C9922A]" />
                          <span className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light">
                            Live Conditions
                          </span>
                        </div>
                        <h2
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "1.8rem",
                            fontStyle: "italic",
                          }}
                          className="text-white font-light"
                        >
                          {weather.city}
                        </h2>
                        <p className="text-white/40 text-sm font-light capitalize mt-0.5">
                          {weather.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl mb-1">
                          {weatherIcons[weather.main] || "🌤️"}
                        </div>
                        <p
                          className="text-[#C9922A] font-light"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: "2.4rem",
                          }}
                        >
                          {Math.round(weather.temp)}°C
                        </p>
                        <p className="text-white/30 text-xs font-light">
                          Feels like {Math.round(weather.feels_like)}°C
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Weather details grid */}
                  <div className="p-6 bg-white/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Humidity",
                          value: `${weather.humidity}%`,
                          icon: "💧",
                        },
                        {
                          label: "Wind Speed",
                          value: `${weather.wind_speed} m/s`,
                          icon: "💨",
                        },
                        {
                          label: "Visibility",
                          value: `${((weather.visibility || 0) / 1000).toFixed(1)} km`,
                          icon: "👁️",
                        },
                        {
                          label: "Pressure",
                          value: `${weather.pressure} hPa`,
                          icon: "🌡️",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-[#faf8f4] border border-gray-100 p-4"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                          }}
                        >
                          <div className="text-xl mb-1">{item.icon}</div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-light">
                            {item.label}
                          </p>
                          <p
                            className="text-[#1a3a5c] font-light mt-0.5"
                            style={{
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1.1rem",
                            }}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Travel tip */}
                    <div className="mt-4 border border-[#C9922A]/20 bg-[#C9922A]/5 px-4 py-3 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-[#C9922A] flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                        />
                      </svg>
                      <p className="text-[#C9922A] text-xs font-light">
                        <span className="font-normal">Travel Tip: </span>
                        {weather.main === "Rain" ||
                        weather.main === "Thunderstorm"
                          ? "Carry a waterproof jacket and plan indoor activities."
                          : weather.main === "Clear" && weather.temp > 30
                            ? "It's hot and sunny — stay hydrated and use sunscreen."
                            : weather.main === "Clouds"
                              ? "Overcast skies — great for outdoor sightseeing without harsh sun."
                              : "Good conditions for travel. Enjoy your Sri Lanka journey!"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Quick overview - multiple cities */}
            {allWeather.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Island Overview
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {loadingAll
                    ? Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="bg-white border border-gray-100 p-4 animate-pulse h-20"
                            style={{
                              clipPath:
                                "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                            }}
                          />
                        ))
                    : allWeather.map((w) => (
                        <button
                          key={w.city}
                          onClick={() => handleCitySelect(w.city)}
                          className="bg-white border border-gray-100 p-4 text-left hover:border-[#C9922A]/30 transition-colors group"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-[#1a3a5c] text-xs font-light group-hover:text-[#C9922A] transition-colors truncate">
                                {w.city}
                              </p>
                              <p className="text-gray-300 text-[10px] capitalize">
                                {w.description}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <span className="text-lg">
                                {weatherIcons[w.main] || "🌤️"}
                              </span>
                              <p
                                className="text-[#C9922A] font-light"
                                style={{
                                  fontFamily:
                                    "'Cormorant Garamond', Georgia, serif",
                                  fontSize: "1rem",
                                }}
                              >
                                {Math.round(w.temp)}°C
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WeatherWidget;
