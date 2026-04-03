"use client";

import { Dumbbell, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn, getDayTypeBg, getDayTypeIcon, getDayTypeColor } from "@/lib/utils";
import type { ExerciseDay } from "@/types";

interface ExerciseCardProps {
  exercise: ExerciseDay;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isRest =
    exercise.type === "active_recovery" || exercise.type === "rest_fasting";

  return (
    <div className={cn("rounded-2xl border p-4", getDayTypeBg(exercise.type))}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-night-800/60 flex items-center justify-center text-xl flex-shrink-0">
            {getDayTypeIcon(exercise.type)}
          </div>
          <div>
            <p className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
              Latihan Hari Ini
            </p>
            <h3 className={cn("text-base font-display font-bold leading-tight", getDayTypeColor(exercise.type))}>
              {exercise.label}
            </h3>
          </div>
        </div>

        {!isRest && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg bg-night-800/40 flex items-center justify-center flex-shrink-0 active:bg-night-700/60"
          >
            {expanded ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Duration */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-gray-600" />
          <span className="text-xs text-gray-500">{exercise.duration}</span>
        </div>
        {exercise.exercises.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Dumbbell size={13} className="text-gray-600" />
            <span className="text-xs text-gray-500">
              {exercise.exercises.length} gerakan
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {exercise.notes && (
        <p className="mt-2.5 text-xs text-gray-500 leading-relaxed">
          {exercise.notes}
        </p>
      )}

      {/* Expanded exercises */}
      {expanded && exercise.exercises.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-night-700/40 pt-4">
          {exercise.warmup && (
            <div className="text-xs text-gray-600 mb-2">
              🔥 {exercise.warmup}
            </div>
          )}
          {exercise.exercises.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl bg-night-900/60 p-3"
            >
              <p className="text-sm font-medium text-gray-200">{ex.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {ex.sets && (
                  <span className="text-xs text-jade-400">
                    {ex.sets} Set
                  </span>
                )}
                {ex.reps && (
                  <span className="text-xs text-gray-400">× {ex.reps}</span>
                )}
                {ex.rpe && (
                  <span className="text-xs text-yellow-500/80">
                    RPE {ex.rpe}
                  </span>
                )}
                {ex.rir && (
                  <span className="text-xs text-gray-600">RIR {ex.rir}</span>
                )}
                {ex.rest && (
                  <span className="text-xs text-gray-600">Istirahat {ex.rest}</span>
                )}
              </div>
              {ex.notes && (
                <p className="mt-1 text-xs text-gray-600">{ex.notes}</p>
              )}
            </div>
          ))}
          {exercise.cooldown && (
            <div className="text-xs text-gray-600 mt-2">
              🧘 {exercise.cooldown}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
