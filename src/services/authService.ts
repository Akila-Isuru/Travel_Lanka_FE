import api from "../api/axiosInspector";

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const getMyDetails = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("ACCESS_TOKEN");
  localStorage.removeItem("REFRESH");
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const validateResetToken = async (token: string) => {
  const res = await api.get(`/auth/validate-token/${token}`);
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
};
