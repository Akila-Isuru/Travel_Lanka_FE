import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosInspector";
import AuthVisualPanel from "../components/AuthVisualPanel";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setError("No reset token provided");
        return;
      }

      try {
        await api.get(`/auth/validate-token/${token}`);
        setIsValidToken(true);
      } catch (err: any) {
        setIsValidToken(false);
        setError(
          err?.response?.data?.message || "Invalid or expired reset token",
        );
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border border-[#C9922A]/20 rotate-45" />
            <div
              className="absolute inset-1 border border-[#C9922A]/40 rotate-12 animate-spin"
              style={{ animationDuration: "2s" }}
            />
          </div>
          <p className="text-[#C9922A] text-[10px] tracking-[0.3em] uppercase font-light animate-pulse">
            Validating link...
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div
          className="bg-white p-8 max-w-md w-full text-center"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-[#1a3a5c] font-light text-xl">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-400 text-sm font-light mt-2">
            {error || "The password reset link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-6 px-6 py-3 bg-[#C9922A] text-white text-xs tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

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
        <AuthVisualPanel
          variant="desktop"
          eyebrow="Create new password"
          headline={
            <>
              Choose a
              <br />
              <span className="text-[#C9922A]">strong</span>
              <br />
              password.
            </>
          }
          description="Your new password must be at least 8 characters and include a mix of letters, numbers, and symbols."
        />

        <div
          className="w-full lg:w-1/2 flex flex-col"
          style={{ backgroundColor: "#faf8f4" }}
        >
          <AuthVisualPanel variant="mobile" />

          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              {success ? (
                <div
                  className="bg-emerald-50 border border-emerald-200 p-6 text-center"
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-emerald-700 font-light text-lg">
                    Password Reset Successfully!
                  </h3>
                  <p className="text-emerald-600/70 text-sm font-light mt-1">
                    Your password has been reset. Redirecting to login...
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 text-[#C9922A] text-xs font-light hover:underline"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <>
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
                      Set New Password
                    </h1>
                    <p className="text-gray-400 text-sm font-light">
                      Enter your new password below
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="auth-input w-full px-4 py-3.5 bg-white border border-gray-200 text-[#1a3a5c] text-sm font-light transition-colors duration-200"
                        style={{ borderRadius: 0 }}
                        required
                        minLength={8}
                      />
                      {newPassword.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-0.5 flex-1 transition-colors duration-300"
                              style={{
                                backgroundColor:
                                  newPassword.length < 4
                                    ? i === 0
                                      ? "#ef4444"
                                      : "#e5e7eb"
                                    : newPassword.length < 8
                                      ? i < 2
                                        ? "#f59e0b"
                                        : "#e5e7eb"
                                      : newPassword.length < 12
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

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
