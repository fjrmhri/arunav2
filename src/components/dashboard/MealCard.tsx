"use client";

import { Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { MealPlan } from "@/types";
import { NUTRITION_TARGET } from "@/data/fitness-seed";
import type { FastingContext } from "@/lib/fasting";

interface MealCardProps {
  mealPlan: MealPlan;
  fastingContext?: FastingContext | null;
}

export default function MealCard({ mealPlan, fastingContext }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">Nutrisi Hari Ini</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--bg-elevated)" }}
        >
          {expanded
            ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
            : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
        </button>
      </div>

      {/* Macro targets */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "kcal", value: String(NUTRITION_TARGET.targetKcal) },
          { label: "protein", value: `${NUTRITION_TARGET.proteinGram}g` },
          { label: "karbo", value: `${NUTRITION_TARGET.carbsGram}g` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: "var(--bg-elevated)" }}>
            <p className="text-sm font-display font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Assumption note */}
      <div className="mb-3 rounded-lg p-2" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          ASSUMPTION: Mifflin-St Jeor, PAL 1.55, defisit 20% — verifikasi sesuai kebutuhan aktual.
        </p>
      </div>

      {/* Fasting state notices */}
      {fastingContext?.isStrictFastDay && (
        <div className="rounded-lg p-2.5 mb-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Puasa aktif — tidak ada makan sampai refeeding.
          </p>
        </div>
      )}
      {fastingContext?.isRefeedDay && (
        <div className="rounded-lg p-2.5 mb-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--success)" }}>
            Refeeding day — mulai ringan pukul 08:00, kembali normal bertahap.
          </p>
        </div>
      )}
      {fastingContext?.isFastStartDay && !fastingContext.isStrictFastDay && (
        <div className="rounded-lg p-2.5 mb-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Puasa 36j dimulai pukul 20:00 — selesaikan makan terakhir sebelum itu.
          </p>
        </div>
      )}

      {/* Meals list */}
      {expanded && (
        <div className="space-y-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          {mealPlan.meals.map((meal, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-xs font-display font-bold" style={{ color: "var(--text-primary)" }}>
                    {meal.label}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>{meal.time}</span>
                </div>
                <div className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span>{meal.kcal} kkal</span>
                  <span>{meal.protein}g pro</span>
                </div>
              </div>
              <ul className="space-y-0.5">
                {meal.items.map((item, j) => (
                  <li key={j} className="text-xs flex items-start gap-1.5" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--text-muted)" }} className="mt-0.5 flex-shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {meal.notes && (
                <p className="mt-1.5 text-xs italic leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {meal.notes}
                </p>
              )}
            </div>
          ))}
          {mealPlan.notes && (
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{mealPlan.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
