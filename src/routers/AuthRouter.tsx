import React, { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuthCallback from "../pages/OAuthCallback";

type GuardProps = { children: ReactNode; roles?: string[] };

// Router Guard
const RequireAuth = ({ children, roles }: GuardProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.some((role) => user?.roles?.includes(role))) {
    return <div className="text-center mt-20 font-bold">Access Denied!</div>;
  }

  return <>{children}</>;
};

const AuthRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* {Home page} */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="p-10 text-center text-2xl font-bold text-green-600">
                Welcome!
              </div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AuthRouter;
