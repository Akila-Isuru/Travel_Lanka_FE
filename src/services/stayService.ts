import api from "../api/axiosInspector";

export interface Stay {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  location: string;
  destinationId: { _id: string; name: string };
  pricePerNight: number;
  address: string;
  contactPhone: string;
  amenities: string[];
}

export const getAllStays = async () => {
  const res = await api.get("/stays/admin/all");
  return res.data;
};


export const createStay = async (formData: FormData) => {
  const res = await api.post("/stays", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


export const updateStay = async (id: string, formData: FormData) => {
  const res = await api.put(`/stays/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


export const deleteStay = async (id: string) => {
  const res = await api.delete(`/stays/${id}`);
  return res.data;
};


export const getStaysByDestination = async (destinationId: string) => {
  const res = await api.get(`/stays/destination/${destinationId}`);
  return res.data;
};
