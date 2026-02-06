"use client";

import { useEffect, useState } from "react";
import { Progress } from "./progress";

interface LoadingBarProps {
  loading: boolean;
}

export const LoadingBar = ({ loading }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          if (prev === 0) return 10;
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(timer);
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      const completeTimer = setTimeout(() => {
        setProgress((prev) => {
          if (prev > 0 && prev < 100) return 100;
          return prev;
        });
      }, 0);

      const resetTimer = setTimeout(() => {
        setProgress(0);
      }, 300);

      return () => {
        clearTimeout(completeTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Glassmorphism overlay */}
      <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm" />

      {/* Loading bar */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 md:w-96">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="text-center mb-4">
            <p className="text-white font-semibold text-lg">Loading...</p>
          </div>
          <Progress
            value={progress}
            className="h-3 rounded-full bg-white/30"
            extraStyles="transition-transform duration-200 ease-out bg-blue-500"
          />
        </div>
      </div>
    </>
  );
};
