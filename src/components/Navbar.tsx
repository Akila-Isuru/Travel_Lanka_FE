import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/authService";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  // ===== UPDATED: navLinks with Events =====
  const navLinks = [
    { name: "What's New", path: "/" },
    { name: "What To Do", path: "/destinations" },
    { name: "Where To Go", path: "/destinations" },
    { name: "Plan Your Trip", path: "/my-itineraries" },
    { name: "Events", path: "/events" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          transition: width 0.35s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.active::after { width: 100%; }
        .scrolled .nav-link-underline::after { background: #1a3a5c; }
        .unscrolled .nav-link-underline::after { background: #C9922A; }
      `}</style>

      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-500 ${
          isScrolled
            ? "scrolled bg-[#faf8f4]/96 backdrop-blur-md shadow-sm border-b border-[#C9922A]/20"
            : "unscrolled bg-transparent"
        }`}
      >
        {!isScrolled && (
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9922A]/60 to-transparent" />
        )}

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[70px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className={`w-7 h-7 flex items-center justify-center text-sm border ${isScrolled ? "border-[#C9922A] text-[#C9922A]" : "border-white/50 text-white"}`}
              >
                SL
              </div>
              <span
                className={`text-sm tracking-[0.25em] uppercase transition-colors ${isScrolled ? "text-[#1a3a5c]" : "text-white"}`}
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  letterSpacing: "0.3em",
                }}
              >
                Lanka<span className="text-[#C9922A]">Travel</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative nav-link-underline text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 font-light ${
                    isScrolled
                      ? isActive(link.path)
                        ? "text-[#1a3a5c] font-normal"
                        : "text-[#4a5568] hover:text-[#1a3a5c]"
                      : isActive(link.path)
                        ? "text-[#C9922A]"
                        : "text-white/80 hover:text-white"
                  } ${isActive(link.path) ? "active" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              <button
                className={`text-[11px] tracking-[0.2em] uppercase font-light transition-colors ${isScrolled ? "text-[#4a5568] hover:text-[#1a3a5c]" : "text-white/60 hover:text-white"}`}
              >
                EN
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className={`text-[11px] tracking-[0.18em] uppercase font-light transition-colors ${
                      isScrolled
                        ? "text-[#4a5568] hover:text-[#C9922A]"
                        : "text-white/70 hover:text-[#C9922A]"
                    } ${location.pathname === "/dashboard" ? "text-[#C9922A]" : ""}`}
                  >
                    My Trips
                  </Link>

                  {/* Admin Link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`text-[11px] tracking-[0.18em] uppercase font-light transition-colors ${
                        isScrolled
                          ? "text-[#4a5568] hover:text-[#C9922A]"
                          : "text-white/70 hover:text-[#C9922A]"
                      } ${location.pathname === "/admin" ? "text-[#C9922A]" : ""}`}
                    >
                      Admin
                    </Link>
                  )}

                  <span
                    className={`text-xs font-light ${isScrolled ? "text-[#4a5568]" : "text-white/70"}`}
                  >
                    {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-1.5 text-[11px] tracking-[0.15em] uppercase font-light border transition-all duration-300 ${
                      isScrolled
                        ? "border-red-300 text-red-500 hover:bg-red-50"
                        : "border-red-400/50 text-red-300 hover:border-red-300"
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-5 py-2 text-[11px] tracking-[0.2em] uppercase font-light transition-all duration-300 ${
                    isScrolled
                      ? "bg-[#1a3a5c] text-white hover:bg-[#C9922A]"
                      : "border border-[#C9922A]/60 text-[#C9922A] hover:bg-[#C9922A] hover:text-white"
                  }`}
                  style={{
                    clipPath:
                      "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${isScrolled ? "text-[#1a3a5c]" : "text-white"}`}
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span
                  className={`block h-px transition-all duration-300 ${isScrolled ? "bg-[#1a3a5c]" : "bg-white"} ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`block h-px transition-all duration-300 ${isScrolled ? "bg-[#1a3a5c]" : "bg-white"} ${isMobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block h-px transition-all duration-300 ${isScrolled ? "bg-[#1a3a5c]" : "bg-white"} ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a1628]/97 backdrop-blur-md border-t border-white/10">
            <div className="px-6 py-6 space-y-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block text-xs tracking-[0.25em] uppercase font-light transition-colors ${isActive(link.path) ? "text-[#C9922A]" : "text-white/70 hover:text-white"}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-xs tracking-[0.25em] uppercase font-light text-white/70 hover:text-[#C9922A] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Trips
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-xs tracking-[0.25em] uppercase font-light text-white/70 hover:text-[#C9922A] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                <button className="text-xs tracking-[0.2em] uppercase text-white/50 font-light">
                  EN
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs tracking-[0.15em] uppercase text-red-400 font-light"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-5 py-2 bg-[#C9922A] text-white text-xs tracking-[0.2em] uppercase font-light"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
