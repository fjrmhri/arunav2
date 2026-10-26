// ============================================================
// GITHUB SYNC SERVICE — arunav2 → Obsidian
// Queue + batching, tidak spam GitHub API
// ============================================================

import type { CompletionLog, UserPreferences } from "@/types";
import {
  getCompletionLog,
  getCompletionLogsInRange,
  getUserPreferences,
  getStreak,
} from "@/lib/storage";
import { getLocalDateKey } from "@/lib/date";
import type { ProgressData } from "@/lib/markdownFormatter";
import {
  averagePercent,
  buildProgressSeries,
  sumCompleted,
  type ProgressPoint,
} from "@/lib/progress";
import { MAX_SYNC_LOGS } from "@/lib/syncValidation";

// ── Config ────────────────────────────────────────────────
const QUEUE_KEY             = "arunav2_sync_queue";
const LAST_SYNC_KEY         = "arunav2_last_sync";
const PAUSED_UNTIL_KEY      = "arunav2_sync_paused_until";
const SECRET_KEY            = "arunav2_sync_secret";
const FLUSH_INTERVAL_MS     = 2 * 60 * 1000;  // 2 menit
const PAUSE_AFTER_REJECT_MS = 30 * 60 * 1000; // 30 menit
const SYNC_ENDPOINT         = "/api/sync-obsidian";

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

/**
 * Hapus item yang sudah terkirim. Item yang di-enqueue ulang setelah flush
 * dimulai (enqueuedAt > sentBefore) tetap disimpan agar perubahan terbaru
 * ikut di flush berikutnya.
 */
function removeFromQueue(dateKeys: string[], sentBefore: number): void {
  if (typeof window === "undefined") return;
  const sent = new Set(dateKeys);
  const remaining = readQueue().filter(
    (item) => !sent.has(item.dateKey) || item.enqueuedAt > sentBefore,
  );
  writeQueue(remaining);
}

function getLastSync(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(LAST_SYNC_KEY) ?? "0");
}

function setLastSync(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
}

function getPausedUntil(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(PAUSED_UNTIL_KEY) ?? "0");
}

function setPausedUntil(timestamp: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAUSED_UNTIL_KEY, String(timestamp));
}

// ── Sync secret (disimpan di perangkat, dikirim sebagai Bearer token) ──

export function getSyncSecret(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SECRET_KEY) ?? "";
}

export function setSyncSecret(secret: string): void {
  if (typeof window === "undefined") return;
  const trimmed = secret.trim();
  if (trimmed) {
    localStorage.setItem(SECRET_KEY, trimmed);
  } else {
    localStorage.removeItem(SECRET_KEY);
  }
  setPausedUntil(0);
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

  const toPoint = ({ dateKey, completedCount, percent }: ProgressPoint) =>
    ({ dateKey, completedCount, percent });
  const series = buildProgressSeries(prefs, logs, today);
  const last7  = series.slice(-7);
  const last30 = series.slice(-30);

  return {
    streak,
    last7:               last7.map(toPoint),
    last30:              last30.map(toPoint),
    totalCompletedTasks: sumCompleted(series),
    perfectDays:         series.filter(p => p.percent === 100).length,
    avg7:                averagePercent(last7),
    avg30:               averagePercent(last30),
    startDate:           prefs.startDate,
  };
}

export type SyncResult =
  | "ok"
  | "empty"
  | "rate-limited"
  | "no-secret"
  | "paused"
  | "unauthorized"
  | "disabled"
  | "error";

/**
 * Flush queue item ke GitHub melalui API route (maksimal MAX_SYNC_LOGS tanggal
 * per panggilan; sisanya ikut di flush berikutnya).
 * Idempotent — aman dipanggil berulang.
 */
export async function flushSyncQueue(force = false): Promise<SyncResult> {
  if (typeof window === "undefined") return "empty";

  const secret = getSyncSecret();
  if (!secret) return "no-secret";

  const queue = readQueue();
  if (queue.length === 0 && !force) return "empty";

  // Setelah 401/503, jangan coba lagi sampai jeda selesai kecuali force
  if (!force && Date.now() < getPausedUntil()) return "paused";

  // Rate-limit: tidak flush lebih dari sekali per 60 detik kecuali force
  if (!force && Date.now() - getLastSync() < 60_000) return "rate-limited";

  const flushStartedAt = Date.now();

  try {
    const prefs = await getUserPreferences();

    // Ambil log untuk dateKey di queue (tanggal terlama dulu) + update dashboard
    const dateKeys = [...new Set(queue.map(q => q.dateKey))]
      .sort()
      .slice(0, MAX_SYNC_LOGS);
    const logs: CompletionLog[] = [];

    for (const dk of dateKeys) {
      const log = await getCompletionLog(dk);
      if (log) logs.push(log);
    }

    const progressData = await buildProgressData(prefs);

    const response = await fetch(SYNC_ENDPOINT, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${secret}`,
      },
      body: JSON.stringify({
        logs,
        progressData,
        prefs: { startDate: prefs.startDate, lastFastStartDate: prefs.lastFastStartDate },
      }),
    });

    if (response.status === 401 || response.status === 503) {
      setPausedUntil(Date.now() + PAUSE_AFTER_REJECT_MS);
      console.warn(`[GithubSync] Sync ditolak server (${response.status}). Dijeda 30 menit.`);
      return response.status === 401 ? "unauthorized" : "disabled";
    }

    if (!response.ok) {
      const err = await response.text();
      console.error("[GithubSync] Sync gagal:", err);
      return "error";
    }

    removeFromQueue(dateKeys, flushStartedAt);
    setLastSync();
    setPausedUntil(0);
    console.log(`[GithubSync] Sync berhasil: ${dateKeys.join(", ")}`);
    return "ok";
  } catch (err) {
    console.error("[GithubSync] Sync error:", err);
    return "error";
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
