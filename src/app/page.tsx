"use client";

import { useState } from "react";
import { Flame, MapPin } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ProgressBar from "@/components/ui/ProgressBar";
import ExerciseCard from "@/components/dashboard/ExerciseCard";
import SkincareCard from "@/components/dashboard/SkincareCard";
import SupplementCard from "@/components/dashboard/SupplementCard";
import MealCard from "@/components/dashboard/MealCard";
import FastingCard from "@/components/dashboard/FastingCard";
import AppActionsCard from "@/components/pwa/AppActionsCard";
import { useTracker } from "@/hooks/useTracker";
import { formatDate, getDayTypeIcon, getDayTypeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const {
    dateKey,
    dayIndex,
    prefs,
    streak,
    loading,
    fastingContext,
    exercise,
    skincare,
    mealPlan,
    isFastingDay,
    isFastingPrepDay,
    progressPercent,
    completedIds,
    allTaskIds,
    toggleOutdoor,
    setNotificationsEnabled,
    supplementSchedule,
  } = useTracker();

  const [activeTab, setActiveTab] = useState<
    "overview" | "exercise" | "nutrition" | "skincare" | "supplements"
  >("overview");

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-jade-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-gray-500 font-display">Memuat data...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">
                {getDayTypeIcon(exercise?.type ?? "rest_fasting")}
              </span>
              <span className="text-xs font-display font-semibold uppercase tracking-wider text-gray-500">
                {getDayTypeLabel(exercise?.type ?? "rest_fasting")}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-100">
              arunav2
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(dateKey)}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-900/40 border border-orange-800/50">
                <Flame size={13} className="text-orange-400" />
                <span className="text-xs font-display font-bold text-orange-300">
                  {streak}
                </span>
              </div>
            )}

            {/* Outdoor toggle */}
            <button
              onClick={toggleOutdoor}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-display font-semibold transition-all",
                prefs?.isOutdoor
                  ? "bg-yellow-900/50 border-yellow-700/50 text-yellow-300"
                  : "bg-night-800/60 border-night-700/50 text-gray-500"
              )}
            >
              <MapPin size={11} />
              {prefs?.isOutdoor ? "Outdoor" : "Indoor"}
            </button>
          </div>
        </div>

        {/* Daily progress */}
        <div className="mt-4">
          <ProgressBar
            percent={progressPercent}
            label="Progress Hari Ini"
            sublabel={`${completedIds.length}/${allTaskIds.length} tugas`}
            height="thick"
          />
        </div>
      </header>

      {/* Fasting / prep alert */}
      {(isFastingDay || isFastingPrepDay) && (
        <div className="px-5 mb-4">
          <FastingCard fastingContext={fastingContext} />
        </div>
      )}

      <div className="px-5 mb-4">
        <AppActionsCard
          dateKey={dateKey}
          fastingContext={fastingContext}
          notificationsEnabled={!!prefs?.notificationsEnabled}
          supplements={supplementSchedule.supplements}
          onNotificationSettingChange={setNotificationsEnabled}
        />
      </div>

      {/* Tab bar */}
      <div className="px-5 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { key: "overview", label: "Ringkasan" },
              { key: "exercise", label: "Latihan" },
              { key: "nutrition", label: "Makan" },
              { key: "skincare", label: "Skincare" },
              { key: "supplements", label: "Suplemen" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all",
                activeTab === key
                  ? "bg-jade-800/70 text-jade-300 border border-jade-700/60"
                  : "bg-night-800/60 text-gray-500 border border-night-700/50"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 space-y-4">
        {/* Overview */}
        {activeTab === "overview" && (
          <>
            {exercise && <ExerciseCard exercise={exercise} />}
            {mealPlan && <MealCard mealPlan={mealPlan} fastingContext={fastingContext} />}
            {skincare && (
              <SkincareCard skincare={skincare} isOutdoor={prefs?.isOutdoor} />
            )}
            <SupplementCard
              schedule={supplementSchedule}
              fastingContext={fastingContext}
            />
          </>
        )}

        {activeTab === "exercise" && exercise && (
          <ExerciseCard exercise={exercise} />
        )}
        {activeTab === "nutrition" && mealPlan && (
          <MealCard mealPlan={mealPlan} fastingContext={fastingContext} />
        )}
        {activeTab === "skincare" && skincare && (
          <SkincareCard skincare={skincare} isOutdoor={prefs?.isOutdoor} />
        )}
        {activeTab === "supplements" && (
          <SupplementCard
            schedule={supplementSchedule}
            fastingContext={fastingContext}
          />
        )}

        {/* Siklus info */}
        <div className="card p-3">
          <p className="text-xs text-gray-600 text-center">
            Siklus Hari ke-<span className="text-jade-500 font-bold">{dayIndex}</span> dari 7 ·{" "}
            <span className="text-gray-500">Program berjalan sejak</span>{" "}
            <span className="text-jade-600">{prefs?.startDate ?? "—"}</span>
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
