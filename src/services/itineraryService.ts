import api from "../api/axiosInspector";

export interface ItineraryDestinationInput {
  destinationId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  transportMode?: "car" | "train" | "bus" | "flight";
  specialRequests?: string;
}

export const createItinerary = async (
  name: string,
  firstDest: ItineraryDestinationInput,
) => {
  const res = await api.post("/itineraries", { name, ...firstDest });
  return res.data;
};

export const addToItinerary = async (
  itineraryId: string,
  dest: ItineraryDestinationInput,
) => {
  const res = await api.post("/itineraries/add", { itineraryId, ...dest });
  return res.data;
};

export const removeFromItinerary = async (
  itineraryId: string,
  destIndex: number,
) => {
  const res = await api.delete(`/itineraries/${itineraryId}/dest/${destIndex}`);
  return res.data;
};

export const updateItineraryDestination = async (
  itineraryId: string,
  destIndex: number,
  updates: Partial<ItineraryDestinationInput>,
) => {
  const res = await api.put(
    `/itineraries/${itineraryId}/dest/${destIndex}`,
    updates,
  );
  return res.data;
};

export const getMyItineraries = async () => {
  const res = await api.get("/itineraries");
  return res.data;
};

export const getItineraryById = async (id: string) => {
  const res = await api.get(`/itineraries/${id}`);
  return res.data;
};

export const deleteItinerary = async (id: string) => {
  const res = await api.delete(`/itineraries/${id}`);
  return res.data;
};

export const bookItinerary = async (id: string) => {
  const res = await api.post(`/itineraries/${id}/book`);
  return res.data;
};
export const initiateItineraryPayment = async (itineraryId: string) => {
  const response = await api.post("/payment/initiate-itinerary", {
    itineraryId,
  });
  return response.data;
};
