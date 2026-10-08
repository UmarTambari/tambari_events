"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="mt-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Go Back</span>
    </button>
  );
}
