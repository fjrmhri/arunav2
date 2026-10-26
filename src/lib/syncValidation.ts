// ============================================================
// SYNC VALIDATION — arunav2 → Obsidian
// Validasi body POST /api/sync-obsidian sebelum menyentuh GitHub API
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import type { ProgressData } from "@/lib/markdownFormatter";

export const MAX_SYNC_LOGS = 31;
export const MAX_NOTES_LENGTH = 5000;
const MAX_TASK_IDS = 200;
const MAX_TASK_ID_LENGTH = 100;
const MAX_SERIES_LENGTH = 30;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SKIN_REACTIONS = ["none", "mild", "severe"];

export interface SyncPayload {
  logs: CompletionLog[];
  progressData?: ProgressData;
  prefs: Pick<UserPreferences, "startDate" | "lastFastStartDate">;
}

export type SyncValidationResult =
  | { ok: true; payload: SyncPayload }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_KEY_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isTaskIdList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_TASK_IDS &&
    value.every((id) => typeof id === "string" && id.length <= MAX_TASK_ID_LENGTH)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateLog(value: unknown): CompletionLog | null {
  if (!isRecord(value)) return null;
  const { dateKey, completedTaskIds, skippedTaskIds, notes, skinReaction, lastUpdated } = value;

  if (!isValidDateKey(dateKey)) return null;
  if (!isTaskIdList(completedTaskIds) || !isTaskIdList(skippedTaskIds)) return null;
  if (typeof notes !== "string" || notes.length > MAX_NOTES_LENGTH) return null;
  if (skinReaction !== undefined && !SKIN_REACTIONS.includes(skinReaction as string)) return null;
  if (!isFiniteNumber(lastUpdated)) return null;

  return {
    dateKey,
    completedTaskIds,
    skippedTaskIds,
    notes,
    skinReaction: skinReaction as CompletionLog["skinReaction"],
    lastUpdated,
  };
}

function validateSeries(value: unknown): ProgressData["last7"] | null {
  if (!Array.isArray(value) || value.length > MAX_SERIES_LENGTH) return null;
  const series: ProgressData["last7"] = [];
  for (const point of value) {
    if (!isRecord(point)) return null;
    const { dateKey, completedCount, percent } = point;
    if (!isValidDateKey(dateKey) || !isFiniteNumber(completedCount) || !isFiniteNumber(percent)) {
      return null;
    }
    series.push({ dateKey, completedCount, percent });
  }
  return series;
}

function validateProgressData(value: unknown): ProgressData | null {
  if (!isRecord(value)) return null;
  const last7 = validateSeries(value.last7);
  const last30 = validateSeries(value.last30);
  const numbers = ["streak", "totalCompletedTasks", "perfectDays", "avg7", "avg30"] as const;

  if (!last7 || !last30) return null;
  if (!numbers.every((key) => isFiniteNumber(value[key]))) return null;
  if (!isValidDateKey(value.startDate)) return null;

  return {
    streak: value.streak as number,
    last7,
    last30,
    totalCompletedTasks: value.totalCompletedTasks as number,
    perfectDays: value.perfectDays as number,
    avg7: value.avg7 as number,
    avg30: value.avg30 as number,
    startDate: value.startDate,
  };
}

export function validateSyncPayload(body: unknown): SyncValidationResult {
  if (!isRecord(body)) return { ok: false, error: "Body harus berupa objek JSON." };

  const { logs, progressData, prefs } = body;

  if (!Array.isArray(logs) || logs.length > MAX_SYNC_LOGS) {
    return { ok: false, error: `logs harus array berisi maksimal ${MAX_SYNC_LOGS} item.` };
  }

  const validLogs: CompletionLog[] = [];
  for (const log of logs) {
    const validLog = validateLog(log);
    if (!validLog) return { ok: false, error: "Ada log dengan format tidak valid." };
    validLogs.push(validLog);
  }

  if (!isRecord(prefs) || !isValidDateKey(prefs.startDate)) {
    return { ok: false, error: "prefs.startDate tidak valid." };
  }
  if (prefs.lastFastStartDate !== undefined && !isValidDateKey(prefs.lastFastStartDate)) {
    return { ok: false, error: "prefs.lastFastStartDate tidak valid." };
  }

  let validProgress: ProgressData | undefined;
  if (progressData !== undefined && progressData !== null) {
    const parsed = validateProgressData(progressData);
    if (!parsed) return { ok: false, error: "progressData tidak valid." };
    validProgress = parsed;
  }

  return {
    ok: true,
    payload: {
      logs: validLogs,
      progressData: validProgress,
      prefs: {
        startDate: prefs.startDate,
        lastFastStartDate: prefs.lastFastStartDate as string | undefined,
      },
    },
  };
}
