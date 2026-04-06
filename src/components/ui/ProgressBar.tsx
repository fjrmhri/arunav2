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
  height = "normal",
  showPercent = true,
  className,
}: ProgressBarProps) {
  const h = { thin: "h-1", normal: "h-1.5", thick: "h-2" }[height];

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <div className="flex items-center gap-2">
              <span className="section-label">{label}</span>
              {sublabel && (
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{sublabel}</span>
              )}
            </div>
          )}
          {showPercent && (
            <span className="text-sm font-bold font-display" style={{ color: "var(--text-primary)" }}>
              {percent}%
            </span>
          )}
        </div>
      )}
      <div className={cn("rounded-full overflow-hidden", h)} style={{ background: "var(--border)" }}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out")}
          style={{ width: `${Math.min(percent, 100)}%`, background: "var(--text-primary)" }}
        />
      </div>
    </div>
  );
}
