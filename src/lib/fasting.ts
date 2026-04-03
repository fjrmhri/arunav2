import {
  EXERCISE_SCHEDULE,
  FASTING_SCHEDULE,
  MEAL_PLANS,
  SUPPLEMENTS_BASE,
  SUPPLEMENT_SCHEDULES,
} from "@/data/fitness-seed";
import type {
  ExerciseDay,
  FastingPhase,
  MealPlan,
  Supplement,
  SupplementSchedule,
  UserPreferences,
} from "@/types";
import {
  addDaysToDateKey,
  combineDateKeyAndTime,
  diffCalendarDays,
  getLocalDateKey,
  getMonthDateRange,
  parseLocalDateKey,
} from "@/lib/date";

const FAST_CYCLE_DAYS = 14;
const FAST_DURATION_MS = FASTING_SCHEDULE.totalHours * 60 * 60 * 1000;
const FAST_REFEED_WINDOW_MS = 12 * 60 * 60 * 1000;
export const FASTING_REFEED_SUPPLEMENT_TIME = "09:00";

export type ExerciseRestrictionLevel = "none" | "light_only" | "no_resistance";

export interface FastingCycleEvent {
  startDateKey: string;
  startAt: Date;
  endDateKey: string;
  endAt: Date;
  refeedStartAt: Date;
  refeedEndAt: Date;
}

export interface FastingContext {
  dateKey: string;
  anchorDateKey: string;
  previousFast: FastingCycleEvent;
  currentFast: FastingCycleEvent;
  nextFast: FastingCycleEvent;
  cycleDatesThisMonth: FastingCycleEvent[];
  isFastStartDay: boolean;
  isFastEndDay: boolean;
  isFastingDay: boolean;
  isStrictFastDay: boolean;
  isRefeedDay: boolean;
  isActiveFastingWindow: boolean;
  isRefeedWindow: boolean;
  phase: FastingPhase | null;
  hourElapsed: number;
  hourRemaining: number;
  percentComplete: number;
  exerciseRestrictionLevel: ExerciseRestrictionLevel;
  exerciseGuidance: string;
  hydrationDetail: string;
}

function createCycleEvent(startDateKey: string): FastingCycleEvent {
  const startAt = combineDateKeyAndTime(startDateKey, FASTING_SCHEDULE.startTime);
  const endAt = new Date(startAt.getTime() + FAST_DURATION_MS);

  return {
    startDateKey,
    startAt,
    endDateKey: getLocalDateKey(endAt),
    endAt,
    refeedStartAt: endAt,
    refeedEndAt: new Date(endAt.getTime() + FAST_REFEED_WINDOW_MS),
  };
}

export function deriveInitialFastAnchor(startDateKey: string): string {
  const startDate = parseLocalDateKey(startDateKey);
  const anchor = new Date(startDate);

  while (anchor.getDay() !== 0) {
    anchor.setDate(anchor.getDate() + 1);
  }

  return getLocalDateKey(anchor);
}

export function getFastingAnchorDateKey(prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null) {
  if (prefs?.lastFastStartDate) return prefs.lastFastStartDate;
  if (prefs?.startDate) return deriveInitialFastAnchor(prefs.startDate);
  return deriveInitialFastAnchor(getLocalDateKey());
}

function resolveCycleStart(dateKey: string, anchorDateKey: string) {
  const diff = diffCalendarDays(anchorDateKey, dateKey);
  const cycleOffset = Math.floor(diff / FAST_CYCLE_DAYS) * FAST_CYCLE_DAYS;
  return addDaysToDateKey(anchorDateKey, cycleOffset);
}

function getExerciseGuidance(level: ExerciseRestrictionLevel, context: Pick<FastingContext, "isFastStartDay" | "isFastEndDay">) {
  if (level === "no_resistance") {
    return "Puasa aktif penuh. Hanya jalan santai, mobility, dan peregangan ringan. Hindari latihan resistensi, HIIT, dan sesi berat.";
  }

  if (level === "light_only" && context.isFastStartDay) {
    return "Puasa mulai pukul 20:00. Jika tetap berlatih, selesaikan maksimal sore hari dan jaga intensitas moderat.";
  }

  if (level === "light_only" && context.isFastEndDay) {
    return "Pagi ini ada refeeding. Tahan latihan berat sampai energi dan hidrasi stabil; pilih recovery ringan terlebih dahulu.";
  }

  return "Latihan mengikuti jadwal normal.";
}

export function getFastingCycleEventsForMonth(
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
  monthDate: Date = new Date(),
): FastingCycleEvent[] {
  const anchorDateKey = getFastingAnchorDateKey(prefs);
  const { startDateKey, endDateKey } = getMonthDateRange(monthDate);
  let currentStart = resolveCycleStart(startDateKey, anchorDateKey);
  currentStart = addDaysToDateKey(currentStart, -FAST_CYCLE_DAYS);

  const events: FastingCycleEvent[] = [];

  while (diffCalendarDays(currentStart, endDateKey) >= -FAST_CYCLE_DAYS) {
    const event = createCycleEvent(currentStart);
    const intersectsMonth =
      event.startDateKey <= endDateKey && event.endDateKey >= startDateKey;

    if (intersectsMonth) {
      events.push(event);
    }

    currentStart = addDaysToDateKey(currentStart, FAST_CYCLE_DAYS);
    if (diffCalendarDays(endDateKey, currentStart) < -FAST_CYCLE_DAYS) {
      break;
    }
  }

  return events;
}

export function getFastingContext(
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
  referenceDate: Date = combineDateKeyAndTime(dateKey, "12:00"),
): FastingContext {
  const anchorDateKey = getFastingAnchorDateKey(prefs);
  const cycleStartDateKey = resolveCycleStart(dateKey, anchorDateKey);
  const currentFast = createCycleEvent(cycleStartDateKey);
  const previousFast = createCycleEvent(
    addDaysToDateKey(cycleStartDateKey, -FAST_CYCLE_DAYS),
  );
  const upcomingFast = createCycleEvent(
    addDaysToDateKey(cycleStartDateKey, FAST_CYCLE_DAYS),
  );
  const nextFast =
    referenceDate < currentFast.startAt ? currentFast : upcomingFast;

  const dateStart = combineDateKeyAndTime(dateKey, "00:00");
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const overlapsCurrentFast =
    dateStart < currentFast.endAt && dateEnd > currentFast.startAt;
  const isStrictFastDay =
    dateStart >= currentFast.startAt && dateEnd <= currentFast.endAt;
  const isActiveFastingWindow =
    referenceDate >= currentFast.startAt && referenceDate < currentFast.endAt;
  const isRefeedWindow =
    referenceDate >= currentFast.refeedStartAt &&
    referenceDate < currentFast.refeedEndAt;
  const isFastStartDay = dateKey === currentFast.startDateKey;
  const isFastEndDay = dateKey === currentFast.endDateKey;

  let phase: FastingPhase | null = null;
  let hourElapsed = 0;
  let hourRemaining = 0;
  let percentComplete = 0;

  if (isActiveFastingWindow) {
    const elapsedHours =
      (referenceDate.getTime() - currentFast.startAt.getTime()) / (60 * 60 * 1000);
    hourElapsed = Math.max(0, Math.floor(elapsedHours));
    hourRemaining = Math.max(0, FASTING_SCHEDULE.totalHours - hourElapsed);
    percentComplete = Math.min(
      100,
      Math.round((elapsedHours / FASTING_SCHEDULE.totalHours) * 100),
    );

    if (elapsedHours < 12) {
      phase = FASTING_SCHEDULE.phases[0];
    } else if (elapsedHours < 24) {
      phase = FASTING_SCHEDULE.phases[1];
    } else if (elapsedHours < 30) {
      phase = FASTING_SCHEDULE.phases[2];
    } else {
      phase = FASTING_SCHEDULE.phases[3];
    }
  }

  let exerciseRestrictionLevel: ExerciseRestrictionLevel = "none";
  if (isStrictFastDay) {
    exerciseRestrictionLevel = "no_resistance";
  } else if (isFastStartDay || isFastEndDay) {
    exerciseRestrictionLevel = "light_only";
  }

  return {
    dateKey,
    anchorDateKey,
    previousFast,
    currentFast,
    nextFast,
    cycleDatesThisMonth: getFastingCycleEventsForMonth(prefs, referenceDate),
    isFastStartDay,
    isFastEndDay,
    isFastingDay: overlapsCurrentFast,
    isStrictFastDay,
    isRefeedDay: isFastEndDay,
    isActiveFastingWindow,
    isRefeedWindow,
    phase,
    hourElapsed,
    hourRemaining,
    percentComplete,
    exerciseRestrictionLevel,
    exerciseGuidance: getExerciseGuidance(exerciseRestrictionLevel, {
      isFastStartDay,
      isFastEndDay,
    }),
    hydrationDetail: overlapsCurrentFast
      ? "Target 3–4 liter air + elektrolit sesuai protokol puasa."
      : "Target 2–3 liter air per hari.",
  };
}

function isSupplementHeldForRefeed(supplement: Supplement) {
  return (
    !supplement.name.includes("Creatine") &&
    !supplement.name.includes("Magnesium")
  );
}

export function getExercisePlanForDate(
  dayIndex: ExerciseDay["dayIndex"],
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
): ExerciseDay {
  const baseExercise =
    EXERCISE_SCHEDULE.find((entry) => entry.dayIndex === dayIndex) ??
    EXERCISE_SCHEDULE[0];
  const context = getFastingContext(dateKey, prefs);

  if (context.isStrictFastDay) {
    return {
      ...baseExercise,
      type: "fasting_active",
      label: "Recovery Ringan Saat Puasa",
      duration: "10–20 Menit",
      exercises: [
        {
          name: "Jalan santai / mobility ringan / stretching",
          notes:
            "Zona 1–2 saja. Hentikan bila muncul pusing, tremor, atau palpitasi.",
        },
      ],
      warmup: undefined,
      cooldown: "Pernapasan nasal + peregangan ringan 5 menit",
      notes:
        "Puasa aktif penuh. Hindari latihan resistensi, HIIT, dan beban berat sampai refeeding selesai.",
    };
  }

  if (context.isRefeedDay) {
    return {
      ...baseExercise,
      type: "active_recovery",
      label: "Recovery & Refeed Day",
      duration: "15–30 Menit",
      exercises: [
        {
          name: "Jalan santai / mobility / stretching",
          notes:
            "Tahan latihan berat sampai refeeding, hidrasi, dan energi terasa stabil.",
        },
      ],
      warmup: undefined,
      cooldown: "Pendinginan ringan 5 menit",
      notes:
        "Pagi ini ada refeeding. Prioritaskan pemulihan, observasi energi, dan aktivitas low-intensity.",
    };
  }

  if (context.isFastStartDay) {
    return {
      ...baseExercise,
      notes: [baseExercise.notes, context.exerciseGuidance].filter(Boolean).join(" "),
    };
  }

  return baseExercise;
}

export function getMealPlanForDate(
  dayIndex: MealPlan["dayIndex"],
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
): MealPlan {
  const baseMealPlan =
    MEAL_PLANS.find((entry) => entry.dayIndex === dayIndex) ?? MEAL_PLANS[0];
  const context = getFastingContext(dateKey, prefs);

  if (context.isStrictFastDay) {
    return {
      ...baseMealPlan,
      isFastingDay: true,
      meals: [
        {
          time: "Sepanjang Hari",
          label: "Puasa Aktif",
          items: [
            "Air mineral total 3–4 liter",
            "Kopi hitam / teh hijau tanpa gula bila perlu",
            "Elektrolit 1/4–1/2 sdt garam laut dalam air mineral",
          ],
          kcal: 0,
          protein: 0,
          notes: "Tidak ada kalori sampai refeeding selesai dibuka.",
        },
      ],
      totalKcal: 0,
      totalProtein: 0,
      notes:
        "Puasa 36 jam sedang aktif. Semua makan utama ditunda sampai refeeding besok pagi.",
    };
  }

  if (context.isRefeedDay) {
    return {
      ...baseMealPlan,
      isFastingDay: false,
      meals: [
        {
          time: FASTING_SCHEDULE.refeeding[0].time.split(" ").at(-1) ?? "08:00",
          label: "Refeeding Tahap 1",
          items: FASTING_SCHEDULE.refeeding[0].items,
          kcal: 0,
          protein: 0,
          notes: FASTING_SCHEDULE.refeeding[0].notes,
        },
        {
          time: FASTING_SCHEDULE.refeeding[1].time.split(" ").at(-1) ?? "09:00",
          label: "Refeeding Tahap 2",
          items: FASTING_SCHEDULE.refeeding[1].items,
          kcal: baseMealPlan.meals[0]?.kcal ?? 0,
          protein: baseMealPlan.meals[0]?.protein ?? 0,
          notes: FASTING_SCHEDULE.refeeding[1].notes,
        },
        ...baseMealPlan.meals.filter((meal) => meal.label !== "Sarapan"),
      ],
      notes: [baseMealPlan.notes, "Pagi ini kembali makan secara bertahap setelah puasa 36 jam."]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (context.isFastStartDay) {
    return {
      ...baseMealPlan,
      notes: [
        baseMealPlan.notes,
        "Makan malam hari ini menjadi makan terakhir sebelum puasa dimulai pukul 20:00.",
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  return {
    ...baseMealPlan,
    isFastingDay: false,
  };
}

export function getSupplementScheduleForDate(
  dayIndex: SupplementSchedule["dayIndex"],
  dateKey: string,
  prefs?: Pick<UserPreferences, "startDate" | "lastFastStartDate"> | null,
): SupplementSchedule {
  const baseSchedule =
    SUPPLEMENT_SCHEDULES.find((entry) => entry.dayIndex === dayIndex) ??
    ({
      dayIndex,
      isFastingDay: false,
      supplements: SUPPLEMENTS_BASE,
    } satisfies SupplementSchedule);

  const context = getFastingContext(dateKey, prefs);

  const supplements = baseSchedule.supplements.map((supplement) => {
    if (!isSupplementHeldForRefeed(supplement)) {
      return supplement;
    }

    if (context.isStrictFastDay) {
      return {
        ...supplement,
        timingSlot: "pagi" as const,
        timeRange: `${FASTING_REFEED_SUPPLEMENT_TIME}–09:30`,
        timing: `${FASTING_REFEED_SUPPLEMENT_TIME} — bersama refeeding hari berikutnya`,
        notes: `${supplement.notes} ⏳ Ditunda ke refeeding ${context.currentFast.endDateKey} pukul ${FASTING_REFEED_SUPPLEMENT_TIME}.`,
      };
    }

    if (context.isRefeedDay) {
      return {
        ...supplement,
        timingSlot: "pagi" as const,
        timeRange: `${FASTING_REFEED_SUPPLEMENT_TIME}–09:30`,
        timing: `${FASTING_REFEED_SUPPLEMENT_TIME} — bersama refeeding tahap 2`,
        notes: `${supplement.notes} ✅ Hari refeed: konsumsi bersama oatmeal + telur setelah pembuka ringan.`,
      };
    }

    return supplement;
  });

  return {
    ...baseSchedule,
    isFastingDay: context.isFastingDay,
    supplements,
  };
}
