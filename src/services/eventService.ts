import api from "../api/axiosInspector";
import type { Event, EventBooking, EventCategory } from "../types";

interface GetEventsParams {
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export const getAllEvents = async (params?: GetEventsParams) => {
  const query = new URLSearchParams();
  if (params?.category) query.append("category", params.category);
  if (params?.location) query.append("location", params.location);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.featured) query.append("featured", "true");

  const url = query.toString() ? `/events?${query.toString()}` : "/events";
  const res = await api.get(url);
  return res.data;
};

export const getEventBySlug = async (slug: string) => {
  const res = await api.get(`/events/slug/${slug}`);
  return res.data;
};

export const getEventsByDestination = async (
  destinationId: string,
  startDate?: string,
  endDate?: string,
) => {
  let url = `/events/destination/${destinationId}`;
  const query = new URLSearchParams();
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);
  if (query.toString()) url += `?${query.toString()}`;

  const res = await api.get(url);
  return res.data;
};

export const getEventCategories = async () => {
  const res = await api.get("/events/categories");
  return res.data;
};

export const bookEvent = async (data: {
  eventId: string;
  tickets: number;
  specialRequests?: string;
}) => {
  const res = await api.post("/events/book", data);
  return res.data;
};

export const getMyEventBookings = async () => {
  const res = await api.get("/events/my-bookings");
  return res.data;
};

export const cancelEventBooking = async (id: string) => {
  const res = await api.put(`/events/my-bookings/${id}/cancel`);
  return res.data;
};

// ===== NEW: Event payment functions =====
export const initiateEventPayment = async (bookingId: string) => {
  const res = await api.post("/events/payment/initiate", { bookingId });
  return res.data;
};

// Admin APIs
export const getAllEventsAdmin = async () => {
  const res = await api.get("/events/admin/all");
  return res.data;
};

export const createEvent = async (formData: FormData) => {
  const res = await api.post("/events/admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateEvent = async (id: string, formData: FormData) => {
  const res = await api.put(`/events/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteEvent = async (id: string) => {
  const res = await api.delete(`/events/admin/${id}`);
  return res.data;
};

export const getAllEventBookingsAdmin = async () => {
  const res = await api.get("/events/admin/bookings");
  return res.data;
};

export const updateEventBookingStatusAdmin = async (
  id: string,
  status: string,
) => {
  const res = await api.put(`/events/admin/bookings/${id}/status`, { status });
  return res.data;
};
