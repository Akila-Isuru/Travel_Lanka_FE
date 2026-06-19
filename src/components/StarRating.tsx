import React from "react";

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<Props> = ({
  rating,
  size = 4,
  interactive = false,
  onChange,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} focus:outline-none`}
        >
          <svg
            className={`w-${size} h-${size} ${star <= rating ? "text-[#C9922A]" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="none"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
