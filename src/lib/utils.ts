// ============================================================
// UTILITIES — arunav2
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DayIndex, DayType, FastingPhase } from "@/types";
import { FASTING_SCHEDULE } from "@/data/fitness-seed";
import { EXERCISE_SCHEDULE } from "@/data/fitness-seed";
import { SKINCARE_SCHEDULE } from "@/data/skincare-seed";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Tanggal ----
export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDayOfWeek(dateStr: string): number {
  // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay();
}

// ---- Mapping hari kalender ke DayIndex siklus (Senin=1, ..., Minggu=7) ----
export function calendarDayToCycleDay(
  dateStr: string,
  startDate: string
): DayIndex {
  const start = new Date(startDate + "T00:00:00");
  const current = new Date(dateStr + "T00:00:00");
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
  const d = new Date(dateStr + "T00:00:00");
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
  const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue
  const hour = now.getHours();

  // Puasa: Minggu 20:00 → Selasa 08:00
  // Hitung apakah sekarang ada di window puasa
  let fastStart: Date | null = null;
  let isActive = false;

  if (day === 0 && hour >= 20) {
    // Minggu malam, puasa baru mulai
    fastStart = new Date(now);
    fastStart.setHours(20, 0, 0, 0);
    isActive = true;
  } else if (day === 1) {
    // Senin sepanjang hari (puasa)
    const prevSun = new Date(now);
    prevSun.setDate(now.getDate() - 1);
    prevSun.setHours(20, 0, 0, 0);
    fastStart = prevSun;
    isActive = true;
  } else if (day === 2 && hour < 8) {
    // Selasa sebelum 08:00 (masih puasa)
    const prevSun = new Date(now);
    prevSun.setDate(now.getDate() - 2);
    prevSun.setHours(20, 0, 0, 0);
    fastStart = prevSun;
    isActive = true;
  }

  if (!isActive || !fastStart) {
    return { isActive: false, phase: null, hourElapsed: 0, percentComplete: 0 };
  }

  const elapsed = (now.getTime() - fastStart.getTime()) / (1000 * 60 * 60);
  const percent = Math.min((elapsed / 36) * 100, 100);

  // Tentukan fase
  let phase: FastingPhase | null = null;
  if (elapsed < 12) {
    phase = FASTING_SCHEDULE.phases[0];
  } else if (elapsed < 24) {
    phase = FASTING_SCHEDULE.phases[1];
  } else if (elapsed < 30) {
    phase = FASTING_SCHEDULE.phases[2];
  } else {
    phase = FASTING_SCHEDULE.phases[3];
  }

  return {
    isActive: true,
    phase,
    hourElapsed: Math.floor(elapsed),
    percentComplete: Math.round(percent),
  };
}

// ---- Generate Task IDs ----
export function generateTasks(dayIndex: DayIndex, dateKey: string) {
  const tasks: Array<{
    id: string;
    category: string;
    label: string;
    detail?: string;
  }> = [];

  // Exercise tasks
  const exercise = EXERCISE_SCHEDULE.find((e) => e.dayIndex === dayIndex);
  if (exercise && exercise.exercises.length > 0) {
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

  // Nutrition tasks (sarapan, makan siang, makan malam)
  tasks.push(
    {
      id: `${dateKey}_meal_breakfast`,
      category: "nutrition",
      label: "Sarapan (08:00)",
      detail: "Oatmeal + 3 Telur Rebus + Kopi Hitam · ~380 kkal",
    },
    {
      id: `${dateKey}_meal_lunch`,
      category: "nutrition",
      label: "Makan Siang (13:00)",
      detail: "Nasi ½ porsi + Ayam Bakar + Tempe + Sayur tiris · ~620 kkal",
    },
    {
      id: `${dateKey}_meal_dinner`,
      category: "nutrition",
      label: "Makan Malam (19:00)",
      detail: "Nasi ½ porsi + Ikan Bakar + Sayur Bening · ~480 kkal",
    }
  );

  // Supplement tasks — 4 slot waktu dari jadwal_harian.txt
  tasks.push(
    {
      id: `${dateKey}_supp_hema1`,
      category: "supplement",
      label: "Hemaviton Stamina Plus — Dosis 1",
      detail: "🌅 Pagi 07:00–08:30 · 1 Kapsul · 15–30 mnt setelah sarapan",
    },
    {
      id: `${dateKey}_supp_hema2`,
      category: "supplement",
      label: "Hemaviton Stamina Plus — Dosis 2",
      detail: "☀️ Siang 12:00–13:00 · 1 Kapsul · segera setelah makan siang berlemak · selesai maksimal 13:00",
    },
    {
      id: `${dateKey}_supp_omega`,
      category: "supplement",
      label: "Om3heart Omega-3",
      detail: "☀️ Siang 12:00–13:00 · 2 Kapsul · bersama D3 dan Hemaviton Dosis 2 · selesai maksimal 13:00",
    },
    {
      id: `${dateKey}_supp_d3`,
      category: "supplement",
      label: "MyWell Vitamin D3 1000 IU",
      detail: "☀️ Siang 12:00–13:00 · 1 Tablet · bersama makan siang berlemak · selesai maksimal 13:00",
    },
    {
      id: `${dateKey}_supp_creatine`,
      category: "supplement",
      label: "Creatine Monohydrate",
      detail: "🌤️ Sore 16:00–17:00 · ±5 gram · larutkan dalam 400–500 ml air",
    },
    {
      id: `${dateKey}_supp_mag`,
      category: "supplement",
      label: "Alliwise Magnesium Glycinate",
      detail: "🌙 Malam 21:00–21:30 · 2 Kapsul · minimal 8 jam setelah Hemaviton siang",
    }
  );

  // Skincare AM tasks — pagi seragam setiap hari
  const skincare = SKINCARE_SCHEDULE.find((s) => s.dayIndex === dayIndex);
  if (skincare) {
    const nightLabels: Record<number, string> = {
      1: "Normal", 2: "Multi-Masking", 3: "Eksfoliasi",
      4: "Normal", 5: "Multi-Masking", 6: "Normal", 7: "Eksfoliasi",
    };
    tasks.push({
      id: `${dateKey}_skin_am`,
      category: "skincare_am",
      label: "Skincare Pagi (Rutin Harian)",
      detail: "Facial Wash → Serum → Pomegranate Moist → Azarine SPF45",
    });
    skincare.amRoutine.forEach((step, i) => {
      tasks.push({
        id: `${dateKey}_skin_am_${i}`,
        category: "skincare_am",
        label: step.productShort,
        detail: step.notes,
      });
    });
    tasks.push({
      id: `${dateKey}_skin_sunscreen_reapply`,
      category: "skincare_am",
      label: "Re-apply Sunscreen (setiap 2 jam di luar)",
      detail: "Wajib jika keluar rumah di siang hari",
    });
    tasks.push({
      id: `${dateKey}_skin_pm`,
      category: "skincare_pm",
      label: `Skincare Malam — ${nightLabels[dayIndex] ?? "Normal"}`,
      detail: skincare.pmRoutine.map((s) => s.productShort).join(" → "),
    });
    skincare.pmRoutine.forEach((step, i) => {
      tasks.push({
        id: `${dateKey}_skin_pm_${i}`,
        category: "skincare_pm",
        label: step.productShort,
        detail: step.notes,
      });
    });
  }

  // Hydration task
  tasks.push({
    id: `${dateKey}_hydration`,
    category: "hydration",
    label: "Hidrasi Harian",
    detail: "Target minimum 2–3 liter air per hari (3–4 liter saat puasa)",
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
