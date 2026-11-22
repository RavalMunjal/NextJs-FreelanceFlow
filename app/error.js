"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-xl border border-cream-border card-shadow max-w-lg mx-auto mt-12">
      <div className="w-14 h-14 rounded-full bg-terracotta-light flex items-center justify-center text-terracotta mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-textColor-primary mb-2">
        Something Went Wrong
      </h2>

      <p className="text-sm text-textColor-secondary mb-6 leading-relaxed">
        {error?.message || "An unexpected error occurred while loading this page. Please try again."}
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
