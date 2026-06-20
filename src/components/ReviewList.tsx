import React from "react";
import StarRating from "./StarRating";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosInspector";

interface Review {
  _id: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  reviews: Review[];
  onReviewDeleted: () => void;
}

const ReviewList: React.FC<Props> = ({ reviews, onReviewDeleted }) => {
  const { user } = useAuth();

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      onReviewDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm font-light italic">
          No reviews yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white border border-gray-100 p-5"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-[#1a3a5c] text-sm font-light"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: "italic",
                  }}
                >
                  {review.user?.name || "Unknown User"}
                </span>
                <StarRating rating={review.rating} size={4} />
              </div>
              <p className="text-gray-500 text-xs font-light mt-1">
                {review.comment}
              </p>
              <p className="text-gray-300 text-[10px] mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            {(user?._id === review.user?._id ||
              user?.roles?.includes("ADMIN")) && (
              <button
                onClick={() => handleDelete(review._id)}
                className="text-red-300 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
