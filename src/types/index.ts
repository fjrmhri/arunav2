// ============================================================
// TYPES — arunav2
// Berdasarkan isi 1.pdf (kebugaran/nutrisi) dan 2.pdf (skincare)
// ============================================================

// ---- Hari dalam siklus 7 hari ----
export type DayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ---- Kategori tugas ----
export type TaskCategory =
  | "exercise"
  | "nutrition"
  | "fasting"
  | "supplement"
  | "skincare_am"
  | "skincare_pm"
  | "hydration"
  | "recovery";

// ---- Status hari latihan ----
export type DayType =
  | "workout_lower"
  | "workout_push"
  | "workout_hiit"
  | "workout_pull"
  | "workout_fullbody"
  | "active_recovery"
  | "rest_fasting"
  | "fasting_active";

// ---- Skincare phase ----
export type SkincarePhase = "stabilitas" | "pencerahan" | "recovery";

// ---- Level severity untuk safety notes ----
export type SeverityLevel = "info" | "warning" | "danger" | "unknown";

// ---- Status tugas harian ----
export type TaskStatus = "pending" | "done" | "skipped";

// ============================================================
// MASTER PLAN — Data statis dari PDF
// ============================================================

export interface ExerciseDay {
  dayIndex: DayIndex;
  dayName: string; // Senin, Selasa, dst
  type: DayType;
  label: string;
  duration: string;
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
  notes?: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  rest?: string;
  rpe?: number;
  rir?: number;
  notes?: string;
}

export interface MealPlan {
  dayIndex: DayIndex;
  isFastingDay: boolean;
  meals: Meal[];
  totalKcal: number;
  totalProtein: number;
  notes?: string;
}

export interface Meal {
  time: string;
  label: string;
  items: string[];
  kcal: number;
  protein: number;
  notes?: string;
}

export interface SupplementSchedule {
  dayIndex: DayIndex;
  isFastingDay: boolean;
  supplements: Supplement[];
}

export interface Supplement {
  name: string;
  dose: string;
  timing: string;
  timingSlot: "pagi" | "siang" | "sore" | "malam";
  timeRange: string;
  withFood: boolean;
  notes: string;
  warningIfCombined?: string;
  conflictNote?: string;
}

export interface FastingSchedule {
  startDay: DayIndex; // Minggu
  startTime: string; // "20:00"
  endDay: DayIndex; // Selasa
  endTime: string; // "08:00"
  totalHours: number;
  phases: FastingPhase[];
  refeeding: RefeedingStep[];
  electrolyteProtocol: string[];
  redFlags: string[];
}

export interface FastingPhase {
  hourRange: string;
  dayTime: string;
  title: string;
  description: string;
  actions: string[];
  isRestricted: boolean;
}

export interface RefeedingStep {
  time: string;
  items: string[];
  notes: string;
}

export interface SkincareDay {
  dayIndex: DayIndex;
  dayName: string;
  phase: SkincarePhase;
  amRoutine: SkincareStep[];
  pmRoutine: SkincareStep[];
  amLabel: string;
  pmLabel: string;
  isRecoveryDay: boolean;
  warnings: string[];
}

export interface SkincareStep {
  order: number;
  product: string;
  productShort: string;
  notes?: string;
  isOptional?: boolean;
  warningNote?: string;
}

// ============================================================
// DAILY TASKS — Dihasilkan dari master plan
// ============================================================

export interface DailyTask {
  id: string;
  category: TaskCategory;
  label: string;
  detail?: string;
  status: TaskStatus;
  dayIndex: DayIndex;
  dateKey: string; // "YYYY-MM-DD"
}

// ============================================================
// COMPLETION LOGS — Tersimpan di Firestore / localStorage
// ============================================================

export interface CompletionLog {
  dateKey: string; // "YYYY-MM-DD"
  completedTaskIds: string[];
  skippedTaskIds: string[];
  notes: string;
  skinReaction?: "none" | "mild" | "severe";
  hydrationMl?: number;
  fastingNotes?: string;
  lastUpdated: number; // timestamp
}

// ============================================================
// SAFETY NOTES — Langsung dari PDF
// ============================================================

export interface SafetyNote {
  id: string;
  category: "fasting" | "supplement" | "skincare" | "exercise" | "medical";
  severity: SeverityLevel;
  title: string;
  body: string;
  source: "1.pdf" | "2.pdf";
  tag?: "UNKNOWN" | "ASSUMPTION" | "CONFLICT" | "WARNING" | "DANGER";
}

// ============================================================
// USER PREFERENCES
// ============================================================

export interface UserPreferences {
  userId: string;
  name: string;
  startDate: string; // "YYYY-MM-DD" — hari pertama program dimulai
  cycleDay: DayIndex; // hari siklus saat ini (1-7)
  isOutdoor: boolean; // trigger reapply sunscreen
  lastFastStartDate?: string;
  notificationsEnabled: boolean;
}

// ============================================================
// DASHBOARD STATE
// ============================================================

export interface TodayState {
  dateKey: string;
  dayIndex: DayIndex;
  dayName: string;
  dayType: DayType;
  exerciseDay: ExerciseDay;
  mealPlan: MealPlan;
  supplementSchedule: SupplementSchedule;
  skincareDay: SkincareDay;
  fastingStatus: FastingStatus | null;
  completionLog: CompletionLog;
  progressPercent: number;
  streakCount: number;
}

export interface FastingStatus {
  isActive: boolean;
  phase: FastingPhase | null;
  hourElapsed: number;
  hourRemaining: number;
  percentComplete: number;
  currentPhaseTitle: string;
}

// ============================================================
// WEEKLY OVERVIEW
// ============================================================

export interface WeeklyOverview {
  weekStartDate: string;
  days: WeekDaySummary[];
  overallCompletionPercent: number;
  streakCount: number;
}

export interface WeekDaySummary {
  dayIndex: DayIndex;
  dateKey: string;
  dayName: string;
  dayType: DayType;
  completionPercent: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

// ============================================================
// NUTRISI & KALKULASI
// ============================================================

export interface NutritionTarget {
  // SUMBER: 1.pdf — Mifflin-St Jeor, Pria 67kg 165cm 30thn (ASSUMED)
  bmr: number; // 1556.25 kcal/hari
  tdee: number; // 2412 kcal/hari (PAL 1.55)
  targetKcal: number; // 1930 kcal/hari (defisit 20%)
  proteinGram: number; // 135g (2.0g/kg)
  fatGram: number; // 60g (0.9g/kg)
  carbsGram: number; // 212g (sisa)
  // Tag ASSUMPTION karena usia dan kondisi medis tidak diketahui
  assumptions: string[];
}
