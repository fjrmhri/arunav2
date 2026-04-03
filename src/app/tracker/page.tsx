"use client";

import { useState } from "react";
import { StickyNote, Droplets, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import ProgressBar from "@/components/ui/ProgressBar";
import ChecklistItem from "@/components/ui/ChecklistItem";
import { useTracker } from "@/hooks/useTracker";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  exercise: { label: "Latihan", icon: "💪", color: "text-jade-400" },
  nutrition: { label: "Nutrisi & Makan", icon: "🍽️", color: "text-earth-400" },
  supplement: { label: "Suplemen", icon: "💊", color: "text-emerald-400" },
  fasting: { label: "Puasa 36 Jam", icon: "⏳", color: "text-indigo-300" },
  skincare_am: { label: "Skincare Pagi", icon: "☀️", color: "text-yellow-400" },
  skincare_pm: { label: "Skincare Malam", icon: "🌙", color: "text-blue-400" },
  hydration: { label: "Hidrasi", icon: "💧", color: "text-blue-400" },
};

export default function TrackerPage() {
  const {
    dayIndex,
    allTasks,
    completedIds,
    progressPercent,
    log,
    fastingContext,
    skincare,
    toggleTask,
    updateNotes,
    updateSkinReaction,
    loading,
  } = useTracker();

  const [notesValue, setNotesValue] = useState(log?.notes ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Group tasks by category
  const grouped = allTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof allTasks>);

  const categories = Object.keys(grouped);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-jade-500 border-t-transparent animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleNotesSave = async () => {
    await updateNotes(notesValue);
  };

  return (
    <div className="flex flex-col min-h-screen pb-28">
      <Header
        title="Daily Tracker"
        subtitle={`Hari ke-${dayIndex} dari siklus 7 hari`}
      />

      <div className="px-5 space-y-5">
        {/* Progress */}
        <div className="card p-4">
          <ProgressBar
            percent={progressPercent}
            label="Progress Hari Ini"
            sublabel={`${completedIds.length} dari ${allTasks.length} tugas selesai`}
            height="thick"
          />

          {/* Category filter */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-display font-semibold transition-all",
                activeCategory === null
                  ? "bg-jade-800/70 text-jade-300 border border-jade-700/60"
                  : "bg-night-800/60 text-gray-500 border border-night-700/50"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_LABELS[cat];
              if (!meta) return null;
              const catCompleted = grouped[cat].filter((t) =>
                completedIds.includes(t.id)
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1 rounded-full text-xs font-display font-semibold transition-all whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-jade-800/70 text-jade-300 border border-jade-700/60"
                      : "bg-night-800/60 text-gray-500 border border-night-700/50"
                  )}
                >
                  {meta.icon} {meta.label} {catCompleted}/{grouped[cat].length}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fasting day note */}
        {fastingContext?.isStrictFastDay && (
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">⏳</span>
              <div>
                <p className="text-sm font-display font-semibold text-indigo-300">
                  Puasa 36 Jam Sedang Aktif
                </p>
                <p className="text-xs text-indigo-400/80 mt-0.5">
                  Tanpa kalori sampai refeeding selesai. Prioritaskan 3–4 liter air, elektrolit bila perlu, dan hindari latihan berat.
                </p>
              </div>
            </div>
          </div>
        )}

        {fastingContext?.isFastStartDay && !fastingContext.isStrictFastDay && (
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/50 p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">🌙</span>
              <div>
                <p className="text-sm font-display font-semibold text-indigo-300">
                  Puasa Mulai Pukul 20:00
                </p>
                <p className="text-xs text-indigo-400/80 mt-0.5">
                  Jadikan makan malam sebagai makan terakhir pra-puasa, siapkan air mineral, dan jaga latihan tetap moderat.
                </p>
              </div>
            </div>
          </div>
        )}

        {fastingContext?.isRefeedDay && !fastingContext.isActiveFastingWindow && (
          <div className="rounded-2xl border border-jade-800/60 bg-jade-950/40 p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">🍲</span>
              <div>
                <p className="text-sm font-display font-semibold text-jade-300">
                  Refeeding Day
                </p>
                <p className="text-xs text-jade-300/80 mt-0.5">
                  Buka dengan bone broth / putih telur, lanjutkan oatmeal + telur, lalu tahan latihan berat sampai energi stabil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recovery day note */}
        {skincare?.isRecoveryDay && (
          <div className="rounded-2xl border border-teal-800/60 bg-teal-950/40 p-4">
            <p className="text-sm font-display font-semibold text-teal-300">
              🌿 Hari Pemulihan Skincare
            </p>
            <p className="text-xs text-teal-400/80 mt-0.5">
              Tidak ada bahan aktif keras malam ini. Hanya Blueberry Ceramide sebagai terapi tunggal.
            </p>
          </div>
        )}

        {/* Checklists by category */}
        {categories.map((cat) => {
          const meta = CATEGORY_LABELS[cat] ?? { label: cat, icon: "📋", color: "text-gray-400" };
          const tasks = grouped[cat];
          if (activeCategory && activeCategory !== cat) return null;

          const catCompleted = tasks.filter((t) => completedIds.includes(t.id)).length;
          const catPercent = Math.round((catCompleted / tasks.length) * 100);

          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <span className={cn("text-xs font-display font-semibold uppercase tracking-wide", meta.color)}>
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs font-display text-gray-600">
                  {catCompleted}/{tasks.length}
                </span>
              </div>

              <div className="h-0.5 rounded-full bg-night-700/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-jade-700/60 transition-all duration-500"
                  style={{ width: `${catPercent}%` }}
                />
              </div>

              <div className="space-y-1">
                {tasks.map((task) => (
                  <ChecklistItem
                    key={task.id}
                    id={task.id}
                    label={task.label}
                    detail={task.detail}
                    checked={completedIds.includes(task.id)}
                    onToggle={toggleTask}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Skin reaction tracker */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-yellow-500" />
            <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
              Reaksi Kulit Hari Ini
            </span>
          </div>
          <div className="flex gap-2">
            {(["none", "mild", "severe"] as const).map((r) => (
              <button
                key={r}
                onClick={() => updateSkinReaction(r)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-display font-semibold border transition-all",
                  log?.skinReaction === r
                    ? r === "none"
                      ? "bg-jade-900/60 border-jade-700 text-jade-300"
                      : r === "mild"
                      ? "bg-yellow-900/60 border-yellow-700 text-yellow-300"
                      : "bg-red-900/60 border-red-700 text-red-300"
                    : "bg-night-800/40 border-night-700/40 text-gray-600"
                )}
              >
                {r === "none" ? "✅ Normal" : r === "mild" ? "⚠️ Ringan" : "🔴 Parah"}
              </button>
            ))}
          </div>
          {log?.skinReaction === "severe" && (
            <div className="mt-2 rounded-lg bg-red-950/40 border border-red-800/50 p-2.5">
              <p className="text-xs text-red-400">
                ⚠️ Aktifkan Washout Routine: Hentikan semua AHA/BHA Toner, Serum 10%, dan Clay Mask selama 5–7 hari. Hanya gunakan Makarizo Facial Wash + Blueberry Ceramide + Azarine SPF45.
              </p>
            </div>
          )}
        </div>

        {/* Hydration tracker */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
              Catatan Hidrasi
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Target: {fastingContext?.isFastingDay ? "3–4 liter (hari puasa / refeed)" : "2–3 liter per hari"}
          </p>
          {fastingContext?.isFastingDay && (
            <p className="text-xs text-indigo-400 mt-1">
              Tambahkan 1/4 sdt garam laut ke dalam air mineral untuk elektrolit
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={14} className="text-gray-500" />
            <span className="text-xs font-display font-semibold uppercase tracking-wide text-gray-500">
              Catatan Harian
            </span>
          </div>
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesSave}
            placeholder="Tulis catatan, observasi tubuh, atau keluhan hari ini..."
            rows={4}
            className="w-full bg-night-800/60 border border-night-700/40 rounded-xl p-3 text-sm text-gray-300 placeholder:text-gray-700 resize-none focus:outline-none focus:border-jade-700/50 transition-colors"
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
