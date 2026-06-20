import React, { useState } from "react";
import StarRating from "./StarRating";
import api from "../api/axiosInspector";

interface Props {
  targetId: string;
  targetType: "destination" | "event" | "stay";
  onReviewAdded: () => void;
}

const ReviewForm: React.FC<Props> = ({
  targetId,
  targetType,
  onReviewAdded,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/reviews", { targetId, targetType, rating, comment });
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white border border-gray-100 p-6"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-6 h-px bg-[#C9922A]" />
        <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
          Write a Review
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
            Your Rating
          </label>
          <StarRating
            rating={rating}
            size={6}
            interactive={true}
            onChange={setRating}
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-400 font-light mb-2">
            Your Comment
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full px-4 py-2.5 border border-gray-200 bg-[#faf8f4] text-[#1a3a5c] text-sm font-light focus:outline-none focus:border-[#C9922A] transition-colors resize-none"
            style={{ borderRadius: 0 }}
          />
        </div>
        {error && <p className="text-red-400 text-xs font-light">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#C9922A] text-white text-[11px] tracking-[0.2em] uppercase font-light hover:bg-[#b07d20] transition-colors disabled:opacity-50"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
