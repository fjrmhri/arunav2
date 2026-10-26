// ============================================================
// UTILITIES — arunav2
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DayIndex, DayType, FastingPhase, UserPreferences } from "@/types";
import { getSkincarePlanForDay } from "@/data/skincare-seed";
import { getLocalDateKey, parseLocalDateKey } from "@/lib/date";
import {
  getExercisePlanForDate,
  getFastingContext,
  getMealPlanForDate,
  getSupplementScheduleForDate,
  isSupplementHeldForRefeed,
} from "@/lib/fasting";
import {
  exerciseTaskIds,
  mealTaskIds,
  skinPmTaskIds,
  supplementTaskIds,
} from "@/lib/taskIds";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  return parseLocalDateKey(dateStr).getDay();
}

export function getDayIndexFromDateKey(dateStr: string): DayIndex {
  const weekday = parseLocalDateKey(dateStr).getDay();
  return (weekday === 0 ? 7 : weekday) as DayIndex;
}

export function calendarDayToCycleDay(
  dateStr: string,
  _startDate: string,
): DayIndex {
  return getDayIndexFromDateKey(dateStr);
}

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
  return HARI_ID[parseLocalDateKey(dateStr).getDay()];
}

export function getDayTypeColor(_type: DayType): string {
  // All grayscale in new design system
  return "text-gray-200";
}

export function getDayTypeBg(_type: DayType): string {
  // All use card style — border only differentiates
  return "bg-[#111111] border-[#222222]";
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

  if (exercise.exercises.length > 0) {
    tasks.push({
      id: `${dateKey}_ex_main`,
      category: "exercise",
      label: exercise.label,
      detail: `${exercise.exercises.length} gerakan · ${exercise.duration}`,
    });
    const exerciseIds = exerciseTaskIds(dateKey, exercise.exercises);
    exercise.exercises.forEach((ex, i) => {
      tasks.push({
        id: exerciseIds[i],
        category: "exercise",
        label: ex.name,
        detail: ex.sets
          ? `${ex.sets} Set × ${ex.reps}${ex.rpe ? ` · RPE ${ex.rpe}` : ""}`
          : ex.reps || "",
      });
    });
  }

  // Saat puasa ketat: meal plan berisi "Puasa Aktif" (bukan makan nyata) jadi
  // tidak actionable. Suplemen yang tidak ditunda (Creatine, Magnesium) tetap tampil.
  if (!fastingContext.isStrictFastDay) {
    const mealIds = mealTaskIds(dateKey, mealPlan.meals);
    mealPlan.meals.forEach((meal, index) => {
      tasks.push({
        id: mealIds[index],
        category: "nutrition",
        label: `${meal.label} (${meal.time})`,
        detail: meal.items.join(" + "),
      });
    });
  }

  const actionableSupplements = fastingContext.isStrictFastDay
    ? supplementSchedule.supplements.filter((supp) => !isSupplementHeldForRefeed(supp))
    : supplementSchedule.supplements;
  const supplementIds = supplementTaskIds(dateKey, actionableSupplements);
  actionableSupplements.forEach((supplement, index) => {
    tasks.push({
      id: supplementIds[index],
      category: "supplement",
      label: `${supplement.name} — ${supplement.dose}`,
      detail: `${supplement.timing} · ${supplement.notes}`,
    });
  });

  const skincare = getSkincarePlanForDay(dayIndex);
  tasks.push({
    id: `${dateKey}_skin_am`,
    category: "skincare_am",
    label: "Skincare Pagi (Rutin Harian)",
    detail: "Facial Wash → Serum → Pomegranate Brightening Moisturizer → Sunscreen",
  });

  const skinPmIds = skinPmTaskIds(dateKey, skincare.pmRoutine);
  skincare.pmRoutine.forEach((step, index) => {
    tasks.push({
      id: skinPmIds[index],
      category: "skincare_pm",
      label: `Skincare Malam — ${step.productShort}`,
      detail: step.notes,
    });
  });

  tasks.push({
    id: `${dateKey}_hydration`,
    category: "hydration",
    label: fastingContext.isFastingDay ? "Hidrasi 3–4 Liter" : "Hidrasi 2–3 Liter",
    detail: fastingContext.hydrationDetail,
  });

  // isStrictFastDay: alert card di tracker sudah mewakili status puasa.
  // Fasting task hanya untuk prep (isFastStartDay) dan refeed — keduanya actionable.
  if (fastingContext.isFastStartDay || fastingContext.isRefeedDay) {
    tasks.push({
      id: `${dateKey}_fasting`,
      category: "fasting",
      label: fastingContext.isRefeedDay ? "Refeeding Puasa" : "Persiapan Puasa 36 Jam",
      detail: fastingContext.exerciseGuidance,
    });
  }

  return tasks;
}

/**
 * Peta ID lama berbasis indeks (`_ex_0`, `_meal_1`, `_supp_2`, `_skin_pm_0`)
 * ke ID stabil berbasis nama, mengikuti urutan rencana pada tanggal tersebut.
 */
export function getLegacyTaskIdMap(
  dayIndex: DayIndex,
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
): Map<string, string> {
  const map = new Map<string, string>();
  const exercise = getExercisePlanForDate(dayIndex, dateKey, prefs);
  const mealPlan = getMealPlanForDate(dayIndex, dateKey, prefs);
  const supplements = getSupplementScheduleForDate(dayIndex, dateKey, prefs).supplements;
  const skincare = getSkincarePlanForDay(dayIndex);

  exerciseTaskIds(dateKey, exercise.exercises).forEach((id, i) =>
    map.set(`${dateKey}_ex_${i}`, id),
  );
  mealTaskIds(dateKey, mealPlan.meals).forEach((id, i) => map.set(`${dateKey}_meal_${i}`, id));
  supplementTaskIds(dateKey, supplements).forEach((id, i) => map.set(`${dateKey}_supp_${i}`, id));
  skinPmTaskIds(dateKey, skincare.pmRoutine).forEach((id, i) =>
    map.set(`${dateKey}_skin_pm_${i}`, id),
  );

  return map;
}

export function getSeverityColor(_severity: "info" | "warning" | "danger" | "unknown") {
  // All cards use base card style — color expressed only via icon/text in SafetyCard
  return "bg-[#111111] border-[#222222] text-[#eeeeee]";
}

export function getTagBadge(tag?: "UNKNOWN" | "ASSUMPTION" | "CONFLICT" | "WARNING" | "DANGER") {
  switch (tag) {
    case "UNKNOWN":
      return "tag-unknown";
    case "ASSUMPTION":
      return "tag-assumption";
    case "CONFLICT":
      return "tag-conflict";
    case "WARNING":
      return "tag-warning";
    case "DANGER":
      return "tag-danger";
    default:
      return "badge bg-night-800/60 text-gray-400 border border-night-700/40";
  }
}
