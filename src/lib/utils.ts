// ============================================================
// UTILITIES — arunav2
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DayIndex, DayType, FastingPhase, UserPreferences } from "@/types";
import { SKINCARE_SCHEDULE } from "@/data/skincare-seed";
import { getLocalDateKey, parseLocalDateKey } from "@/lib/date";
import {
  getExercisePlanForDate,
  getFastingContext,
  getMealPlanForDate,
  getSupplementScheduleForDate,
} from "@/lib/fasting";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Tanggal ----
export function todayKey(): string {
  return getLocalDateKey();
}

export function formatDate(dateStr: string): string {
  const d = parseLocalDateKey(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  const d = parseLocalDateKey(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr: string): number {
  // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const d = parseLocalDateKey(dateStr);
  return d.getDay();
}

// ---- Mapping hari kalender ke DayIndex siklus (Senin=1, ..., Minggu=7) ----
export function calendarDayToCycleDay(
  dateStr: string,
  startDate: string
): DayIndex {
  const start = parseLocalDateKey(startDate);
  const current = parseLocalDateKey(dateStr);
  const diffDays = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleIndex = ((diffDays % 7) + 7) % 7;
  return (cycleIndex + 1) as DayIndex;
}

// ---- Nama hari dalam Bahasa Indonesia ----
export const HARI_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export function getNamaHari(dateStr: string): string {
  const d = parseLocalDateKey(dateStr);
  return HARI_ID[d.getDay()];
}

// ---- Warna berdasarkan tipe hari ----
export function getDayTypeColor(type: DayType): string {
  switch (type) {
    case "workout_lower":
      return "text-jade-400";
    case "workout_push":
      return "text-emerald-400";
    case "workout_hiit":
      return "text-yellow-400";
    case "workout_pull":
      return "text-teal-400";
    case "workout_fullbody":
      return "text-cyan-400";
    case "active_recovery":
      return "text-recovery";
    case "rest_fasting":
      return "text-fasting";
    case "fasting_active":
      return "text-purple-400";
    default:
      return "text-gray-400";
  }
}

export function getDayTypeBg(type: DayType): string {
  switch (type) {
    case "workout_lower":
      return "bg-jade-900/40 border-jade-700/50";
    case "workout_push":
      return "bg-emerald-900/40 border-emerald-700/50";
    case "workout_hiit":
      return "bg-yellow-900/30 border-yellow-700/50";
    case "workout_pull":
      return "bg-teal-900/40 border-teal-700/50";
    case "workout_fullbody":
      return "bg-cyan-900/40 border-cyan-700/50";
    case "active_recovery":
      return "bg-gray-800/60 border-gray-600/50";
    case "rest_fasting":
      return "bg-indigo-900/40 border-indigo-700/50";
    case "fasting_active":
      return "bg-purple-900/40 border-purple-700/50";
    default:
      return "bg-night-800/60 border-night-600/50";
  }
}

export function getDayTypeIcon(type: DayType): string {
  switch (type) {
    case "workout_lower":
      return "🦵";
    case "workout_push":
      return "💪";
    case "workout_hiit":
      return "⚡";
    case "workout_pull":
      return "🏋️";
    case "workout_fullbody":
      return "🔥";
    case "active_recovery":
      return "🌿";
    case "rest_fasting":
      return "🌙";
    case "fasting_active":
      return "⏳";
    default:
      return "📅";
  }
}

export function getDayTypeLabel(type: DayType): string {
  switch (type) {
    case "workout_lower":
      return "Lower Body";
    case "workout_push":
      return "Push Day";
    case "workout_hiit":
      return "HIIT Kardio";
    case "workout_pull":
      return "Pull Day";
    case "workout_fullbody":
      return "Full Body";
    case "active_recovery":
      return "Pemulihan Aktif";
    case "rest_fasting":
      return "Istirahat + Puasa";
    case "fasting_active":
      return "Puasa Aktif";
    default:
      return "Istirahat";
  }
}

// ---- Fasting status ----
export function getFastingStatus(now: Date): {
  isActive: boolean;
  phase: FastingPhase | null;
  hourElapsed: number;
  percentComplete: number;
} {
  const context = getFastingContext(getLocalDateKey(now), null, now);

  if (!context.isActiveFastingWindow) {
    return { isActive: false, phase: null, hourElapsed: 0, percentComplete: 0 };
  }

  return {
    isActive: true,
    phase: context.phase,
    hourElapsed: context.hourElapsed,
    percentComplete: context.percentComplete,
  };
}

// ---- Generate Task IDs ----
export function generateTasks(
  dayIndex: DayIndex,
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
) {
  const tasks: Array<{
    id: string;
    category: string;
    label: string;
    detail?: string;
  }> = [];
  const exercise = getExercisePlanForDate(dayIndex, dateKey, prefs);
  const mealPlan = getMealPlanForDate(dayIndex, dateKey, prefs);
  const supplementSchedule = getSupplementScheduleForDate(dayIndex, dateKey, prefs);
  const fastingContext = getFastingContext(dateKey, prefs);

  // Exercise tasks
  if (exercise.exercises.length > 0) {
    tasks.push({
      id: `${dateKey}_ex_main`,
      category: "exercise",
      label: exercise.label,
      detail: `${exercise.exercises.length} gerakan · ${exercise.duration}`,
    });
    exercise.exercises.forEach((ex, i) => {
      tasks.push({
        id: `${dateKey}_ex_${i}`,
        category: "exercise",
        label: ex.name,
        detail: ex.sets
          ? `${ex.sets} Set × ${ex.reps}${ex.rpe ? ` · RPE ${ex.rpe}` : ""}`
          : ex.reps || "",
      });
    });
  }

  // Nutrition tasks
  mealPlan.meals.forEach((meal, index) => {
    tasks.push({
      id: `${dateKey}_meal_${index}`,
      category: "nutrition",
      label: `${meal.label} (${meal.time})`,
      detail: meal.items.join(" + "),
    });
  });

  // Supplement tasks
  supplementSchedule.supplements.forEach((supplement, index) => {
    tasks.push({
      id: `${dateKey}_supp_${index}`,
      category: "supplement",
      label: `${supplement.name} — ${supplement.dose}`,
      detail: `${supplement.timing} · ${supplement.notes}`,
    });
  });

  // Skincare AM tasks — pagi seragam setiap hari
  const skincare = SKINCARE_SCHEDULE.find((s) => s.dayIndex === dayIndex);
  if (skincare) {
    tasks.push({
      id: `${dateKey}_skin_am`,
      category: "skincare_am",
      label: "Skincare Pagi (Rutin Harian)",
      detail: "Facial Wash → Serum → Pomegranate Moist → Azarine SPF45",
    });
    tasks.push({
      id: `${dateKey}_skin_midday`,
      category: "skincare_am",
      label: "Skincare Siang (Re-apply Sunscreen)",
      detail: "Re-apply Azarine SPF45 bila outdoor / terpapar matahari langsung di siang hari",
    });
    tasks.push({
      id: `${dateKey}_skin_pm`,
      category: "skincare_pm",
      label: `Skincare Malam (${skincare.pmLabel})`,
      detail: skincare.pmRoutine.map((s) => s.productShort).join(" → "),
    });
  }

  if (fastingContext.isFastStartDay) {
    tasks.push({
      id: `${dateKey}_fast_start`,
      category: "fasting",
      label: "Mulai Puasa 36 Jam (20:00)",
      detail: "Makan terakhir selesai sebelum 20:00 · siapkan air mineral dan elektrolit",
    });
  }

  if (fastingContext.isStrictFastDay) {
    tasks.push({
      id: `${dateKey}_fast_active`,
      category: "fasting",
      label: "Puasa 36 Jam Masih Aktif",
      detail: "Tanpa kalori · target 3–4 liter air · elektrolit bila perlu · latihan berat dilarang",
    });
  }

  if (fastingContext.isRefeedDay) {
    tasks.push({
      id: `${dateKey}_fast_refeed`,
      category: "fasting",
      label: "Refeeding Bertahap (08:00–09:00)",
      detail: "Bone broth / putih telur → oatmeal + telur · tahan latihan berat sampai energi stabil",
    });
  }

  // Hydration task
  tasks.push({
    id: `${dateKey}_hydration`,
    category: "hydration",
    label: "Hidrasi Harian",
    detail: fastingContext.isFastingDay
      ? "Target 3–4 liter air + elektrolit selama jendela puasa / refeeding"
      : "Target minimum 2–3 liter air per hari",
  });

  return tasks;
}

// ---- Progress calculation ----
export function calcProgress(
  completedIds: string[],
  totalIds: string[]
): number {
  if (totalIds.length === 0) return 0;
  return Math.round((completedIds.length / totalIds.length) * 100);
}

// ---- Severity color ----
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "danger":
      return "border-red-700 bg-red-950/40 text-red-300";
    case "warning":
      return "border-yellow-700 bg-yellow-950/30 text-yellow-300";
    case "info":
      return "border-jade-700 bg-jade-950/30 text-jade-300";
    case "unknown":
      return "border-purple-700 bg-purple-950/30 text-purple-300";
    default:
      return "border-gray-700 bg-gray-900 text-gray-300";
  }
}

export function getTagBadge(tag?: string): string {
  switch (tag) {
    case "DANGER":
      return "bg-red-800 text-red-100";
    case "WARNING":
      return "bg-yellow-800 text-yellow-100";
    case "UNKNOWN":
      return "bg-purple-800 text-purple-100";
    case "ASSUMPTION":
      return "bg-blue-800 text-blue-100";
    case "CONFLICT":
      return "bg-orange-800 text-orange-100";
    default:
      return "bg-gray-700 text-gray-100";
  }
}
