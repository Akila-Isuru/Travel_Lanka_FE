import React, { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthCallback from "../pages/OAuthCallback";
import Destinations from "../pages/Destinations";
import DestinationDetail from "../pages/DestinationDetail";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ItineraryBuilder from "../pages/ItineraryBuilder";
import MyItineraries from "../pages/MyItineraries";
import StayDetail from "../pages/StayDetail";
import WeatherWidget from "../pages/WeatherWidget";
import BookingDetail from "../pages/BookingDetail";
import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";

const PaymentReturn = () => (
  <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
    <div className="text-center px-6">
      <div className="w-16 h-16 mx-auto mb-6 border border-emerald-400/30 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <p
        className="text-[#1a3a5c] font-light mb-2"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "2rem",
          fontStyle: "italic",
        }}
      >
        Payment Successful
      </p>
      <p className="text-gray-400 text-sm font-light mb-6">
        Your booking has been confirmed. You will receive a confirmation email
        shortly.
      </p>
      <a
        href="/dashboard"
        className="inline-block px-8 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
        }}
      >
        View My Bookings
      </a>
    </div>
  </div>
);

const PaymentCancel = () => (
  <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');`}</style>
    <div className="text-center px-6">
      <div className="w-16 h-16 mx-auto mb-6 border border-amber-400/30 flex items-center justify-center">
        <svg
          className="w-7 h-7 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
      <p
        className="text-[#1a3a5c] font-light mb-2"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "2rem",
          fontStyle: "italic",
        }}
      >
        Payment Cancelled
      </p>
      <p className="text-gray-400 text-sm font-light mb-6">
        Your payment was not completed. Your booking is saved as pending.
      </p>
      <div className="flex gap-3 justify-center">
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 border border-[#1a3a5c]/20 text-[#1a3a5c] text-[11px] tracking-[0.2em] uppercase font-light hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
        >
          My Bookings
        </a>
        <a
          href="/destinations"
          className="inline-block px-6 py-3 bg-[#C9922A] text-white text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#b07d20] transition-colors"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          Explore More
        </a>
      </div>
    </div>
  </div>
);

const RequireAuth = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border border-[#C9922A]/20 rotate-45" />
            <div
              className="absolute inset-1 border border-[#C9922A]/40 rotate-12 animate-spin"
              style={{ animationDuration: "2s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#C9922A]" />
            </div>
          </div>
          <p className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.some((role) => user?.roles?.includes(role))) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="text-center px-6">
          <p
            className="text-[#1a3a5c] font-light"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "2rem",
              fontStyle: "italic",
            }}
          >
            Access Denied
          </p>
          <p className="text-gray-400 text-sm font-light mt-2">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/destinations"
          element={
            <RequireAuth>
              <Destinations />
            </RequireAuth>
          }
        />
        <Route
          path="/destination/:slug"
          element={
            <RequireAuth>
              <DestinationDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/stay/:slug"
          element={
            <RequireAuth>
              <StayDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <RequireAuth>
              <BookingDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/my-itineraries"
          element={
            <RequireAuth>
              <MyItineraries />
            </RequireAuth>
          }
        />
        <Route
          path="/itinerary/:id"
          element={
            <RequireAuth>
              <ItineraryBuilder />
            </RequireAuth>
          }
        />
        <Route
          path="/itinerary-builder/:id"
          element={
            <RequireAuth>
              <ItineraryBuilder />
            </RequireAuth>
          }
        />
        <Route
          path="/weather"
          element={
            <RequireAuth>
              <WeatherWidget />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth roles={["ADMIN"]}>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/events"
          element={
            <RequireAuth>
              <Events />
            </RequireAuth>
          }
        />
        <Route
          path="/event/:slug"
          element={
            <RequireAuth>
              <EventDetail />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
