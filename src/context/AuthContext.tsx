import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMyDetails } from "../services/authService";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      getMyDetails()
        .then((res) => {
          if (res?.data) setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("ACCESS_TOKEN");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
