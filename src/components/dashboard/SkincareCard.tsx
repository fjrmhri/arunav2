"use client";

import { Sparkles, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SkincareDay } from "@/types";

interface SkincareCardProps {
  skincare: SkincareDay;
  isOutdoor?: boolean;
}

export default function SkincareCard({ skincare, isOutdoor }: SkincareCardProps) {
  const [showAm, setShowAm] = useState(false);
  const [showPm, setShowPm] = useState(false);

  const phaseColor = {
    stabilitas: "text-gray-400",
    pencerahan: "text-yellow-400",
    recovery: "text-teal-400",
  }[skincare.phase];

  const phaseBg = {
    stabilitas: "bg-gray-900/60 border-gray-700/50",
    pencerahan: "bg-yellow-950/40 border-yellow-800/50",
    recovery: "bg-teal-950/40 border-teal-800/50",
  }[skincare.phase];

  return (
    <div className={cn("rounded-2xl border p-4", phaseBg)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-night-800/60 flex items-center justify-center">
          <Sparkles size={18} className={phaseColor} />
        </div>
        <div>
          <p className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
            Skincare — {skincare.dayName}
          </p>
          <h3 className={cn("text-sm font-display font-bold", phaseColor)}>
            {skincare.isRecoveryDay
              ? "🌿 Hari Pemulihan"
              : `Fase ${skincare.phase.charAt(0).toUpperCase() + skincare.phase.slice(1)}`}
          </h3>
        </div>
      </div>

      {/* Sunscreen reapply alert */}
      {isOutdoor && (
        <div className="mb-3 rounded-xl bg-orange-950/50 border border-orange-800/50 p-3">
          <p className="text-xs font-display font-semibold text-orange-300">
            ☀️ Mode Luar Ruangan — Re-apply Sunscreen!
          </p>
          <p className="text-xs text-orange-400/70 mt-0.5">
            Wajib re-aplikasi Azarine SPF45 setiap 2 jam
          </p>
        </div>
      )}

      {/* AM Routine */}
      <div className="mb-2">
        <button
          onClick={() => setShowAm(!showAm)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-night-800/40 hover:bg-night-800/70 active:bg-night-700/60 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-yellow-500" />
            <span className="text-xs font-semibold text-gray-300">
              Pagi — {skincare.amLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {skincare.amRoutine.length} langkah
            </span>
            {showAm ? (
              <ChevronUp size={14} className="text-gray-600" />
            ) : (
              <ChevronDown size={14} className="text-gray-600" />
            )}
          </div>
        </button>

        {showAm && (
          <div className="mt-2 space-y-1.5 pl-2">
            {skincare.amRoutine.map((step) => (
              <div
                key={step.order}
                className="flex items-start gap-2 rounded-lg bg-night-900/60 p-2.5"
              >
                <span className="text-xs font-display font-bold text-jade-600 w-4 flex-shrink-0 mt-0.5">
                  {step.order}.
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-300">{step.productShort}</p>
                  {step.notes && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.notes}</p>
                  )}
                  {step.warningNote && (
                    <p className="text-xs text-yellow-500/70 mt-0.5">{step.warningNote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PM Routine */}
      <div>
        <button
          onClick={() => setShowPm(!showPm)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-night-800/40 hover:bg-night-800/70 active:bg-night-700/60 transition-all"
        >
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-gray-300">
              Malam — {skincare.pmLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {skincare.pmRoutine.length} langkah
            </span>
            {showPm ? (
              <ChevronUp size={14} className="text-gray-600" />
            ) : (
              <ChevronDown size={14} className="text-gray-600" />
            )}
          </div>
        </button>

        {showPm && (
          <div className="mt-2 space-y-1.5 pl-2">
            {skincare.pmRoutine.map((step) => (
              <div
                key={step.order}
                className="flex items-start gap-2 rounded-lg bg-night-900/60 p-2.5"
              >
                <span className="text-xs font-display font-bold text-blue-600 w-4 flex-shrink-0 mt-0.5">
                  {step.order}.
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-300">{step.productShort}</p>
                  {step.notes && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.notes}</p>
                  )}
                  {step.warningNote && (
                    <p className="text-xs text-yellow-500/70 mt-0.5">{step.warningNote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warnings */}
      {skincare.warnings.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {skincare.warnings.map((w, i) => (
            <div
              key={i}
              className="rounded-lg bg-yellow-950/40 border border-yellow-800/30 p-2.5"
            >
              <p className="text-xs text-yellow-400/80 leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
