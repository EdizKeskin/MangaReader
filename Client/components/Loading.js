import React from "react";
import "@/styles/loader.css";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full">
      <div className="loading-container">
        {/* Outer rotating ring */}
        <div className="loading-ring-outer">
          <div className="loading-ring-inner"></div>
        </div>     
      </div>
    </div>
  );
}
