"use client";

import { Sparkles, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SkincareDay } from "@/types";

interface SkincareCardProps {
  skincare: SkincareDay;
  isOutdoor?: boolean;
}

export default function SkincareCard({ skincare, isOutdoor }: SkincareCardProps) {
  const [showAm, setShowAm] = useState(false);
  const [showPm, setShowPm] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: "var(--text-secondary)" }} />
        <p className="section-label">Skincare — {skincare.dayName}</p>
      </div>

      <p className="text-sm font-display font-medium mb-3" style={{ color: "var(--text-primary)" }}>
        {skincare.isRecoveryDay ? "Hari Pemulihan" : `Fase ${skincare.phase.charAt(0).toUpperCase() + skincare.phase.slice(1)}`}
      </p>

      {isOutdoor && (
        <div className="mb-3 rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--warning)" }}>
            Mode Outdoor — re-apply Azarine SPF45 setiap 2 jam.
          </p>
        </div>
      )}

      {/* AM */}
      <div className="mb-2">
        <button
          onClick={() => setShowAm(!showAm)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div className="flex items-center gap-2">
            <Sun size={13} style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Pagi — {skincare.amLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {skincare.amRoutine.length} langkah
            </span>
            {showAm
              ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
              : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
          </div>
        </button>
        {showAm && (
          <div className="mt-1.5 space-y-1 pl-1">
            {skincare.amRoutine.map((step, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className="text-[10px] w-4 flex-shrink-0 mt-0.5 font-bold"
                      style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{step.product}</p>
                  {step.notes && (
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{step.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PM */}
      <div>
        <button
          onClick={() => setShowPm(!showPm)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div className="flex items-center gap-2">
            <Moon size={13} style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Malam — {skincare.pmLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {skincare.pmRoutine.length} langkah
            </span>
            {showPm
              ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
              : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
          </div>
        </button>
        {showPm && (
          <div className="mt-1.5 space-y-1 pl-1">
            {skincare.pmRoutine.map((step, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className="text-[10px] w-4 flex-shrink-0 mt-0.5 font-bold"
                      style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{step.product}</p>
                  {step.notes && (
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{step.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
