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

export async function getCompletionLog(dateKey: string): Promise<CompletionLog | null> {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`log_${dateKey}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveCompletionLog(dateKey: string, log: CompletionLog): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(`log_${dateKey}`, JSON.stringify(log));
  }
}

const PREFS_KEY = "user_prefs";

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

export async function getUserPreferences(): Promise<UserPreferences> {
  if (typeof window === "undefined") return createDefaultPrefs();
  const raw = localStorage.getItem(PREFS_KEY);

  // Simpan prefs saat pertama kali dibuat agar startDate (anchor puasa) tidak
  // bergeser ke "hari ini" setiap kali app dibuka.
  if (!raw) {
    const prefs = createDefaultPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return prefs;
  }

  return { ...createDefaultPrefs(), ...JSON.parse(raw) };
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

  return getDateKeysInRange(startDateKey, endDateKey)
    .map((dateKey) => {
      const raw = localStorage.getItem(`log_${dateKey}`);
      return raw ? (JSON.parse(raw) as CompletionLog) : null;
    })
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

export function getStorageMode(): "local" {
  return "local";
}
