// ============================================================
// LOCAL STORAGE ADAPTER — arunav2
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import {
  addDaysToDateKey,
  getDateKeysInRange,
  getLocalDateKey,
  parseLocalDateKey,
} from "@/lib/date";
import { TASK_ID_MIGRATION_KEY, migrateStoredTaskIds } from "@/lib/migrations";

const PREFS_KEY = "user_prefs";
const LOG_PREFIX = "log_";
const LOG_KEY_RE = /^log_\d{4}-\d{2}-\d{2}$/;

/** JSON.parse yang tidak melempar error; entri rusak dianggap tidak ada. */
function safeParse<T>(raw: string | null, key: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] Entri ${key} rusak, diabaikan.`);
    return null;
  }
}

function isCompletionLog(value: unknown): value is CompletionLog {
  const log = value as CompletionLog | null;
  return (
    !!log &&
    typeof log.dateKey === "string" &&
    Array.isArray(log.completedTaskIds) &&
    Array.isArray(log.skippedTaskIds)
  );
}

function readLog(dateKey: string): CompletionLog | null {
  const key = `${LOG_PREFIX}${dateKey}`;
  const log = safeParse<unknown>(localStorage.getItem(key), key);
  return isCompletionLog(log) ? log : null;
}

function createDefaultPrefs(): UserPreferences {
  return {
    userId: "default",
    name: "Aruna",
    startDate: getLocalDateKey(),
    cycleDay: 1,
    isOutdoor: false,
    notificationsEnabled: false,
  };
}

function readPrefs(): UserPreferences {
  const stored = safeParse<Partial<UserPreferences>>(localStorage.getItem(PREFS_KEY), PREFS_KEY);

  // Simpan prefs saat pertama kali dibuat (atau bila rusak) agar startDate
  // (anchor puasa) tidak bergeser ke "hari ini" setiap kali app dibuka.
  if (!stored) {
    const prefs = createDefaultPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return prefs;
  }

  return { ...createDefaultPrefs(), ...stored };
}

let migrationChecked = false;

function ensureMigrated(): void {
  if (migrationChecked) return;
  migrationChecked = true;
  migrateStoredTaskIds(localStorage, readPrefs());
}

export async function getCompletionLog(dateKey: string): Promise<CompletionLog | null> {
  if (typeof window === "undefined") return null;
  ensureMigrated();
  return readLog(dateKey);
}

export async function saveCompletionLog(dateKey: string, log: CompletionLog): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${LOG_PREFIX}${dateKey}`, JSON.stringify(log));
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  if (typeof window === "undefined") return createDefaultPrefs();
  ensureMigrated();
  return readPrefs();
}

export async function saveUserPreferences(
  prefs: Partial<UserPreferences>
): Promise<void> {
  const current = await getUserPreferences();
  const merged = { ...current, ...prefs };

  if (typeof window !== "undefined") {
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  }
}

export async function getCompletionLogsInRange(
  startDateKey: string,
  endDateKey: string
): Promise<CompletionLog[]> {
  if (typeof window === "undefined") return [];
  ensureMigrated();

  return getDateKeysInRange(startDateKey, endDateKey)
    .map((dateKey) => readLog(dateKey))
    .filter((log): log is CompletionLog => !!log)
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey));
}

export async function getStreak(today: string): Promise<number> {
  if (typeof window === "undefined") return 0;

  let streak = 0;
  let key = getLocalDateKey(parseLocalDateKey(today));

  for (let i = 0; i < 60; i++) {
    const log = await getCompletionLog(key);
    if (log && log.completedTaskIds.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
    key = addDaysToDateKey(key, -1);
  }

  return streak;
}

// ── Backup: ekspor / impor JSON ─────────────────────────────

export const BACKUP_VERSION = 1;

export interface BackupData {
  app: "arunav2";
  version: number;
  exportedAt: string;
  prefs: UserPreferences;
  logs: CompletionLog[];
}

export async function exportBackup(): Promise<BackupData> {
  const prefs = await getUserPreferences();
  const logs: CompletionLog[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !LOG_KEY_RE.test(key)) continue;
    const log = readLog(key.slice(LOG_PREFIX.length));
    if (log) logs.push(log);
  }

  logs.sort((left, right) => left.dateKey.localeCompare(right.dateKey));
  return { app: "arunav2", version: BACKUP_VERSION, exportedAt: new Date().toISOString(), prefs, logs };
}

/**
 * Pulihkan backup: prefs diganti, log per tanggal ditimpa dengan isi backup.
 * Log tanggal lain yang tidak ada di backup dibiarkan.
 * @returns jumlah log yang dipulihkan
 */
export async function importBackup(data: unknown): Promise<number> {
  const backup = data as Partial<BackupData> | null;
  if (!backup || backup.app !== "arunav2" || !Array.isArray(backup.logs) || !backup.prefs) {
    throw new Error("File bukan backup arunav2 yang valid.");
  }
  if (typeof backup.version !== "number" || backup.version > BACKUP_VERSION) {
    throw new Error("Versi backup tidak didukung.");
  }

  const logs = backup.logs.filter(
    (log): log is CompletionLog => isCompletionLog(log) && /^\d{4}-\d{2}-\d{2}$/.test(log.dateKey),
  );

  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...createDefaultPrefs(), ...backup.prefs }));
  for (const log of logs) {
    localStorage.setItem(`${LOG_PREFIX}${log.dateKey}`, JSON.stringify(log));
  }

  // Backup dari versi lama mungkin masih memakai ID berbasis indeks
  migrationChecked = false;
  localStorage.removeItem(TASK_ID_MIGRATION_KEY);
  ensureMigrated();

  return logs.length;
}
