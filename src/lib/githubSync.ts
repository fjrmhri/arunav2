// ============================================================
// GITHUB SYNC SERVICE — arunav2 → Obsidian
// Queue + batching, tidak spam GitHub API
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import {
  getCompletionLogsInRange,
  getUserPreferences,
  getStreak,
} from "@/lib/firebase";
import { filterValidTaskIds } from "@/lib/completion";
import { getDateKeysInRange, getLocalDateKey } from "@/lib/date";
import { getDayIndexFromDateKey, generateTasks } from "@/lib/utils";
import type { ProgressData } from "@/lib/markdownFormatter";

// ── Config ────────────────────────────────────────────────
const QUEUE_KEY         = "arunav2_sync_queue";
const LAST_SYNC_KEY     = "arunav2_last_sync";
const FLUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 menit
const SYNC_ENDPOINT     = "/api/sync-obsidian";

type SyncQueueItem = {
  dateKey: string;
  enqueuedAt: number;
};

// ── Queue helpers ──────────────────────────────────────────

function readQueue(): SyncQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: SyncQueueItem[]): void {
  if (typeof window === "undefined") return;
  // Deduplicate by dateKey, keep latest
  const deduped = Object.values(
    queue.reduce<Record<string, SyncQueueItem>>((acc, item) => {
      acc[item.dateKey] = item;
      return acc;
    }, {})
  );
  localStorage.setItem(QUEUE_KEY, JSON.stringify(deduped));
}

function clearQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

function getLastSync(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(LAST_SYNC_KEY) ?? "0");
}

function setLastSync(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
}

// ── Enqueue ────────────────────────────────────────────────

/**
 * Tambahkan dateKey ke queue sinkronisasi.
 * Dipanggil setiap kali user menyelesaikan task.
 */
export function enqueueSyncForDate(dateKey: string): void {
  if (typeof window === "undefined") return;

  const queue = readQueue();
  queue.push({ dateKey, enqueuedAt: Date.now() });
  writeQueue(queue);
}

// ── Flush ──────────────────────────────────────────────────

async function buildProgressData(prefs: UserPreferences): Promise<ProgressData> {
  const today  = getLocalDateKey();
  const [logs, streak] = await Promise.all([
    getCompletionLogsInRange(prefs.startDate, today),
    getStreak(today),
  ]);

  const logMap = new Map<string, CompletionLog>(logs.map(l => [l.dateKey, l]));

  const series = getDateKeysInRange(prefs.startDate, today).map(dk => {
    const dayIdx        = getDayIndexFromDateKey(dk);
    const validTaskIds  = generateTasks(dayIdx, dk, prefs).map(t => t.id);
    const totalCount    = validTaskIds.length;
    const completedCount = filterValidTaskIds(
      logMap.get(dk)?.completedTaskIds ?? [],
      validTaskIds,
    ).length;
    return {
      dateKey:        dk,
      completedCount,
      percent:        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    };
  });

  const last7  = series.slice(-7);
  const last30 = series.slice(-30);
  const avg7   = last7.length  > 0 ? Math.round(last7.reduce((s, p)  => s + p.percent, 0) / last7.length)  : 0;
  const avg30  = last30.length > 0 ? Math.round(last30.reduce((s, p) => s + p.percent, 0) / last30.length) : 0;

  return {
    streak,
    last7,
    last30,
    totalCompletedTasks: series.reduce((s, p) => s + p.completedCount, 0),
    perfectDays:         series.filter(p => p.percent === 100).length,
    avg7,
    avg30,
    startDate:           prefs.startDate,
  };
}

/**
 * Flush semua queue item ke GitHub melalui API route.
 * Idempotent — aman dipanggil berulang.
 */
export async function flushSyncQueue(force = false): Promise<void> {
  if (typeof window === "undefined") return;

  const queue = readQueue();
  if (queue.length === 0 && !force) return;

  // Rate-limit: tidak flush lebih dari sekali per 60 detik kecuali force
  if (!force && Date.now() - getLastSync() < 60_000) return;

  try {
    const prefs = await getUserPreferences();

    // Ambil log untuk semua dateKey di queue + update dashboard
    const dateKeys   = [...new Set(queue.map(q => q.dateKey))];
    const logs: CompletionLog[] = [];

    for (const dk of dateKeys) {
      const { getCompletionLog } = await import("@/lib/firebase");
      const log = await getCompletionLog(dk);
      if (log) logs.push(log);
    }

    const progressData = await buildProgressData(prefs);

    const response = await fetch(SYNC_ENDPOINT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ logs, progressData, prefs }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[GithubSync] Sync gagal:", err);
      return;
    }

    clearQueue();
    setLastSync();
    console.log(`[GithubSync] Sync berhasil: ${dateKeys.join(", ")}`);
  } catch (err) {
    console.error("[GithubSync] Sync error:", err);
  }
}

// ── Auto-flush scheduler ───────────────────────────────────

let _flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Mulai background scheduler.
 * Panggil sekali di layout atau useEffect.
 */
export function startSyncScheduler(): () => void {
  if (typeof window === "undefined") return () => {};

  // Flush saat app dibuka
  void flushSyncQueue();

  // Flush saat tab kembali ke foreground
  const handleVisibility = () => {
    if (!document.hidden) void flushSyncQueue();
  };
  document.addEventListener("visibilitychange", handleVisibility);

  // Flush berkala
  _flushTimer = setInterval(() => void flushSyncQueue(), FLUSH_INTERVAL_MS);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    if (_flushTimer) clearInterval(_flushTimer);
  };
}
