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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-earth-900/60 flex items-center justify-center">
            <Utensils size={14} className="text-earth-400" />
          </div>
          <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
            Nutrisi Hari Ini
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 rounded-lg bg-night-800/40 flex items-center justify-center"
        >
          {expanded ? (
            <ChevronUp size={14} className="text-gray-600" />
          ) : (
            <ChevronDown size={14} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Macro targets */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl bg-night-800/60 p-2.5 text-center">
          <p className="text-sm font-display font-bold text-gray-200">
            {NUTRITION_TARGET.targetKcal}
          </p>
          <p className="text-[10px] text-gray-600">kcal target</p>
        </div>
        <div className="rounded-xl bg-night-800/60 p-2.5 text-center">
          <p className="text-sm font-display font-bold text-jade-400">
            {NUTRITION_TARGET.proteinGram}g
          </p>
          <p className="text-[10px] text-gray-600">protein</p>
        </div>
        <div className="rounded-xl bg-night-800/60 p-2.5 text-center">
          <p className="text-sm font-display font-bold text-yellow-400">
            {NUTRITION_TARGET.carbsGram}g
          </p>
          <p className="text-[10px] text-gray-600">karbo</p>
        </div>
      </div>

      {/* ASSUMPTION note */}
      <div className="mb-3 rounded-lg bg-blue-950/40 border border-blue-900/40 p-2">
        <p className="text-[10px] text-blue-400/70">
          ASSUMPTION: Kalkulasi berdasarkan usia 30 thn (UNKNOWN), formula Mifflin-St Jeor, PAL 1.55, defisit 20%
        </p>
      </div>

      {/* Meals list */}
      {expanded && (
        <div className="space-y-2 border-t border-night-700/40 pt-3">
          {mealPlan.meals.map((meal, i) => (
            <div key={i} className="rounded-xl bg-night-800/40 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-xs font-display font-bold text-gray-300">
                    {meal.label}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">{meal.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-earth-400">{meal.kcal} kkal</span>
                  <span className="text-xs text-jade-500">{meal.protein}g pro</span>
                </div>
              </div>
              <ul className="space-y-0.5">
                {meal.items.map((item, j) => (
                  <li key={j} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-gray-700 mt-0.5 flex-shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {meal.notes && (
                <p className="mt-1.5 text-xs text-gray-600 italic leading-relaxed">
                  {meal.notes}
                </p>
              )}
            </div>
          ))}

          {mealPlan.notes && (
            <div className="rounded-lg bg-night-800/30 p-2.5">
              <p className="text-xs text-gray-600">{mealPlan.notes}</p>
            </div>
          )}
        </div>
      )}

      {fastingContext?.isStrictFastDay && (
        <div className="mt-2 rounded-lg bg-indigo-950/50 border border-indigo-800/50 p-2.5">
          <p className="text-xs text-indigo-400">
            ⏳ Puasa aktif penuh hari ini. Tidak ada makan utama sampai refeeding besok pagi.
          </p>
        </div>
      )}

      {fastingContext?.isRefeedDay && (
        <div className="mt-2 rounded-lg bg-jade-950/40 border border-jade-800/50 p-2.5">
          <p className="text-xs text-jade-300">
            ✅ Refeeding day. Mulai dengan pembuka ringan pukul 08:00, lanjutkan tahap 2 sekitar 09:00, lalu baru kembali ke pola makan normal.
          </p>
        </div>
      )}

      {fastingContext?.isFastStartDay && !fastingContext.isStrictFastDay && (
        <div className="mt-2 rounded-lg bg-indigo-950/50 border border-indigo-800/50 p-2.5">
          <p className="text-xs text-indigo-400">
            🌙 Puasa 36 jam dimulai pukul 20:00 malam ini. Pastikan makan terakhir selesai sebelum waktu mulai dan prioritaskan hidrasi.
          </p>
        </div>
      )}
    </div>
  );
}
