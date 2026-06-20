import api from "../api/axiosInspector";

export const getReviewsForTarget = async (
  targetId: string,
  targetType: string,
) => {
  const res = await api.get(`/reviews/${targetType}/${targetId}`);
  return res.data;
};

export const getAverageRating = async (
  targetId: string,
  targetType: string,
) => {
  const res = await api.get(`/reviews/${targetType}/${targetId}/rating`);
  return res.data;
};

export const createReview = async (data: {
  targetId: string;
  targetType: string;
  rating: number;
  comment: string;
}) => {
  const res = await api.post("/reviews", data);
  return res.data;
};

export const deleteReview = async (reviewId: string) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};
