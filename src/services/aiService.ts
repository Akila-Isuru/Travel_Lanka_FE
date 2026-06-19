import api from "../api/axiosInspector";

export interface PlanTripInput {
  duration: string;
  interests: string[];
  budget: number;
  startLocation: string;
}

export interface PlanTripResponse {
  success: boolean;
  itineraryName: string;
  days: Array<{
    dayNumber: number;
    destinationName: string;
    description: string;
  }>;
}

export const planTripWithAI = async (
  input: PlanTripInput,
): Promise<PlanTripResponse> => {
  const res = await api.post("/ai/plan-trip", input);
  return res.data;
};
