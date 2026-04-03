"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percent: number;
  label?: string;
  sublabel?: string;
  colorClass?: string;
  height?: "thin" | "normal" | "thick";
  showPercent?: boolean;
  className?: string;
}

export default function ProgressBar({
  percent,
  label,
  sublabel,
  colorClass = "from-jade-500 to-emerald-500",
  height = "normal",
  showPercent = true,
  className,
}: ProgressBarProps) {
  const heightClass = {
    thin: "h-1",
    normal: "h-1.5",
    thick: "h-2.5",
  }[height];

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <div>
              <span className="text-xs font-semibold font-display text-gray-400 uppercase tracking-wide">
                {label}
              </span>
              {sublabel && (
                <span className="ml-2 text-xs text-gray-600">{sublabel}</span>
              )}
            </div>
          )}
          {showPercent && (
            <span className="text-sm font-bold font-display text-jade-400">
              {percent}%
            </span>
          )}
        </div>
      )}
      <div className={cn("rounded-full bg-night-700/60 overflow-hidden", heightClass)}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            colorClass
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
