// import { type ReactNode } from "react";
// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { useAuth } from "../src/hooks/useAuth";
// import Login from "../src/pages/Login";
// import Register from "../src/pages/Register";

// type GuardProps = { children: ReactNode; roles?: string[] };

// const RequireAuth = ({ children, roles }: GuardProps) => {
//   const { user, loading } = useAuth();

//   if (loading) return <div className="text-center mt-20">Loading...</div>;
//   if (!user) return <Navigate to="/login" replace />;

//   if (roles && !roles.some((role) => user?.roles?.includes(role))) {
//     return <div className="text-center mt-20 font-bold">Access Denied!</div>;
//   }

//   return <>{children}</>;
// };
