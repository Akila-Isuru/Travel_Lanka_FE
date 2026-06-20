import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMyDetails } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import AuthVisualPanel, { GoogleIcon } from "../components/AuthVisualPanel";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("ACCESS_TOKEN", res.data.accessToken);
      localStorage.setItem("REFRESH", res.data.refreshToken);
      const userRes = await getMyDetails();
      setUser(userRes.data);
      navigate("/");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/facebook";
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
      `}</style>

      <div className="min-h-screen flex" style={{ backgroundColor: "#0a1628" }}>
        {/* ===== Left Panel - Desktop carousel with testimonials ===== */}
        <AuthVisualPanel
          variant="desktop"
          eyebrow="Welcome back"
          headline={
            <>
              Your journey
              <br />
              <span className="text-[#C9922A]">continues</span> here.
            </>
          }
          description="Sign in to access your saved itineraries, bookmarked destinations, and personalized travel plans."
        />

        {/* Right Panel - Form */}
        <div
          className="w-full lg:w-1/2 flex flex-col"
          style={{ backgroundColor: "#faf8f4" }}
        >
          <AuthVisualPanel variant="mobile" />

          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-10">
                <h1
                  className="text-[#1a3a5c] font-light mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.2rem",
                  }}
                >
                  Sign In
                </h1>
                <p className="text-gray-400 text-sm font-light">
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate("/register")}
                    className="text-[#C9922A] cursor-pointer hover:underline"
                  >
                    Create one
                  </span>
                </p>
              </div>

              <div className="space-y-4 mb-8">
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="auth-input w-full px-4 py-3.5 bg-white border border-gray-200 text-[#1a3a5c] text-sm font-light transition-colors duration-200"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <div className="flex justify-end">
                  <button className="text-xs text-[#C9922A] font-light hover:underline">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="clip-btn w-full py-4 bg-[#1a3a5c] text-white text-xs tracking-[0.25em] uppercase font-light transition-colors duration-300 hover:bg-[#C9922A] disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 text-gray-600 text-xs tracking-[0.15em] uppercase font-light hover:border-gray-400 transition-colors duration-200 bg-white"
                  style={{ borderRadius: 0 }}
                >
                  <GoogleIcon className="w-4 h-4" />
                  Continue with Google
                </button>

                <button
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 text-gray-600 text-xs tracking-[0.15em] uppercase font-light hover:border-gray-400 transition-colors duration-200 bg-white"
                  style={{ borderRadius: 0 }}
                >
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  Continue with Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
