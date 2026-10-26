"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getCompletionLog,
  saveCompletionLog,
  getUserPreferences,
  saveUserPreferences,
  getStreak,
} from "@/lib/firebase";
import { todayKey, generateTasks, getDayIndexFromDateKey } from "@/lib/utils";
import { EXERCISE_SCHEDULE } from "@/data/fitness-seed";
import { getSkincarePlanForDay } from "@/data/skincare-seed";
import {
  getExercisePlanForDate,
  getFastingContext,
  getMealPlanForDate,
  getSupplementScheduleForDate,
} from "@/lib/fasting";
import { sanitizeCompletionLog } from "@/lib/completion";
// ── Obsidian sync ────────────────────────────────────────
import { enqueueSyncForDate, startSyncScheduler } from "@/lib/githubSync";
import type { DayIndex, CompletionLog, UserPreferences } from "@/types";

function msUntilNextMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

export function useTracker() {
  const [dateKey, setDateKey] = useState(todayKey);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [log, setLog] = useState<CompletionLog | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const dayIndex: DayIndex = getDayIndexFromDateKey(dateKey);

  const baseExercise = EXERCISE_SCHEDULE.find((e) => e.dayIndex === dayIndex)!;
  const skincare = getSkincarePlanForDay(dayIndex);
  const fastingContext = prefs
    ? getFastingContext(dateKey, prefs, new Date())
    : null;
  const exercise = useMemo(
    () => getExercisePlanForDate(dayIndex, dateKey, prefs),
    [dayIndex, dateKey, prefs],
  );
  const mealPlan = useMemo(
    () => getMealPlanForDate(dayIndex, dateKey, prefs),
    [dayIndex, dateKey, prefs],
  );
  const supplementSchedule = useMemo(
    () => getSupplementScheduleForDate(dayIndex, dateKey, prefs),
    [dayIndex, dateKey, prefs],
  );

  const allTasks = useMemo(
    () => generateTasks(dayIndex, dateKey, prefs),
    [dayIndex, dateKey, prefs],
  );
  const allTaskIds = useMemo(() => allTasks.map((t) => t.id), [allTasks]);

  const isFastingDay = !!fastingContext?.isFastingDay;
  const isFastingPrepDay = !!fastingContext?.isFastStartDay;

  // Log tersimpan tidak pernah dibersihkan otomatis; ID yang tidak cocok dengan
  // rencana hari ini hanya disaring untuk tampilan dan perhitungan progress.
  const sanitizedLog = useMemo(
    () => (log ? sanitizeCompletionLog(log, allTaskIds) : null),
    [log, allTaskIds],
  );
  const completedIds = sanitizedLog?.completedTaskIds ?? [];
  const progressPercent =
    allTaskIds.length > 0
      ? Math.round((completedIds.length / allTaskIds.length) * 100)
      : 0;

  // ── Pergantian hari saat app tetap terbuka ────────────
  useEffect(() => {
    const refreshDate = () => {
      const current = todayKey();
      setDateKey((prev) => (prev === current ? prev : current));
    };

    let timer = window.setTimeout(function tick() {
      refreshDate();
      timer = window.setTimeout(tick, msUntilNextMidnight());
    }, msUntilNextMidnight());

    const handleVisibility = () => {
      if (!document.hidden) refreshDate();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", refreshDate);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", refreshDate);
    };
  }, []);

  // ── Load data ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [userPrefs, completionLog, streakCount] = await Promise.all([
          getUserPreferences(),
          getCompletionLog(dateKey),
          getStreak(dateKey),
        ]);
        setPrefs(userPrefs);
        setLog(
          completionLog ?? {
            dateKey,
            completedTaskIds: [],
            skippedTaskIds: [],
            notes: "",
            lastUpdated: Date.now(),
          },
        );
        setStreak(streakCount);
      } catch (e) {
        console.error("Failed to load tracker data:", e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dateKey]);

  // ── Start Obsidian sync scheduler (once) ─────────────
  useEffect(() => {
    const stop = startSyncScheduler();
    return stop;
  }, []);

  // ── Actions ───────────────────────────────────────────
  const persistLog = useCallback(
    async (newLog: CompletionLog) => {
      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
      // Enqueue Obsidian sync setelah log berubah
      enqueueSyncForDate(dateKey);
    },
    [dateKey],
  );

  const currentLog = log && log.dateKey === dateKey ? log : null;

  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!currentLog) return;

      const isCompleted = currentLog.completedTaskIds.includes(taskId);
      const newCompleted = isCompleted
        ? currentLog.completedTaskIds.filter((id) => id !== taskId)
        : [...currentLog.completedTaskIds, taskId];

      await persistLog({ ...currentLog, completedTaskIds: newCompleted, lastUpdated: Date.now() });
    },
    [currentLog, persistLog],
  );

  const updateNotes = useCallback(
    async (notes: string) => {
      if (!currentLog) return;
      await persistLog({ ...currentLog, notes, lastUpdated: Date.now() });
    },
    [currentLog, persistLog],
  );

  const updateSkinReaction = useCallback(
    async (reaction: CompletionLog["skinReaction"]) => {
      if (!currentLog) return;
      await persistLog({ ...currentLog, skinReaction: reaction, lastUpdated: Date.now() });
    },
    [currentLog, persistLog],
  );

  const toggleOutdoor = useCallback(async () => {
    if (!prefs) return;
    const newPrefs = { ...prefs, isOutdoor: !prefs.isOutdoor };
    setPrefs(newPrefs);
    await saveUserPreferences({ isOutdoor: !prefs.isOutdoor });
  }, [prefs]);

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      if (!prefs) return;
      const newPrefs = { ...prefs, notificationsEnabled: enabled };
      setPrefs(newPrefs);
      await saveUserPreferences({ notificationsEnabled: enabled });
    },
    [prefs],
  );

  return {
    dateKey,
    dayIndex,
    prefs,
    log: sanitizedLog,
    streak,
    loading,
    baseExercise,
    exercise,
    skincare,
    mealPlan,
    supplementSchedule,
    fastingContext,
    allTasks,
    allTaskIds,
    completedIds,
    progressPercent,
    isFastingDay,
    isFastingPrepDay,
    toggleTask,
    updateNotes,
    updateSkinReaction,
    toggleOutdoor,
    setNotificationsEnabled,
  };
}
