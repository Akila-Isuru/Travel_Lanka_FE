import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate("/login");
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .auth-input:focus {
          outline: none;
          border-color: #C9922A;
          background: #faf8f4;
        }
        .auth-input::placeholder { color: #9ca3af; font-weight: 300; }
        .clip-btn {
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .strength-bar { transition: width 0.4s ease, background 0.4s ease; }
      `}</style>

      <div className="min-h-screen flex" style={{ backgroundColor: "#0a1628" }}>
        {/* Left Decorative Panel */}
        <div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
          style={{
            background: "linear-gradient(145deg, #1a3a5c 0%, #0a1628 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,146,42,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,146,42,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Decorative circle */}
          <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#C9922A]/10" />
          <div className="absolute right-[-30px] top-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[#C9922A]/10" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
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
          </div>

          <div className="relative z-10">
            <p className="text-[#C9922A] text-xs tracking-[0.35em] uppercase mb-4">
              Begin your journey
            </p>
            <h2
              className="text-white font-light leading-tight mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "3rem",
                fontStyle: "italic",
              }}
            >
              Discover the
              <br />
              <span className="text-[#C9922A]">Pearl of the</span>
              <br />
              Indian Ocean.
            </h2>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
              Join thousands of travellers who've made Sri Lanka their favourite
              destination. Plan, discover, and explore.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 space-y-3">
            {[
              "Personalized itineraries",
              "Exclusive destination guides",
              "Local travel insights",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-4 h-px bg-[#C9922A]" />
                <span className="text-white/50 text-xs tracking-wide font-light">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
          style={{ backgroundColor: "#faf8f4" }}
        >
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10">
              <div className="w-7 h-7 border border-[#C9922A] flex items-center justify-center text-[#C9922A] text-xs">
                SL
              </div>
              <span
                className="tracking-[0.3em] uppercase text-sm font-light text-[#1a3a5c]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Lanka<span className="text-[#C9922A]">Travel</span>
              </span>
            </div>

            <div className="mb-10">
              <h1
                className="text-[#1a3a5c] font-light mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "2.2rem",
                }}
              >
                Create Account
              </h1>
              <p className="text-gray-400 text-sm font-light">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-[#C9922A] cursor-pointer hover:underline"
                >
                  Sign in
                </span>
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input w-full px-4 py-3.5 bg-white border border-gray-200 text-[#1a3a5c] text-sm font-light transition-colors duration-200"
                  style={{ borderRadius: 0 }}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input w-full px-4 py-3.5 bg-white border border-gray-200 text-[#1a3a5c] text-sm font-light transition-colors duration-200"
                  style={{ borderRadius: 0 }}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  className="auth-input w-full px-4 py-3.5 bg-white border border-gray-200 text-[#1a3a5c] text-sm font-light transition-colors duration-200"
                  style={{ borderRadius: 0 }}
                />
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 transition-colors duration-300"
                        style={{
                          backgroundColor:
                            password.length < 4
                              ? i === 0
                                ? "#ef4444"
                                : "#e5e7eb"
                              : password.length < 8
                                ? i < 2
                                  ? "#f59e0b"
                                  : "#e5e7eb"
                                : password.length < 12
                                  ? i < 3
                                    ? "#C9922A"
                                    : "#e5e7eb"
                                  : "#10b981",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-light leading-relaxed mb-6">
              By creating an account, you agree to our{" "}
              <span className="text-[#C9922A] cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-[#C9922A] cursor-pointer hover:underline">
                Privacy Policy
              </span>
              .
            </p>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="clip-btn w-full py-4 bg-[#C9922A] text-white text-xs tracking-[0.25em] uppercase font-light transition-colors duration-300 hover:bg-[#1a3a5c] disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
