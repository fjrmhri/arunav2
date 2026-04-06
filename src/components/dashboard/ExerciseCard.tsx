"use client";

import { Dumbbell, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ExerciseDay } from "@/types";

interface ExerciseCardProps {
  exercise: ExerciseDay;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isRest = exercise.type === "active_recovery" || exercise.type === "rest_fasting";

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Latihan Hari Ini</p>
          <h3 className="text-base font-display font-bold" style={{ color: "var(--text-primary)" }}>
            {exercise.label}
          </h3>
        </div>
        {!isRest && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-elevated)" }}
          >
            {expanded
              ? <ChevronUp size={15} style={{ color: "var(--text-muted)" }} />
              : <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2.5">
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{exercise.duration}</span>
        </div>
        {exercise.exercises.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Dumbbell size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {exercise.exercises.length} gerakan
            </span>
          </div>
        )}
      </div>

      {exercise.notes && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {exercise.notes}
        </p>
      )}

      {expanded && exercise.exercises.length > 0 && (
        <div className="mt-4 space-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {exercise.warmup && (
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Warmup: {exercise.warmup}
            </p>
          )}
          {exercise.exercises.map((ex, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ex.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {ex.sets && (
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {ex.sets} set
                  </span>
                )}
                {ex.reps && (
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>× {ex.reps}</span>
                )}
                {ex.rpe && (
                  <span className="text-xs" style={{ color: "var(--warning)" }}>RPE {ex.rpe}</span>
                )}
                {ex.rir && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>RIR {ex.rir}</span>
                )}
                {ex.rest && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Rest {ex.rest}</span>
                )}
              </div>
              {ex.notes && (
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{ex.notes}</p>
              )}
            </div>
          ))}
          {exercise.cooldown && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Cooldown: {exercise.cooldown}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
