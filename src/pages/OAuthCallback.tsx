import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyDetails } from "../services/authService";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {

    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");

    if (token && refresh) {
     
      localStorage.setItem("ACCESS_TOKEN", token);
      localStorage.setItem("REFRESH", refresh);

      
      getMyDetails()
        .then((userRes) => {
          setUser(userRes.data); 
          navigate("/");
        })
        .catch(() => {
          alert("Google Authentication Failed!");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [searchParams, setUser, navigate]);

  return (
    <div className="text-center mt-20 font-bold text-lg text-blue-600">
      Connecting with google Account, Pleade wait...!
    </div>
  );
};

export default OAuthCallback;
