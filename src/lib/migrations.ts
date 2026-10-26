// ============================================================
// MIGRATIONS — arunav2
// Migrasi satu kali data localStorage lama ke format baru.
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import { getDayIndexFromDateKey, getLegacyTaskIdMap } from "@/lib/utils";

export const TASK_ID_MIGRATION_KEY = "arunav2_migration_task_ids_v2";
const LOG_KEY_RE = /^log_(\d{4}-\d{2}-\d{2})$/;
const LEGACY_ID_RE = /_(ex|meal|supp|skin_pm)_\d+$/;

export function migrateLogTaskIds(
  log: CompletionLog,
  prefs: Pick<UserPreferences, "startDate" | "lastFastStartDate">,
): CompletionLog {
  const ids = [...log.completedTaskIds, ...log.skippedTaskIds];
  if (!ids.some((id) => LEGACY_ID_RE.test(id))) return log;

  const map = getLegacyTaskIdMap(getDayIndexFromDateKey(log.dateKey), log.dateKey, prefs);
  const convert = (list: string[]) => [...new Set(list.map((id) => map.get(id) ?? id))];

  return {
    ...log,
    completedTaskIds: convert(log.completedTaskIds),
    skippedTaskIds: convert(log.skippedTaskIds),
  };
}

/** Ubah semua ID task berbasis indeks di localStorage ke ID stabil. Idempotent. */
export function migrateStoredTaskIds(
  storage: Storage,
  prefs: Pick<UserPreferences, "startDate" | "lastFastStartDate">,
): void {
  if (storage.getItem(TASK_ID_MIGRATION_KEY)) return;

  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && LOG_KEY_RE.test(key)) keys.push(key);
  }

  for (const key of keys) {
    try {
      const log = JSON.parse(storage.getItem(key) ?? "null") as CompletionLog | null;
      if (!log || !Array.isArray(log.completedTaskIds) || !Array.isArray(log.skippedTaskIds)) {
        continue;
      }
      const migrated = migrateLogTaskIds(log, prefs);
      if (migrated !== log) storage.setItem(key, JSON.stringify(migrated));
    } catch {
      // Entri rusak dibiarkan; pembacaan aman di storage adapter.
    }
  }

  storage.setItem(TASK_ID_MIGRATION_KEY, String(Date.now()));
}
