"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCompletionLog,
  saveCompletionLog,
  getUserPreferences,
  getStreak,
} from "@/lib/firebase";
import { todayKey, calendarDayToCycleDay, generateTasks } from "@/lib/utils";
import { EXERCISE_SCHEDULE } from "@/data/fitness-seed";
import { SKINCARE_SCHEDULE } from "@/data/skincare-seed";
import { MEAL_PLANS, SUPPLEMENT_SCHEDULES } from "@/data/fitness-seed";
import type { DayIndex, CompletionLog, UserPreferences } from "@/types";

export function useTracker() {
  const [dateKey] = useState(todayKey);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [log, setLog] = useState<CompletionLog | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Derive cycle day from start date
  const dayIndex: DayIndex = prefs
    ? calendarDayToCycleDay(dateKey, prefs.startDate)
    : 1;

  // Get today's data
  const exercise = EXERCISE_SCHEDULE.find((e) => e.dayIndex === dayIndex)!;
  const skincare = SKINCARE_SCHEDULE.find((s) => s.dayIndex === dayIndex)!;
  const mealPlan = MEAL_PLANS.find((m) => m.dayIndex === dayIndex) || MEAL_PLANS[0];
  const supplementSchedule =
    SUPPLEMENT_SCHEDULES.find((s) => s.dayIndex === dayIndex) ||
    SUPPLEMENT_SCHEDULES[0];

  // Generate all task IDs for today
  const allTasks = generateTasks(dayIndex, dateKey);
  const allTaskIds = allTasks.map((t) => t.id);

  // Check if fasting day (Selasa = dayIndex 2)
  const isFastingDay = dayIndex === 2;
  // Check if fasting prep day (Minggu = dayIndex 7)
  const isFastingPrepDay = dayIndex === 7;

  // Computed progress
  const completedIds = log?.completedTaskIds ?? [];
  const progressPercent =
    allTaskIds.length > 0
      ? Math.round((completedIds.length / allTaskIds.length) * 100)
      : 0;

  // Load initial data
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
          }
        );
        setStreak(streakCount);
      } catch (e) {
        console.error("Failed to load tracker data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateKey]);

  // Toggle task completion
  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!log) return;

      const isCompleted = log.completedTaskIds.includes(taskId);
      const newCompleted = isCompleted
        ? log.completedTaskIds.filter((id) => id !== taskId)
        : [...log.completedTaskIds, taskId];

      const newLog: CompletionLog = {
        ...log,
        completedTaskIds: newCompleted,
        lastUpdated: Date.now(),
      };

      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
    },
    [log, dateKey]
  );

  // Update notes
  const updateNotes = useCallback(
    async (notes: string) => {
      if (!log) return;
      const newLog: CompletionLog = {
        ...log,
        notes,
        lastUpdated: Date.now(),
      };
      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
    },
    [log, dateKey]
  );

  // Update skin reaction
  const updateSkinReaction = useCallback(
    async (reaction: CompletionLog["skinReaction"]) => {
      if (!log) return;
      const newLog: CompletionLog = {
        ...log,
        skinReaction: reaction,
        lastUpdated: Date.now(),
      };
      setLog(newLog);
      await saveCompletionLog(dateKey, newLog);
    },
    [log, dateKey]
  );

  // Toggle outdoor mode
  const toggleOutdoor = useCallback(async () => {
    if (!prefs) return;
    const newPrefs = { ...prefs, isOutdoor: !prefs.isOutdoor };
    setPrefs(newPrefs);
    const { saveUserPreferences } = await import("@/lib/firebase");
    await saveUserPreferences({ isOutdoor: !prefs.isOutdoor });
  }, [prefs]);

  return {
    dateKey,
    dayIndex,
    prefs,
    log,
    streak,
    loading,
    exercise,
    skincare,
    mealPlan,
    supplementSchedule,
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
  };
}
