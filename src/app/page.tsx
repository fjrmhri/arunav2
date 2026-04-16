"use client";

import { useState } from "react";
import { MapPin, Bell, BellOff } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ExerciseCard from "@/components/dashboard/ExerciseCard";
import SkincareCard from "@/components/dashboard/SkincareCard";
import SupplementCard from "@/components/dashboard/SupplementCard";
import MealCard from "@/components/dashboard/MealCard";
import FastingCard from "@/components/dashboard/FastingCard";
import AppActionsCard from "@/components/pwa/AppActionsCard";
import { useTracker } from "@/hooks/useTracker";
import { formatDate, getDayTypeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview",     label: "Ringkasan" },
  { key: "exercise",     label: "Latihan" },
  { key: "nutrition",    label: "Nutrisi" },
  { key: "skincare",     label: "Skincare" },
  { key: "supplements",  label: "Suplemen" },
] as const;

type Tab = typeof TABS[number]["key"];

export default function DashboardPage() {
  const {
    dateKey, prefs, streak, loading, fastingContext, exercise, skincare,
    mealPlan, isFastingDay, isFastingPrepDay, progressPercent,
    completedIds, allTaskIds, toggleOutdoor, setNotificationsEnabled,
    supplementSchedule,
  } = useTracker();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 rounded-full border border-t-transparent animate-spin mx-auto"
                 style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Memuat...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const dayLabel = getDayTypeLabel(exercise?.type ?? "rest_fasting");

  return (
    <div className="flex flex-col min-h-screen pb-28">

      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-4">
        {/* Baris atas: nama app + tanggal */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              arunav2
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {formatDate(dateKey)}
            </p>
          </div>

          {/* Kontrol kanan */}
          <div className="flex items-center gap-2 mt-1">
            {streak > 0 && (
              <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {streak}🔥
              </span>
            )}
            <button
              onClick={toggleOutdoor}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-semibold transition-all"
              style={{
                background: prefs?.isOutdoor ? "var(--bg-elevated)" : "transparent",
                border: "1px solid var(--border)",
                color: prefs?.isOutdoor ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <MapPin size={10} />
              {prefs?.isOutdoor ? "Outdoor" : "Indoor"}
            </button>
          </div>
        </div>

        {/* Ringkasan harian — sederhana */}
        <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label mb-1">Hari ini</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{dayLabel}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {skincare?.dayName ?? "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                {progressPercent}%
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {completedIds.length}/{allTaskIds.length} tugas
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 rounded-full h-1.5 overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progressPercent, 100)}%`, background: "var(--text-primary)" }}
            />
          </div>
        </div>
      </header>

      {/* ── Fasting alert ── */}
      {(isFastingDay || isFastingPrepDay) && (
        <div className="px-5 mb-3">
          <FastingCard fastingContext={fastingContext} />
        </div>
      )}

      {/* ── Reminder / notifikasi ── */}
      <div className="px-5 mb-3">
        <AppActionsCard
          dateKey={dateKey}
          fastingContext={fastingContext}
          notificationsEnabled={!!prefs?.notificationsEnabled}
          supplements={supplementSchedule.supplements}
          onNotificationSettingChange={setNotificationsEnabled}
          digestInfo={{
            dayLabel: getDayTypeLabel(exercise?.type ?? "rest_fasting"),
            taskCount: allTaskIds.length,
            fastingStatus: isFastingDay
              ? "Puasa aktif"
              : isFastingPrepDay
              ? "Persiapan puasa"
              : "Hari normal",
          }}
        />
      </div>

      {/* ── Tab bar ── */}
      <div className="px-5 mb-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn("tab-pill", activeTab === key && "active")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="px-5 space-y-3">
        {activeTab === "overview" && (
          <>
            {exercise && <ExerciseCard exercise={exercise} />}
            {mealPlan && <MealCard mealPlan={mealPlan} fastingContext={fastingContext} />}
            {skincare && <SkincareCard skincare={skincare} isOutdoor={prefs?.isOutdoor} />}
            <SupplementCard schedule={supplementSchedule} fastingContext={fastingContext} />
          </>
        )}
        {activeTab === "exercise" && exercise && <ExerciseCard exercise={exercise} />}
        {activeTab === "nutrition" && mealPlan && <MealCard mealPlan={mealPlan} fastingContext={fastingContext} />}
        {activeTab === "skincare" && skincare && <SkincareCard skincare={skincare} isOutdoor={prefs?.isOutdoor} />}
        {activeTab === "supplements" && (
          <SupplementCard schedule={supplementSchedule} fastingContext={fastingContext} />
        )}

        {/* Info siklus */}
        <p className="text-center text-[11px] pb-2" style={{ color: "var(--text-muted)" }}>
          Sejak {prefs?.startDate ?? "—"}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
