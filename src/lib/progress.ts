// ============================================================
// PROGRESS — arunav2
// Seri completion harian, dipakai halaman Progress dan sync Obsidian.
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import { filterValidTaskIds } from "@/lib/completion";
import { getDateKeysInRange } from "@/lib/date";
import { generateTasks, getDayIndexFromDateKey } from "@/lib/utils";

export type ProgressPoint = {
  dateKey: string;
  completedCount: number;
  totalCount: number;
  percent: number;
};

/** Satu titik per hari dari startDate sampai endDateKey (inklusif). */
export function buildProgressSeries(
  prefs: Pick<UserPreferences, "startDate" | "lastFastStartDate">,
  logs: CompletionLog[],
  endDateKey: string,
): ProgressPoint[] {
  const logMap = new Map(logs.map((log) => [log.dateKey, log]));

  return getDateKeysInRange(prefs.startDate, endDateKey).map((dateKey) => {
    const validTaskIds = generateTasks(getDayIndexFromDateKey(dateKey), dateKey, prefs).map(
      (task) => task.id,
    );
    const totalCount = validTaskIds.length;
    const completedCount = filterValidTaskIds(
      logMap.get(dateKey)?.completedTaskIds ?? [],
      validTaskIds,
    ).length;

    return {
      dateKey,
      completedCount,
      totalCount,
      percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    };
  });
}

export function averagePercent(points: Pick<ProgressPoint, "percent">[]): number {
  if (points.length === 0) return 0;
  return Math.round(points.reduce((total, point) => total + point.percent, 0) / points.length);
}

export function sumCompleted(points: Pick<ProgressPoint, "completedCount">[]): number {
  return points.reduce((total, point) => total + point.completedCount, 0);
}
