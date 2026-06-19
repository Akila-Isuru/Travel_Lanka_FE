import api from "../api/axiosInspector";

export const initiatePayment = async (bookingId: string) => {
  const response = await api.post("/payment/initiate", { bookingId });
  return response.data;
};
