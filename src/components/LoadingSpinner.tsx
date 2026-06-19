import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border border-[#C9922A]/20 rotate-45" />
        <div className="absolute inset-1 border border-[#C9922A]/40 rotate-12 animate-spin" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#C9922A]" />
        </div>
      </div>
      <p className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;