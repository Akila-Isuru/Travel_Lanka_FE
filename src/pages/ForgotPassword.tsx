import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInspector";
import AuthVisualPanel from "../components/AuthVisualPanel";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset email");
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
      `}</style>

      <div className="min-h-screen flex" style={{ backgroundColor: "#0a1628" }}>
        <AuthVisualPanel
          variant="desktop"
          eyebrow="Need help?"
          headline={
            <>
              Reset your
              <br />
              <span className="text-[#C9922A]">password</span>
              <br />
              in minutes.
            </>
          }
          description="Enter your email address and we'll send you a link to reset your password."
        />

        <div
          className="w-full lg:w-1/2 flex flex-col"
          style={{ backgroundColor: "#faf8f4" }}
        >
          <AuthVisualPanel variant="mobile" />

          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-10">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 text-gray-400 text-[11px] font-light hover:text-[#C9922A] transition-colors mb-6"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  Back to Sign In
                </button>

                <h1
                  className="text-[#1a3a5c] font-light mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.2rem",
                  }}
                >
                  Forgot Password
                </h1>
                <p className="text-gray-400 text-sm font-light">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {success ? (
                <div
                  className="bg-emerald-50 border border-emerald-200 p-6 text-center"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <div className="text-3xl mb-3">📧</div>
                  <h3 className="text-emerald-700 font-light text-lg">
                    Check your inbox
                  </h3>
                  <p className="text-emerald-600/70 text-sm font-light mt-1">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-emerald-500/60 text-xs mt-3 font-light">
                    The link will expire in 1 hour
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 text-[#C9922A] text-xs font-light hover:underline"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm font-light">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="clip-btn w-full py-4 bg-[#C9922A] text-white text-xs tracking-[0.25em] uppercase font-light transition-colors duration-300 hover:bg-[#1a3a5c] disabled:opacity-60"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-xs text-gray-400 font-light hover:text-[#C9922A] transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
