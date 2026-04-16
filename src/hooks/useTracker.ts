"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCompletionLog,
  saveCompletionLog,
  getUserPreferences,
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
import {
  hasCompletionLogTaskMismatch,
  sanitizeCompletionLog,
} from "@/lib/completion";
// ── Obsidian sync ────────────────────────────────────────
import { enqueueSyncForDate, startSyncScheduler } from "@/lib/githubSync";
import type { DayIndex, CompletionLog, UserPreferences } from "@/types";

export function useTracker() {
  const [dateKey] = useState(todayKey);
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
  const exercise = getExercisePlanForDate(dayIndex, dateKey, prefs);
  const mealPlan = getMealPlanForDate(dayIndex, dateKey, prefs);
  const supplementSchedule = getSupplementScheduleForDate(
    dayIndex,
    dateKey,
    prefs,
  );

  const allTasks = generateTasks(dayIndex, dateKey, prefs);
  const allTaskIds = allTasks.map((t) => t.id);

  const isFastingDay = !!fastingContext?.isFastingDay;
  const isFastingPrepDay = !!fastingContext?.isFastStartDay;

  const sanitizedLog = log ? sanitizeCompletionLog(log, allTaskIds) : null;
  const completedIds = sanitizedLog?.completedTaskIds ?? [];
  const progressPercent =
    allTaskIds.length > 0
      ? Math.round((completedIds.length / allTaskIds.length) * 100)
      : 0;

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

  // ── Sanitize stale task IDs ───────────────────────────
  useEffect(() => {
    if (!log || allTaskIds.length === 0) return;
    if (!hasCompletionLogTaskMismatch(log, allTaskIds)) return;

    const cleanedLog = sanitizeCompletionLog(log, allTaskIds);
    setLog(cleanedLog);
    void saveCompletionLog(dateKey, cleanedLog);
  }, [log, allTaskIds, dateKey]);

  // ── Start Obsidian sync scheduler (once) ─────────────
  useEffect(() => {
    const stop = startSyncScheduler();
    return stop;
  }, []);

  // ── Actions ───────────────────────────────────────────
  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!sanitizedLog) return;

      const isCompleted = sanitizedLog.completedTaskIds.includes(taskId);
      const newCompleted = isCompleted
        ? sanitizedLog.completedTaskIds.filter((id) => id !== taskId)
        : [...sanitizedLog.completedTaskIds, taskId];

      const newLog: CompletionLog = {
        ...sanitizedLog,
        completedTaskIds: newCompleted,
        lastUpdated: Date.now(),
      };

      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);

      // Enqueue Obsidian sync setelah task berubah
      enqueueSyncForDate(dateKey);
    },
    [sanitizedLog, dateKey],
  );

  const updateNotes = useCallback(
    async (notes: string) => {
      if (!sanitizedLog) return;
      const newLog: CompletionLog = {
        ...sanitizedLog,
        notes,
        lastUpdated: Date.now(),
      };
      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
      enqueueSyncForDate(dateKey);
    },
    [sanitizedLog, dateKey],
  );

  const updateSkinReaction = useCallback(
    async (reaction: CompletionLog["skinReaction"]) => {
      if (!sanitizedLog) return;
      const newLog: CompletionLog = {
        ...sanitizedLog,
        skinReaction: reaction,
        lastUpdated: Date.now(),
      };
      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
      enqueueSyncForDate(dateKey);
    },
    [sanitizedLog, dateKey],
  );

  const toggleOutdoor = useCallback(async () => {
    if (!prefs) return;
    const newPrefs = { ...prefs, isOutdoor: !prefs.isOutdoor };
    setPrefs(newPrefs);
    const { saveUserPreferences } = await import("@/lib/firebase");
    await saveUserPreferences({ isOutdoor: !prefs.isOutdoor });
  }, [prefs]);

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      if (!prefs) return;
      const newPrefs = { ...prefs, notificationsEnabled: enabled };
      setPrefs(newPrefs);
      const { saveUserPreferences } = await import("@/lib/firebase");
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
