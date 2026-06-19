// frontend/src/services/agentService.ts
import api from "../api/axiosInspector";
import type { Agent, AgentBooking, AgentBookingInput } from "../types";

export interface GetAgentsParams {
  startDate?: string;
  endDate?: string;
}

export const getAgentsByDestination = async (
  destinationId: string,
  params?: GetAgentsParams,
) => {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  const url = query.toString()
    ? `/agents/destination/${destinationId}?${query.toString()}`
    : `/agents/destination/${destinationId}`;

  const res = await api.get(url);
  return res.data;
};

export const getAgentBySlug = async (slug: string) => {
  const res = await api.get(`/agents/slug/${slug}`);
  return res.data;
};

export const getRecommendedAgent = async (
  destinationId: string,
  startDate: string,
  endDate: string,
) => {
  const res = await api.get(
    `/agents/recommended/${destinationId}?startDate=${startDate}&endDate=${endDate}`,
  );
  return res.data;
};

export const bookAgent = async (data: AgentBookingInput) => {
  const res = await api.post("/agents/book", data);
  return res.data;
};

export const getMyAgentBookings = async () => {
  const res = await api.get("/agents/my-bookings");
  return res.data;
};

export const cancelAgentBooking = async (id: string) => {
  const res = await api.put(`/agents/my-bookings/${id}/cancel`);
  return res.data;
};

// Admin only
export const getAllAgentsAdmin = async () => {
  const res = await api.get("/agents/admin/all");
  return res.data;
};

export const createAgent = async (formData: FormData) => {
  const res = await api.post("/agents/admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateAgent = async (id: string, formData: FormData) => {
  const res = await api.put(`/agents/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAgent = async (id: string) => {
  const res = await api.delete(`/agents/admin/${id}`);
  return res.data;
};

export const getAllAgentBookingsAdmin = async () => {
  const res = await api.get("/agents/admin/bookings");
  return res.data;
};

export const updateAgentBookingStatusAdmin = async (
  id: string,
  status: string,
) => {
  const res = await api.put(`/agents/admin/bookings/${id}/status`, { status });
  return res.data;
};
